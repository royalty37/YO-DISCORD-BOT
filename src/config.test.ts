import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("config", () => {
  const originalDev = process.env.DEV;

  beforeEach(() => {
    // Reset module cache so config.ts re-evaluates isDevMode
    vi.resetModules();
  });

  afterEach(() => {
    if (originalDev === undefined) {
      delete process.env.DEV;
    } else {
      process.env.DEV = originalDev;
    }
  });

  it("isDevMode is true when DEV env var is set to a truthy value", async () => {
    process.env.DEV = "true";
    const { isDevMode } = await import("./config");
    expect(isDevMode).toBe(true);
  });

  it("isDevMode is false when DEV env var is unset", async () => {
    delete process.env.DEV;
    const { isDevMode } = await import("./config");
    expect(isDevMode).toBe(false);
  });
});
