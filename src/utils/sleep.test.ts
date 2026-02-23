import { describe, it, expect, vi, afterEach } from "vitest";
import { sleep } from "./sleep";

describe("sleep", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a Promise that resolves after the given ms", async () => {
    vi.useFakeTimers();

    let resolved = false;
    const p = sleep(1000).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    vi.advanceTimersByTime(1000);
    await p;

    expect(resolved).toBe(true);
  });

  it("resolves immediately for 0 ms", async () => {
    vi.useFakeTimers();

    let resolved = false;
    const p = sleep(0).then(() => {
      resolved = true;
    });

    vi.advanceTimersByTime(0);
    await p;

    expect(resolved).toBe(true);
  });
});
