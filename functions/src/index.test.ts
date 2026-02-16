import { beforeEach, describe, expect, it, vi } from "vitest";

const H = vi.hoisted(() => {
  const mockUpdate = vi.fn();
  const mockDoc = vi.fn(() => ({ update: mockUpdate }));
  const mockGet = vi.fn();
  const mockTxUpdate = vi.fn();
  const mockRunTransaction = vi.fn(async (fn: any) =>
    fn({ get: mockGet, update: mockTxUpdate }),
  );
  const mockUsersGet = vi.fn();
  const mockCollection = vi.fn(() => ({ get: mockUsersGet }));
  const mockIncrement = vi.fn((n: number) => ({ __increment: n }));

  return {
    mockUpdate,
    mockDoc,
    mockGet,
    mockTxUpdate,
    mockRunTransaction,
    mockUsersGet,
    mockCollection,
    mockIncrement,
    mockDb: {
      doc: mockDoc,
      runTransaction: mockRunTransaction,
      collection: mockCollection,
    },
  };
});

vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => H.mockDb),
  FieldValue: {
    increment: (...args: any[]) => H.mockIncrement(...args),
  },
}));

vi.mock("firebase-functions/v2/firestore", () => ({
  onDocumentCreated: vi.fn((_path: string, handler: any) => handler),
  onDocumentDeleted: vi.fn((_path: string, handler: any) => handler),
  onDocumentUpdated: vi.fn((_path: string, handler: any) => handler),
}));

vi.mock("./notifications", () => ({
  sendExpoPush: vi.fn(),
}));

import { sendExpoPush } from "./notifications";
import {
  onChallengeActivated,
  onCommentCreated,
  onCommentDeleted,
} from "./index";

describe("functions/index triggers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("onCommentCreated increments commentsCount", async () => {
    await onCommentCreated({ params: { postId: "post-1" } } as any);

    expect(H.mockIncrement).toHaveBeenCalledWith(1);
    expect(H.mockDoc).toHaveBeenCalledWith("posts/post-1");
    expect(H.mockUpdate).toHaveBeenCalledWith({ commentsCount: { __increment: 1 } });
  });

  it("onCommentDeleted decrements commentsCount with floor at zero", async () => {
    H.mockGet.mockResolvedValueOnce({ data: () => ({ commentsCount: 0 }) });

    await onCommentDeleted({ params: { postId: "post-2" } } as any);

    expect(H.mockTxUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ commentsCount: 0 }),
    );
  });

  it("onCommentDeleted decrements positive commentsCount", async () => {
    H.mockGet.mockResolvedValueOnce({ data: () => ({ commentsCount: 5 }) });

    await onCommentDeleted({ params: { postId: "post-3" } } as any);

    expect(H.mockTxUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ commentsCount: 4 }),
    );
  });

  it("onCommentDeleted handles missing snapshot data as zero", async () => {
    H.mockGet.mockResolvedValueOnce({ data: () => undefined });

    await onCommentDeleted({ params: { postId: "post-4" } } as any);

    expect(H.mockTxUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ commentsCount: 0 }),
    );
  });

  it("onChallengeActivated exits when before/after is missing", async () => {
    await onChallengeActivated({ data: undefined, params: { challengeId: "c1" } } as any);

    expect(H.mockUsersGet).not.toHaveBeenCalled();
    expect(sendExpoPush).not.toHaveBeenCalled();
  });

  it("onChallengeActivated exits if it was not draft to active transition", async () => {
    await onChallengeActivated({
      params: { challengeId: "c1" },
      data: {
        before: { data: () => ({ startAt: { at: 1 } }) },
        after: { data: () => ({ startAt: { at: 2 } }) },
      },
    } as any);

    expect(H.mockUsersGet).not.toHaveBeenCalled();
    expect(sendExpoPush).not.toHaveBeenCalled();
  });

  it("onChallengeActivated exits when challenge is still draft", async () => {
    await onChallengeActivated({
      params: { challengeId: "c2" },
      data: {
        before: { data: () => ({ startAt: null }) },
        after: { data: () => ({ startAt: null }) },
      },
    } as any);

    expect(H.mockUsersGet).not.toHaveBeenCalled();
    expect(sendExpoPush).not.toHaveBeenCalled();
  });

  it("onChallengeActivated collects valid unique tokens and sends push", async () => {
    H.mockUsersGet.mockResolvedValueOnce({
      docs: [
        { data: () => ({ expoPushTokens: [" token-1 ", "", 123, "token-2"] }) },
        { data: () => ({ expoPushTokens: ["token-2", "token-3"] }) },
        { data: () => ({ expoPushTokens: "invalid" }) },
      ],
    });

    await onChallengeActivated({
      params: { challengeId: "challenge-7" },
      data: {
        before: { data: () => ({ startAt: null, title: "before" }) },
        after: { data: () => ({ startAt: { ts: 1 }, title: "Weekly challenge" }) },
      },
    } as any);

    expect(sendExpoPush).toHaveBeenCalledTimes(1);
    expect(sendExpoPush).toHaveBeenCalledWith([
      {
        to: "token-1",
        title: "New challenge 🔥",
        body: "Weekly challenge",
        data: {
          challengeId: "challenge-7",
          url: "henstagrammobile://challenge/challenge-7",
        },
        sound: "default",
      },
      {
        to: "token-2",
        title: "New challenge 🔥",
        body: "Weekly challenge",
        data: {
          challengeId: "challenge-7",
          url: "henstagrammobile://challenge/challenge-7",
        },
        sound: "default",
      },
      {
        to: "token-3",
        title: "New challenge 🔥",
        body: "Weekly challenge",
        data: {
          challengeId: "challenge-7",
          url: "henstagrammobile://challenge/challenge-7",
        },
        sound: "default",
      },
    ]);
  });

  it("onChallengeActivated uses fallback body when title is not a string", async () => {
    H.mockUsersGet.mockResolvedValueOnce({
      docs: [{ data: () => ({ expoPushTokens: ["token-1"] }) }],
    });

    await onChallengeActivated({
      params: { challengeId: "challenge-8" },
      data: {
        before: { data: () => ({ startAt: null, title: "before" }) },
        after: { data: () => ({ startAt: { ts: 1 }, title: 123 }) },
      },
    } as any);

    expect(sendExpoPush).toHaveBeenCalledWith([
      {
        to: "token-1",
        title: "New challenge 🔥",
        body: "A new challenge is live!",
        data: {
          challengeId: "challenge-8",
          url: "henstagrammobile://challenge/challenge-8",
        },
        sound: "default",
      },
    ]);
  });
});
