/// <reference types="jest" />

import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useChallengesAdmin } from "./useChallengesAdmin";

const mockNowTs = { now: true };

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(() => "orderBy-ref"),
  query: jest.fn(() => "query-ref"),
  where: jest.fn(() => "where-ref"),
  Timestamp: {
    now: jest.fn(() => mockNowTs),
  },
}));

jest.mock("@/src/lib/challenges/challengeModel", () => ({
  mapChallenge: jest.fn((id: string, data: any) => ({ id, ...data })),
}));

import { onSnapshot } from "firebase/firestore";
const mockOnSnapshot = onSnapshot as jest.Mock;

describe("useChallengesAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("loads challenges from snapshot", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({
        docs: [
          { id: "c1", data: () => ({ title: "A" }) },
          { id: "c2", data: () => ({ title: "B" }) },
        ],
      });
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallengesAdmin());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.challenges).toEqual([
        { id: "c1", title: "A" },
        { id: "c2", title: "B" },
      ]);
    });
  });

  it("sets error when snapshot fails", async () => {
    const unsubscribe = jest.fn();
    const err = new Error("snap failed");
    mockOnSnapshot.mockImplementationOnce((_q: any, _onNext: any, onError: any) => {
      onError(err);
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallengesAdmin());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(err);
    });
  });

  it("optimisticEndNow updates endAt for target challenge", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({ docs: [{ id: "c1", data: () => ({ title: "A", endAt: null }) }] });
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallengesAdmin());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.optimisticEndNow("c1");
    });

    expect(result.current.challenges[0].endAt).toEqual(mockNowTs);
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useChallengesAdmin());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
