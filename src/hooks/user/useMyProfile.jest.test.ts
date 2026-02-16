/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useMyProfile } from "./useMyProfile";

let mockAuthState: { user: { uid: string } | null } = {
  user: null,
};

jest.mock("@/src/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState,
}));

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "user-doc-ref"),
  onSnapshot: jest.fn(),
}));

import { onSnapshot } from "firebase/firestore";
const mockOnSnapshot = onSnapshot as jest.Mock;

describe("useMyProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = { user: null };
  });

  it("returns null displayName and loading false when no user", async () => {
    const { result } = renderHook(() => useMyProfile());

    await waitFor(() => {
      expect(result.current.displayName).toBeNull();
      expect(result.current.loading).toBe(false);
    });
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("sets displayName from existing profile snapshot", async () => {
    mockAuthState = { user: { uid: "u1" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, onNext: any) => {
      onNext({ exists: () => true, data: () => ({ displayName: "Sofi" }) });
      return unsubscribe;
    });

    const { result } = renderHook(() => useMyProfile());

    await waitFor(() => {
      expect(result.current.displayName).toBe("Sofi");
      expect(result.current.loading).toBe(false);
    });
  });

  it("sets null displayName when doc does not exist", async () => {
    mockAuthState = { user: { uid: "u1" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, onNext: any) => {
      onNext({ exists: () => false, data: () => ({}) });
      return unsubscribe;
    });

    const { result } = renderHook(() => useMyProfile());

    await waitFor(() => {
      expect(result.current.displayName).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it("handles snapshot error by stopping loading", async () => {
    mockAuthState = { user: { uid: "u1" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, _onNext: any, onError: any) => {
      onError(new Error("boom"));
      return unsubscribe;
    });

    const { result } = renderHook(() => useMyProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("unsubscribes on unmount", () => {
    mockAuthState = { user: { uid: "u1" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useMyProfile());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
