import { describe, it, expect, vi, beforeEach } from "vitest";
import dayjs from "dayjs";

// Hoisted mock ref so it's available at vi.mock definition time
const mockIsDevMode = vi.hoisted(() => ({ value: false }));

// Mock the config module so we can control isDevMode per test
vi.mock("../../../config", () => ({
  get isDevMode() {
    return mockIsDevMode.value;
  },
}));

// Mock the fileStore module
vi.mock("../../../fileStore", () => {
  const store: Record<string, unknown> = {};
  return {
    getData: vi.fn((key: string) => store[key] ?? null),
    setData: vi.fn((key: string, value: unknown) => {
      store[key] = value;
    }),
    deleteData: vi.fn((key: string) => {
      delete store[key];
    }),
    // Expose store for test cleanup
    __store: store,
  };
});

import {
  saveBumboys,
  getBumboys,
  clearBumboys,
} from "./bumboyActions";

describe("bumboyActions", () => {
  let mockStore: Record<string, unknown>;

  beforeEach(async () => {
    mockIsDevMode.value = false;
    const fileStore = await import("../../../fileStore");
    mockStore = (fileStore as any).__store;
    // Clear store before each test
    for (const key of Object.keys(mockStore)) {
      delete mockStore[key];
    }
  });

  describe("saveBumboys", () => {
    it("persists bumboy data retrievable by getBumboys", async () => {
      const bumboys = [
        { id: "user1", nickname: "Player1" },
        { id: "user2", nickname: null },
      ];

      await saveBumboys(bumboys);
      const result = await getBumboys();

      expect(result).not.toBeNull();
      expect(result!.bumboys).toEqual(bumboys);
    });

    it("sets clearTime approximately 12 hours in the future (production)", async () => {
      mockIsDevMode.value = false;

      const bumboys = [{ id: "user1", nickname: "Test" }];
      const before = dayjs();

      await saveBumboys(bumboys);
      const result = await getBumboys();

      const after = dayjs();
      const clearTime = dayjs(result!.clearTime);

      // clearTime should be ~12 hours from now (within a 5 second margin)
      expect(clearTime.diff(before, "hour")).toBeGreaterThanOrEqual(11);
      expect(clearTime.diff(after, "hour")).toBeLessThanOrEqual(13);
    });

    it("sets clearTime approximately 2 minutes in the future (dev mode)", async () => {
      mockIsDevMode.value = true;

      const bumboys = [{ id: "user1", nickname: "Test" }];
      const before = dayjs();

      await saveBumboys(bumboys);
      const result = await getBumboys();

      const after = dayjs();
      const clearTime = dayjs(result!.clearTime);

      // clearTime should be ~2 minutes from now (within a 5 second margin)
      expect(clearTime.diff(before, "minute")).toBeGreaterThanOrEqual(1);
      expect(clearTime.diff(after, "minute")).toBeLessThanOrEqual(3);
    });

    it("does not write when given an empty array", async () => {
      await saveBumboys([]);
      const result = await getBumboys();
      expect(result).toBeNull();
    });
  });

  describe("clearBumboys", () => {
    it("removes existing bumboy data", async () => {
      await saveBumboys([{ id: "user1", nickname: "Nick" }]);
      expect(await getBumboys()).not.toBeNull();

      await clearBumboys();
      expect(await getBumboys()).toBeNull();
    });
  });

  describe("getBumboys", () => {
    it("returns null when no bumboys are saved", async () => {
      const result = await getBumboys();
      expect(result).toBeNull();
    });
  });
});
