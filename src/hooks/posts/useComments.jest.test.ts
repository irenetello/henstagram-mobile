/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useComments } from "./useComments";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  limit: jest.fn(() => "limit-ref"),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(() => "orderBy-ref"),
  query: jest.fn(() => "query-ref"),
}));

import { onSnapshot } from "firebase/firestore";

const mockOnSnapshot = onSnapshot as jest.Mock;

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

describe("useComments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not subscribe when postId is null", () => {
    const { result } = renderHook(() => useComments(null));

    expect(mockOnSnapshot).not.toHaveBeenCalled();
    expect(result.current.comments).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it("maps snapshot docs and stops loading", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({
        docs: [
          { id: "c1", data: () => ({ userId: "u1", text: "hola" }) },
          { id: "c2", data: () => ({ userId: "u2", text: "hey" }) },
        ],
      });
      return unsubscribe;
    });

    const { result } = renderHook(() => useComments("post-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.comments).toEqual([
        { id: "c1", userId: "u1", text: "hola" },
        { id: "c2", userId: "u2", text: "hey" },
      ]);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useComments("post-2"));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
