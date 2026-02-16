/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useMyPosts } from "./useMyPosts";

let mockAuthState: { user: { uid: string } | null; initializing: boolean } = {
  user: null,
  initializing: false,
};

jest.mock("@/src/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState,
}));

jest.mock("../../lib/firebase", () => ({
  db: { __db: true },
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "collection-ref"),
  limit: jest.fn(() => "limit-ref"),
  onSnapshot: jest.fn(),
  orderBy: jest.fn(() => "orderBy-ref"),
  query: jest.fn(() => "query-ref"),
  where: jest.fn(() => "where-ref"),
}));

import { onSnapshot } from "firebase/firestore";
const mockOnSnapshot = onSnapshot as jest.Mock;

jest.mock("@/src/lib/posts/mapPost", () => ({
  mapPostDoc: jest.fn((doc: any) => ({ id: doc.id, mapped: true })),
}));

describe("useMyPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = { user: null, initializing: false };
  });

  it("stays loading while auth is initializing", () => {
    mockAuthState = { user: null, initializing: true };
    const { result } = renderHook(() => useMyPosts());

    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it("returns empty posts when user is missing", async () => {
    mockAuthState = { user: null, initializing: false };
    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual([]);
    });
  });

  it("maps user posts from snapshot", async () => {
    mockAuthState = { user: { uid: "u1" }, initializing: false };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, onNext: any) => {
      onNext({ docs: [{ id: "p1" }, { id: "p2" }] });
      return unsubscribe;
    });

    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual([
        { id: "p1", mapped: true },
        { id: "p2", mapped: true },
      ]);
    });
  });

  it("handles snapshot error", async () => {
    mockAuthState = { user: { uid: "u1" }, initializing: false };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce((_q: any, _onNext: any, onError: any) => {
      onError(new Error("boom"));
      return unsubscribe;
    });
    jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useMyPosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.posts).toEqual([]);
    });
  });

  it("unsubscribes on unmount", () => {
    mockAuthState = { user: { uid: "u1" }, initializing: false };
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementationOnce(() => unsubscribe);

    const { unmount } = renderHook(() => useMyPosts());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
