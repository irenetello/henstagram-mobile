/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useChallenges } from "./useChallenges";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(() => "orderBy-ref"),
  query: jest.fn(() => "query-ref"),
  where: jest.fn(() => "where-ref"),
}));

import { onSnapshot } from "firebase/firestore";

const mockOnSnapshot = onSnapshot as jest.Mock;

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

describe("useChallenges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads active challenges from snapshot", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({
        docs: [
          { id: "ch1", data: () => ({ title: "T1", prompt: "P1", status: "active" }) },
          { id: "ch2", data: () => ({ title: "T2", prompt: "P2", status: "active" }) },
        ],
      });
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallenges());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.challenges).toEqual([
        { id: "ch1", title: "T1", prompt: "P1", status: "active" },
        { id: "ch2", title: "T2", prompt: "P2", status: "active" },
      ]);
    });
  });

  it("sets error when snapshot fails", async () => {
    const unsubscribe = jest.fn();
    const err = new Error("snapshot failed");
    mockOnSnapshot.mockImplementationOnce((_q: any, _onNext: any, onError: any) => {
      onError(err);
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallenges());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(err);
      expect(result.current.challenges).toEqual([]);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useChallenges());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
