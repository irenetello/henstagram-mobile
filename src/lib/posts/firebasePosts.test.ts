import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../auth", () => ({
  auth: {
    currentUser: { uid: "uid-1", email: "user@mail.com" },
  },
}));

vi.mock("../firebase", () => ({
  storage: { __storage: true },
}));

vi.mock("../users/userApi", () => ({
  getUserProfile: vi.fn(),
}));

vi.mock("./postApi", () => ({
  createPost: vi.fn(),
}));

vi.mock("firebase/storage", () => ({
  ref: vi.fn((_storage: unknown, path: string) => ({ path })),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

import { auth } from "../auth";
import { getUserProfile } from "../users/userApi";
import { createPost } from "./postApi";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { publishPost } from "./firebasePosts";

describe("firebasePosts.publishPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).currentUser = { uid: "uid-1", email: "user@mail.com" };
    vi.spyOn(Date, "now").mockReturnValue(1234567890);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        blob: async () => "blob-data",
      })) as any,
    );
  });

  it("throws when no authenticated user", async () => {
    (auth as any).currentUser = null;

    await expect(publishPost("file://image.jpg", "hello")).rejects.toThrow(
      "User not authenticated",
    );
  });

  it("uploads image and creates post with profile displayName", async () => {
    (getUserProfile as any).mockResolvedValueOnce({ displayName: "Sofi" });
    (getDownloadURL as any).mockResolvedValueOnce("https://cdn/p.jpg");

    await publishPost("file://image.jpg", "caption");

    expect(fetch).toHaveBeenCalledWith("file://image.jpg");
    expect(ref).toHaveBeenCalledWith(expect.anything(), "posts/uid-1/1234567890.jpg");
    expect(uploadBytes).toHaveBeenCalledWith(
      { path: "posts/uid-1/1234567890.jpg" },
      "blob-data",
    );
    expect(createPost).toHaveBeenCalledWith({
      userId: "uid-1",
      imageUrl: "https://cdn/p.jpg",
      caption: "caption",
      storagePath: "posts/uid-1/1234567890.jpg",
      username: "Sofi",
      userEmail: "user@mail.com",
      challengeId: undefined,
      challengeTitle: undefined,
    });
  });

  it("uses undefined username and forwards challenge options", async () => {
    (getUserProfile as any).mockResolvedValueOnce(null);
    (getDownloadURL as any).mockResolvedValueOnce("https://cdn/ch.jpg");

    await publishPost("file://image2.jpg", "cap", {
      challengeId: "challenge-1",
      challengeTitle: "Weekly",
    });

    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        username: undefined,
        challengeId: "challenge-1",
        challengeTitle: "Weekly",
      }),
    );
  });

  it("uses undefined userEmail when current user email is null", async () => {
    (auth as any).currentUser = { uid: "uid-1", email: null };
    (getUserProfile as any).mockResolvedValueOnce({ displayName: "Sofi" });
    (getDownloadURL as any).mockResolvedValueOnce("https://cdn/no-email.jpg");

    await publishPost("file://image3.jpg", "caption");

    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        userEmail: undefined,
      }),
    );
  });
});
