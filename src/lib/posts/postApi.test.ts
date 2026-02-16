import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
  storage: { __storage: true },
}));

vi.mock("@/src/lib/auth", () => ({
  auth: {
    currentUser: { uid: "uid-1" },
  },
}));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => "collection-ref"),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => "doc-ref"),
  getDocs: vi.fn(),
  query: vi.fn(() => "query-ref"),
  serverTimestamp: vi.fn(() => "server-ts"),
  where: vi.fn((...args: any[]) => ({ where: args })),
}));

vi.mock("firebase/storage", () => ({
  deleteObject: vi.fn(),
  ref: vi.fn(() => "storage-ref"),
}));

import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { auth } from "@/src/lib/auth";
import { createPost, deletePost, hasParticipatedInChallenge } from "./postApi";

describe("postApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).currentUser = { uid: "uid-1" };
  });

  describe("deletePost", () => {
    it("deletes storage object and firestore doc when storagePath exists", async () => {
      await deletePost({
        id: "post123",
        storagePath: "posts/uid/file.jpg",
      });

      expect(ref).toHaveBeenCalledTimes(1);
      expect(deleteObject).toHaveBeenCalledTimes(1);
      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });

    it("deletes only firestore doc when storagePath is missing", async () => {
      await deletePost({
        id: "post123",
      });

      expect(deleteObject).not.toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe("createPost", () => {
    it("creates a normal post without challenge", async () => {
      await createPost({
        userId: "uid-1",
        imageUrl: "https://img",
        storagePath: "posts/uid-1/x.jpg",
        caption: "hola",
        username: "sofi",
        userEmail: "sofi@mail.com",
      });

      expect(collection).toHaveBeenCalled();
      expect(serverTimestamp).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: "uid-1",
          imageUrl: "https://img",
          storagePath: "posts/uid-1/x.jpg",
          caption: "hola",
          username: "sofi",
          userEmail: "sofi@mail.com",
          createdAt: "server-ts",
        }),
      );
    });

    it("throws when user already participated in challenge", async () => {
      (getDocs as any).mockResolvedValueOnce({ empty: false });

      await expect(
        createPost({
          userId: "uid-1",
          imageUrl: "https://img",
          storagePath: "posts/uid-1/x.jpg",
          challengeId: "challenge-1",
          challengeTitle: "Reto",
        }),
      ).rejects.toThrow("You already participated in this challenge");

      expect(addDoc).not.toHaveBeenCalled();
    });

    it("creates challenge post when user has not participated", async () => {
      (getDocs as any).mockResolvedValueOnce({ empty: true });

      await createPost({
        userId: "uid-1",
        imageUrl: "https://img",
        storagePath: "posts/uid-1/x.jpg",
        challengeId: "challenge-1",
        challengeTitle: "Reto",
      });

      expect(where).toHaveBeenCalledWith("userId", "==", "uid-1");
      expect(where).toHaveBeenCalledWith("challengeId", "==", "challenge-1");
      expect(query).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          challengeId: "challenge-1",
          challengeTitle: "Reto",
        }),
      );
    });

    it("stores null challengeTitle when omitted", async () => {
      (getDocs as any).mockResolvedValueOnce({ empty: true });

      await createPost({
        userId: "uid-1",
        imageUrl: "https://img",
        storagePath: "posts/uid-1/x.jpg",
        challengeId: "challenge-2",
      });

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          challengeId: "challenge-2",
          challengeTitle: null,
        }),
      );
    });
  });

  describe("hasParticipatedInChallenge", () => {
    it("returns false when there is no current user", async () => {
      (auth as any).currentUser = null;

      const result = await hasParticipatedInChallenge("challenge-1");

      expect(result).toBe(false);
      expect(getDocs).not.toHaveBeenCalled();
    });

    it("returns false when query is empty", async () => {
      (getDocs as any).mockResolvedValueOnce({ empty: true });

      const result = await hasParticipatedInChallenge("challenge-1");

      expect(result).toBe(false);
    });

    it("returns true when query has docs", async () => {
      (getDocs as any).mockResolvedValueOnce({ empty: false });

      const result = await hasParticipatedInChallenge("challenge-1");

      expect(result).toBe(true);
    });
  });
});
