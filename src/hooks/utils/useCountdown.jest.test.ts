/// <reference types="jest" />

import { renderHook, waitFor } from "@testing-library/react-native";
import { useCountdown } from "./useCountdown";
import { act } from "react";

describe("useCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2026-01-01T10:00:00.000Z").getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("returns empty string when endAt is missing", () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current).toBe("");
  });

  it("returns Ended when end time is in the past", async () => {
    const endAt = { toMillis: () => new Date("2026-01-01T09:00:00.000Z").getTime() };
    const { result } = renderHook(() => useCountdown(endAt));

    await waitFor(() => {
      expect(result.current).toBe("Ended");
    });
  });

  it("formats remaining time from toDate", async () => {
    const endAt = { toDate: () => new Date("2026-01-02T12:30:00.000Z") };
    const { result } = renderHook(() => useCountdown(endAt));

    await waitFor(() => {
      expect(result.current).toContain("1d");
      expect(result.current).toContain("2h");
      expect(result.current).toContain("30m");
    });
  });

  it("updates countdown when interval ticks", async () => {
    const now = new Date("2026-01-01T10:00:00.000Z").getTime();
    let end = now + 2 * 60 * 1000;
    const endAt = { toMillis: () => end };

    const { result } = renderHook(() => useCountdown(endAt));

    await waitFor(() => {
      expect(result.current).toContain("2m");
    });

    end = now + 1 * 60 * 1000;
    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    await waitFor(() => {
      expect(result.current).toContain("1m");
    });
  });
});
