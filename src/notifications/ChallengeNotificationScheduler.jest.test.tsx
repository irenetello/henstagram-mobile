/// <reference types="jest" />

import { render } from "@testing-library/react-native";
import { ChallengeNotificationScheduler } from "./ChallengeNotificationScheduler";

const mockSubscribeActiveChallenges = jest.fn();
const mockScheduleChallengeIfNeeded = jest.fn();

jest.mock("@/src/lib/challenges/challengeApi", () => ({
  subscribeActiveChallenges: (...args: any[]) => mockSubscribeActiveChallenges(...args),
}));

jest.mock("@/src/notifications/scheduleChallengeNotifications", () => ({
  scheduleChallengeIfNeeded: (...args: any[]) => mockScheduleChallengeIfNeeded(...args),
}));

describe("ChallengeNotificationScheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockScheduleChallengeIfNeeded.mockResolvedValue(undefined);
  });

  it("subscribes to active challenges and schedules each one", () => {
    const unsubscribe = jest.fn();
    mockSubscribeActiveChallenges.mockImplementationOnce((cb: any) => {
      cb([
        { id: "c1", title: "A" },
        { id: "c2", title: "B" },
      ]);
      return unsubscribe;
    });

    render(<ChallengeNotificationScheduler />);

    expect(mockScheduleChallengeIfNeeded).toHaveBeenCalledTimes(2);
    expect(mockScheduleChallengeIfNeeded).toHaveBeenCalledWith({ id: "c1", title: "A" });
    expect(mockScheduleChallengeIfNeeded).toHaveBeenCalledWith({ id: "c2", title: "B" });
  });

  it("warns when scheduling one challenge fails", async () => {
    const unsubscribe = jest.fn();
    mockScheduleChallengeIfNeeded.mockRejectedValueOnce(new Error("boom"));
    mockSubscribeActiveChallenges.mockImplementationOnce((cb: any) => {
      cb([{ id: "c1", title: "A" }]);
      return unsubscribe;
    });

    render(<ChallengeNotificationScheduler />);

    await Promise.resolve();
    expect(console.warn).toHaveBeenCalledWith(
      "[ChallengeNotificationScheduler] schedule failed",
      expect.any(Error),
    );
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = jest.fn();
    mockSubscribeActiveChallenges.mockImplementationOnce(() => unsubscribe);

    const { unmount } = render(<ChallengeNotificationScheduler />);
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
