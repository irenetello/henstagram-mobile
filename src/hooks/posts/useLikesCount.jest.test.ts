/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useLikesCount } from "./useLikesCount";

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "likes-col-ref"),
  onSnapshot: jest.fn(),
  query: jest.fn(() => "likes-query-ref"),
}));

import { onSnapshot } from "firebase/firestore";
const mockOnSnapshot = onSnapshot as jest.Mock;

describe("useLikesCount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 0 and does not subscribe when postId is null", () => {
    const { result } = renderHook(() => useLikesCount(null));

    expect(result.current).toBe(0);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("updates count from likes snapshot size", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({ size: 7 });
      return unsubscribe;
    });

    const { result } = renderHook(() => useLikesCount("post-1"));

    await waitFor(() => {
      expect(result.current).toBe(7);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useLikesCount("post-1"));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
