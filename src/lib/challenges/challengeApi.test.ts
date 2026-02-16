import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

vi.mock("@/src/lib/challenges/challengeModel", () => ({
  mapChallenge: vi.fn((id: string, data: any) => ({ id, ...data })),
}));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => "collection-ref"),
  doc: vi.fn(() => "doc-ref"),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(() => "orderBy-ref"),
  query: vi.fn(() => "query-ref"),
  serverTimestamp: vi.fn(() => "server-ts"),
  Timestamp: {
    fromMillis: vi.fn((value: number) => ({ __ts: value })),
  },
  updateDoc: vi.fn(),
  where: vi.fn(() => "where-ref"),
}));

import {
  addDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { mapChallenge } from "@/src/lib/challenges/challengeModel";
import {
  activateChallenge,
  createChallenge,
  endChallengeNow,
  getChallengeById,
  softDeleteChallenge,
  subscribeActiveChallenges,
} from "./challengeApi";

describe("challengeApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribeActiveChallenges maps docs and returns unsubscribe", () => {
    const unsubscribe = vi.fn();
    (onSnapshot as any).mockImplementation((_q: unknown, onNext: any) => {
      onNext({
        docs: [
          { id: "c1", data: () => ({ title: "A" }) },
          { id: "c2", data: () => ({ title: "B" }) },
        ],
      });
      return unsubscribe;
    });

    const cb = vi.fn();
    const out = subscribeActiveChallenges(cb);

    expect(mapChallenge).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith([
      { id: "c1", title: "A" },
      { id: "c2", title: "B" },
    ]);
    expect(out).toBe(unsubscribe);
  });

  it("subscribeActiveChallenges returns empty list on snapshot error", () => {
    (onSnapshot as any).mockImplementation((_q: unknown, _onNext: any, onError: any) => {
      onError(new Error("boom"));
      return vi.fn();
    });

    const cb = vi.fn();
    subscribeActiveChallenges(cb);

    expect(cb).toHaveBeenCalledWith([]);
  });

  it("getChallengeById returns null when challenge does not exist", async () => {
    (getDoc as any).mockResolvedValueOnce({ exists: () => false });

    const out = await getChallengeById("c1");

    expect(out).toBeNull();
  });

  it("getChallengeById maps challenge when exists", async () => {
    (getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      id: "c2",
      data: () => ({ title: "FromDoc" }),
    });

    const out = await getChallengeById("c2");

    expect(mapChallenge).toHaveBeenCalledWith("c2", { title: "FromDoc" });
    expect(out).toEqual({ id: "c2", title: "FromDoc" });
  });

  it("createChallenge stores normalized challenge payload", async () => {
    await createChallenge({
      title: "T",
      prompt: "P",
      createdByUid: "u1",
    });

    expect(serverTimestamp).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: "T",
        prompt: "P",
        createdByUid: "u1",
        createdByName: null,
        coverImageUrl: null,
        startAt: null,
        endAt: null,
        isDeleted: false,
        deletedAt: null,
        deletedByUid: null,
      }),
    );
  });

  it("activateChallenge sets null endAt when duration is null", async () => {
    await activateChallenge({ challengeId: "c1", durationMs: null });

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ startAt: "server-ts", endAt: null }),
    );
  });

  it("activateChallenge clamps negative duration to now", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1000);

    await activateChallenge({ challengeId: "c1", durationMs: -5000 });

    expect(Timestamp.fromMillis).toHaveBeenCalledWith(1000);
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ endAt: { __ts: 1000 } }),
    );
  });

  it("softDeleteChallenge updates deletion fields", async () => {
    await softDeleteChallenge({ challengeId: "c1", deletedByUid: "admin" });

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isDeleted: true,
        deletedAt: "server-ts",
        deletedByUid: "admin",
      }),
    );
  });

  it("endChallengeNow sets endAt to server timestamp", async () => {
    await endChallengeNow({ challengeId: "c1" });

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ endAt: "server-ts" }),
    );
  });
});
