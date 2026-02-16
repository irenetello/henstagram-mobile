/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useChallengePosts } from "./useChallengePosts";

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(() => "orderBy-ref"),
  query: jest.fn(() => "query-ref"),
  where: jest.fn(() => "where-ref"),
}));

import { onSnapshot } from "firebase/firestore";
const mockOnSnapshot = onSnapshot as jest.Mock;

describe("useChallengePosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty list and loading false when challengeId missing", async () => {
    const { result } = renderHook(() => useChallengePosts(""));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual([]);
    });
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("maps posts from snapshot", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({
        docs: [
          { id: "p1", data: () => ({ caption: "a" }) },
          { id: "p2", data: () => ({ caption: "b" }) },
        ],
      });
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallengePosts("ch-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual([
        { id: "p1", caption: "a" },
        { id: "p2", caption: "b" },
      ]);
    });
  });

  it("sets error when snapshot fails", async () => {
    const unsubscribe = jest.fn();
    const err = new Error("oops");
    mockOnSnapshot.mockImplementationOnce((_q: any, _onNext: any, onError: any) => {
      onError(err);
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallengePosts("ch-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(err);
      expect(result.current.posts).toEqual([]);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useChallengePosts("ch-1"));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
