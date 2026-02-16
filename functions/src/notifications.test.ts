import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendExpoPush } from "./notifications";

describe("sendExpoPush", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns early when there are no messages", async () => {
    await sendExpoPush([]);

    expect(fetch).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("[push] no messages to send");
  });

  it("splits into batches of 100", async () => {
    const messages = Array.from({ length: 101 }, (_, i) => ({
      to: `ExponentPushToken[${i}]`,
      title: "t",
      body: "b",
    }));

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ status: "ok" }] }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ status: "ok" }] }),
        text: async () => "",
      });

    await sendExpoPush(messages);

    expect(fetch).toHaveBeenCalledTimes(2);
    const firstBody = JSON.parse((fetch as any).mock.calls[0][1].body);
    const secondBody = JSON.parse((fetch as any).mock.calls[1][1].body);
    expect(firstBody).toHaveLength(100);
    expect(secondBody).toHaveLength(1);
  });

  it("throws with text fallback on non-OK HTTP and invalid JSON", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("invalid json");
      },
      text: async () => "internal error",
    });

    await expect(
      sendExpoPush([{ to: "ExponentPushToken[x]", title: "T", body: "B" }]),
    ).rejects.toThrow("Expo HTTP error 500: internal error");
  });

  it("throws with JSON payload on non-OK HTTP when body is valid JSON", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ errors: [{ code: "BAD_REQUEST" }] }),
      text: async () => "ignored",
    });

    await expect(
      sendExpoPush([{ to: "ExponentPushToken[x]", title: "T", body: "B" }]),
    ).rejects.toThrow('Expo HTTP error 400: {"errors":[{"code":"BAD_REQUEST"}]}');
  });

  it("throws with empty fallback when non-OK HTTP text also fails", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("invalid json");
      },
      text: async () => {
        throw new Error("text fail");
      },
    });

    await expect(
      sendExpoPush([{ to: "ExponentPushToken[x]", title: "T", body: "B" }]),
    ).rejects.toThrow("Expo HTTP error 502:");
  });

  it("warns when response has no ticket data", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
      text: async () => "",
    });

    await sendExpoPush([{ to: "ExponentPushToken[x]", title: "T", body: "B" }]);

    expect(console.warn).toHaveBeenCalled();
  });

  it("warns when JSON parsing fails on an OK response", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("invalid json");
      },
      text: async () => "",
    });

    await sendExpoPush([{ to: "ExponentPushToken[x]", title: "T", body: "B" }]);

    expect(console.warn).toHaveBeenCalled();
  });

  it("logs ticket errors when Expo returns error tickets", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ status: "error", message: "bad token" }] }),
      text: async () => "",
    });

    await sendExpoPush([{ to: "ExponentPushToken[x]", title: "T", body: "B" }]);

    expect(console.error).toHaveBeenCalledWith("[push] Expo ticket errors:", [
      { status: "error", message: "bad token" },
    ]);
  });

  it("logs accepted batch when all tickets are ok", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ status: "ok", id: "ticket-1" }] }),
      text: async () => "",
    });

    await sendExpoPush([{ to: "ExponentPushToken[x]", title: "T", body: "B" }]);

    expect(console.log).toHaveBeenCalledWith("[push] batch accepted by Expo");
  });
});
