import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => "comments-col-ref"),
  serverTimestamp: vi.fn(() => "server-ts"),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => "comment-doc-ref"),
}));

import { addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { addComment, deleteComment } from "./commentApi";

describe("commentApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("addComment stores trimmed text with null user fallbacks", async () => {
    await addComment({
      postId: "post-1",
      userId: "uid-1",
      text: "  hola  ",
    });

    expect(serverTimestamp).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        postId: "post-1",
        userId: "uid-1",
        text: "hola",
        username: null,
        userEmail: null,
        createdAt: "server-ts",
      }),
    );
  });

  it("addComment stores provided username and userEmail", async () => {
    await addComment({
      postId: "post-2",
      userId: "uid-2",
      text: "hello",
      username: "Sofi",
      userEmail: "sofi@mail.com",
    });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        username: "Sofi",
        userEmail: "sofi@mail.com",
      }),
    );
  });

  it("deleteComment removes comment document", async () => {
    await deleteComment({ postId: "post-1", commentId: "c-1" });

    expect(deleteDoc).toHaveBeenCalledWith("comment-doc-ref");
  });
});
