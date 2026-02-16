/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useIsAdmin } from "./useIsAdmin";

let mockAuthState: { user: { email?: string | null } | null } = {
  user: null,
};

jest.mock("@/src/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState,
}));

jest.mock("@/src/lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "admin-doc-ref"),
  onSnapshot: jest.fn(),
}));

import { onSnapshot } from "firebase/firestore";
const mockOnSnapshot = onSnapshot as jest.Mock;

describe("useIsAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = { user: null };
  });

  it("returns false and loading false when user email is missing", async () => {
    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.loading).toBe(false);
    });
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("sets isAdmin true when admin doc is enabled", async () => {
    mockAuthState = { user: { email: "admin@mail.com" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, onNext: any) => {
      onNext({ exists: () => true, data: () => ({ enabled: true }) });
      return unsubscribe;
    });

    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  it("sets isAdmin false when doc missing or disabled", async () => {
    mockAuthState = { user: { email: "user@mail.com" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, onNext: any) => {
      onNext({ exists: () => false, data: () => ({}) });
      return unsubscribe;
    });

    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  it("falls back to false on snapshot error", async () => {
    mockAuthState = { user: { email: "user@mail.com" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_ref: any, _onNext: any, onError: any) => {
      onError(new Error("boom"));
      return unsubscribe;
    });

    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  it("unsubscribes on unmount", () => {
    mockAuthState = { user: { email: "admin@mail.com" } };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useIsAdmin());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
