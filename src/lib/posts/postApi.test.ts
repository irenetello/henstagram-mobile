import { describe, it, expect, vi, beforeEach } from "vitest";
import { deletePost } from "./postApi";

// 🔹 Firestore: mock parcial
vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    deleteDoc: vi.fn(),
    doc: vi.fn(),
  };
});

// 🔹 Storage: mock parcial
vi.mock("firebase/storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/storage")>();
  return {
    ...actual,
    deleteObject: vi.fn(),
    ref: vi.fn(),
  };
});

import { deleteDoc } from "firebase/firestore";
import { deleteObject } from "firebase/storage";

describe("deletePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes storage object and firestore doc when storagePath exists", async () => {
    await deletePost({
      id: "post123",
      storagePath: "posts/uid/file.jpg",
    });

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
