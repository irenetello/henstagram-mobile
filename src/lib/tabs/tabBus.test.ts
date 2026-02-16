import { describe, expect, it, vi } from "vitest";

describe("tabBus", () => {
  it("notifies registered listeners with requested tab", async () => {
    vi.resetModules();
    const { onTabRequest, requestTab } = await import("./tabBus");

    const a = vi.fn();
    const b = vi.fn();

    onTabRequest(a);
    onTabRequest(b);

    requestTab("create");

    expect(a).toHaveBeenCalledWith("create");
    expect(b).toHaveBeenCalledWith("create");
  });

  it("unsubscribe removes only the target listener", async () => {
    vi.resetModules();
    const { onTabRequest, requestTab } = await import("./tabBus");

    const keep = vi.fn();
    const remove = vi.fn();

    onTabRequest(keep);
    const unsubscribe = onTabRequest(remove);
    unsubscribe();

    requestTab("feed");

    expect(keep).toHaveBeenCalledWith("feed");
    expect(remove).not.toHaveBeenCalled();
  });

  it("keeps working after multiple requests", async () => {
    vi.resetModules();
    const { onTabRequest, requestTab } = await import("./tabBus");

    const cb = vi.fn();
    onTabRequest(cb);

    requestTab("challenges");
    requestTab("profile");

    expect(cb).toHaveBeenNthCalledWith(1, "challenges");
    expect(cb).toHaveBeenNthCalledWith(2, "profile");
  });
});
