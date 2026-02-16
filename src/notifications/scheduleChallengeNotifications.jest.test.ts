/// <reference types="jest" />

import { scheduleChallengeIfNeeded } from "./scheduleChallengeNotifications";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: (...args: any[]) => mockGetItem(...args),
    setItem: (...args: any[]) => mockSetItem(...args),
  },
}));

jest.mock("expo-notifications", () => ({
  cancelScheduledNotificationAsync: (...args: any[]) =>
    mockCancelScheduledNotificationAsync(...args),
  scheduleNotificationAsync: (...args: any[]) => mockScheduleNotificationAsync(...args),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
}));

describe("scheduleChallengeIfNeeded", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2026-01-01T10:00:00.000Z").getTime());
    mockGetItem.mockResolvedValue("{}");
    mockScheduleNotificationAsync.mockResolvedValue("notif-id");
  });

  it("cancels existing and clears stored id when challenge has no startAt", async () => {
    mockGetItem.mockResolvedValueOnce(JSON.stringify({ c1: "old-id" }));

    await scheduleChallengeIfNeeded({ id: "c1", title: "T", startAt: null } as any);

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith("old-id");
    expect(mockSetItem).toHaveBeenCalledWith(
      "scheduled_challenge_notifications",
      JSON.stringify({}),
    );
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("cancels existing and does not schedule when challenge already started", async () => {
    mockGetItem.mockResolvedValueOnce(JSON.stringify({ c1: "old-id" }));

    await scheduleChallengeIfNeeded({
      id: "c1",
      title: "T",
      startAt: { toMillis: () => new Date("2026-01-01T09:00:00.000Z").getTime() },
    } as any);

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith("old-id");
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules notification for future challenge and stores new notif id", async () => {
    mockGetItem.mockResolvedValueOnce(JSON.stringify({ c1: "old-id" }));
    mockScheduleNotificationAsync.mockResolvedValueOnce("new-id");

    await scheduleChallengeIfNeeded({
      id: "c1",
      title: "Future challenge",
      startAt: { toMillis: () => new Date("2026-01-01T10:05:00.000Z").getTime() },
    } as any);

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith("old-id");
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "Challenge is live 🔥",
        body: "Future challenge",
        data: { challengeId: "c1" },
      },
      trigger: {
        type: "timeInterval",
        seconds: 300,
      },
    });
    expect(mockSetItem).toHaveBeenCalledWith(
      "scheduled_challenge_notifications",
      JSON.stringify({ c1: "new-id" }),
    );
  });

  it("warns and continues when cancel fails", async () => {
    mockGetItem.mockResolvedValueOnce(JSON.stringify({ c1: "old-id" }));
    mockCancelScheduledNotificationAsync.mockRejectedValueOnce(new Error("cancel fail"));

    await scheduleChallengeIfNeeded({ id: "c1", title: "T", startAt: null } as any);

    expect(console.warn).toHaveBeenCalledWith("cancel failed", expect.any(Error));
    expect(mockSetItem).toHaveBeenCalledWith(
      "scheduled_challenge_notifications",
      JSON.stringify({}),
    );
  });
});
