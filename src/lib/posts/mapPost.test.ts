import { describe, expect, it } from "vitest";
import { mapPostDoc } from "./mapPost";

const mockDoc: any = {
  id: "post123",
  data: () => ({
    userId: "uid123",
    imageUrl: "https://img",
    caption: "hello",
    createdAt: null,
  }),
};

describe("mapPostDoc", () => {
  it("maps firestore doc to Post", () => {
    const post = mapPostDoc(mockDoc);

    expect(post).toEqual({
      id: "post123",
      userId: "uid123",
      imageUrl: "https://img",
      caption: "hello",
      createdAt: null,
      username: undefined,
      userEmail: undefined,
      storagePath: undefined,
      likesCount: 0,
      commentsCount: 0,
    });
  });
});
