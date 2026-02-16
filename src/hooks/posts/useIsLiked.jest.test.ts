/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useIsLiked } from "./useIsLiked";

let mockAuthState: { user: { uid: string } | null; initializing: boolean } = {
  user: null,
  initializing: false,
};

jest.mock("@/src/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState,
}));

jest.mock("@/src/lib/posts/likeApi", () => ({
  listenUserLike: jest.fn(),
}));

import { listenUserLike } from "@/src/lib/posts/likeApi";
const mockListenUserLike = listenUserLike as jest.Mock;

describe("useIsLiked", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = { user: null, initializing: false };
  });

  it("returns false and does not subscribe while initializing", () => {
    mockAuthState = { user: null, initializing: true };

    const { result } = renderHook(() => useIsLiked("post-1"));

    expect(result.current).toBe(false);
    expect(mockListenUserLike).not.toHaveBeenCalled();
  });

  it("returns false and does not subscribe when postId is empty", () => {
    mockAuthState = { user: { uid: "u1" }, initializing: false };

    const { result } = renderHook(() => useIsLiked(""));

    expect(result.current).toBe(false);
    expect(mockListenUserLike).not.toHaveBeenCalled();
  });

  it("returns false and does not subscribe when user is missing", () => {
    mockAuthState = { user: null, initializing: false };

    const { result } = renderHook(() => useIsLiked("post-1"));

    expect(result.current).toBe(false);
    expect(mockListenUserLike).not.toHaveBeenCalled();
  });

  it("subscribes and updates liked state", async () => {
    mockAuthState = { user: { uid: "u1" }, initializing: false };
    const unsubscribe = jest.fn();
    mockListenUserLike.mockImplementationOnce(({ onChange }: any) => {
      onChange(true);
      return unsubscribe;
    });

    const { result } = renderHook(() => useIsLiked("post-1"));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
    expect(mockListenUserLike).toHaveBeenCalledWith({
      postId: "post-1",
      userId: "u1",
      onChange: expect.any(Function),
    });
  });

  it("unsubscribes on unmount", () => {
    mockAuthState = { user: { uid: "u1" }, initializing: false };
    const unsubscribe = jest.fn();
    mockListenUserLike.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useIsLiked("post-1"));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
