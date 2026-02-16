/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useChallengesUser } from "./useChallengesUser";

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

jest.mock("@/src/lib/challenges/challengeModel", () => ({
  mapChallenge: jest.fn((id: string, data: any) => ({ id, ...data })),
}));

jest.mock("@/src/notifications/scheduleChallengeNotifications", () => ({
  scheduleChallengeIfNeeded: jest.fn(() => Promise.resolve()),
}));

import { onSnapshot } from "firebase/firestore";
import { scheduleChallengeIfNeeded } from "@/src/notifications/scheduleChallengeNotifications";

const mockOnSnapshot = onSnapshot as jest.Mock;
const mockSchedule = scheduleChallengeIfNeeded as jest.Mock;

describe("useChallengesUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("loads challenges and schedules notifications", async () => {
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

    const { result } = renderHook(() => useChallengesUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.challenges).toEqual([
        { id: "c1", title: "A" },
        { id: "c2", title: "B" },
      ]);
    });

    await waitFor(() => {
      expect(mockSchedule).toHaveBeenCalledTimes(2);
    });
  });

  it("sets error when snapshot fails", async () => {
    const unsubscribe = jest.fn();
    const err = new Error("snap fail");
    mockOnSnapshot.mockImplementationOnce((_q: any, _onNext: any, onError: any) => {
      onError(err);
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallengesUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(err);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useChallengesUser());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
