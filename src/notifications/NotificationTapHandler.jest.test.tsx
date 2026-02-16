/// <reference types="jest" />

import { render, waitFor } from "@testing-library/react-native";
import { NotificationTapHandler } from "./NotificationTapHandler";

const mockPush = jest.fn();
const mockGetLastNotificationResponseAsync = jest.fn();
const mockAddNotificationResponseReceivedListener = jest.fn();

let mockListenerCb: ((response: any) => void) | null = null;

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("expo-notifications", () => ({
  addNotificationResponseReceivedListener: (...args: any[]) =>
    mockAddNotificationResponseReceivedListener(...args),
  getLastNotificationResponseAsync: (...args: any[]) =>
    mockGetLastNotificationResponseAsync(...args),
}));

describe("NotificationTapHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListenerCb = null;
    mockAddNotificationResponseReceivedListener.mockImplementation((cb: any) => {
      mockListenerCb = cb;
      return { remove: jest.fn() };
    });
  });

  it("navigates from last notification challengeId", async () => {
    mockGetLastNotificationResponseAsync.mockResolvedValueOnce({
      notification: {
        request: { content: { data: { challengeId: "c1" } } },
      },
    });

    render(<NotificationTapHandler />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/challenge/c1");
    });
  });

  it("navigates from listener tap using fallback id", async () => {
    mockGetLastNotificationResponseAsync.mockResolvedValueOnce(null);

    render(<NotificationTapHandler />);

    mockListenerCb?.({
      notification: { request: { content: { data: { id: "c2" } } } },
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/challenge/c2");
    });
  });

  it("does nothing when data is missing", async () => {
    mockGetLastNotificationResponseAsync.mockResolvedValueOnce({
      notification: {
        request: { content: { data: undefined } },
      },
    });

    render(<NotificationTapHandler />);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("removes listener on unmount", async () => {
    const remove = jest.fn();
    mockAddNotificationResponseReceivedListener.mockImplementation((cb: any) => {
      mockListenerCb = cb;
      return { remove };
    });
    mockGetLastNotificationResponseAsync.mockResolvedValueOnce(null);

    const { unmount } = render(<NotificationTapHandler />);
    unmount();

    expect(remove).toHaveBeenCalled();
  });
});
