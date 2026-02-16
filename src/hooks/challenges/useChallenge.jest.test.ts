/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useChallenge } from "./useChallenge";

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "challenge-doc-ref"),
  onSnapshot: jest.fn(),
}));

import { onSnapshot } from "firebase/firestore";
const mockOnSnapshot = onSnapshot as jest.Mock;

describe("useChallenge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null and loading false when challengeId is empty", async () => {
    const { result } = renderHook(() => useChallenge(""));

    await waitFor(() => {
      expect(result.current.challenge).toBeNull();
      expect(result.current.loading).toBe(false);
    });
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("loads challenge when snapshot exists", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, onNext: any) => {
      onNext({ exists: () => true, id: "c1", data: () => ({ title: "Reto" }) });
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallenge("c1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.challenge).toEqual({ id: "c1", title: "Reto" });
    });
  });

  it("sets challenge null when doc does not exist", async () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, onNext: any) => {
      onNext({ exists: () => false, id: "c1", data: () => ({}) });
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallenge("c1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.challenge).toBeNull();
    });
  });

  it("sets error on snapshot failure", async () => {
    const unsubscribe = jest.fn();
    const err = new Error("snap failed");
    mockOnSnapshot.mockImplementationOnce((_ref: any, _onNext: any, onError: any) => {
      onError(err);
      return unsubscribe;
    });

    const { result } = renderHook(() => useChallenge("c1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(err);
    });
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useChallenge("c1"));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
