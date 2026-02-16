/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { usePosts } from "./usePosts";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  limit: jest.fn(() => "limit-ref"),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(() => "orderBy-ref"),
  query: jest.fn(() => "query-ref"),
}));

import { onSnapshot } from "firebase/firestore";

const mockOnSnapshot = onSnapshot as jest.Mock;

jest.mock("../../lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("@/src/lib/posts/mapPost", () => ({
  mapPostDoc: jest.fn((doc: any) => ({ id: doc.id, mapped: true })),
}));

import { mapPostDoc } from "@/src/lib/posts/mapPost";

const mockMapPostDoc = mapPostDoc as jest.Mock;

describe("usePosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps snapshot docs and stops loading", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({ docs: [{ id: "p1" }, { id: "p2" }] });
      return unsubscribe;
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual([
        { id: "p1", mapped: true },
        { id: "p2", mapped: true },
      ]);
    });

    expect(mockMapPostDoc).toHaveBeenCalledTimes(2);
  });

  it("handles snapshot error and stops loading", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, _onNext: any, onError: any) => {
      onError(new Error("boom"));
      return unsubscribe;
    });
    jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual([]);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => usePosts());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
