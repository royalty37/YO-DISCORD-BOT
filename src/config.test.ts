import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("config", () => {
  const originalDev = process.env.IS_DEV;

  beforeEach(() => {
    // Reset module cache so config.ts re-evaluates isDevMode
    vi.resetModules();
  });

  afterEach(() => {
    if (originalDev === undefined) {
      delete process.env.IS_DEV;
    } else {
      process.env.IS_DEV = originalDev;
    }
  });

  it("isDevMode is true when IS_DEV env var is set to a truthy value", async () => {
    process.env.IS_DEV = "true";
    const { isDevMode } = await import("./config");
    expect(isDevMode).toBe(true);
  });

  it("isDevMode is false when IS_DEV env var is unset", async () => {
    delete process.env.IS_DEV;
    const { isDevMode } = await import("./config");
    expect(isDevMode).toBe(false);
  });
});
