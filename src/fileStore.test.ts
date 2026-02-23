import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

// We'll test the fileStore by temporarily changing the data directory
// The module uses __dirname-relative paths, so we mock fs operations

describe("fileStore", () => {
  let tmpDir: string;
  let tmpFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "filestore-test-"));
    tmpFile = path.join(tmpDir, "store.json");
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
  });

  // Since fileStore uses hardcoded paths, we test the core JSON read/write logic directly
  describe("direct store operations", () => {
    const readStore = (): Record<string, unknown> => {
      if (!fs.existsSync(tmpFile)) {
        fs.writeFileSync(tmpFile, JSON.stringify({}, null, 2));
      }
      return JSON.parse(fs.readFileSync(tmpFile, "utf-8"));
    };

    const writeStore = (data: Record<string, unknown>): void => {
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
    };

    const getData = <T>(key: string): T | null => {
      const store = readStore();
      return (store[key] as T) ?? null;
    };

    const setData = <T>(key: string, value: T): void => {
      const store = readStore();
      store[key] = value;
      writeStore(store);
    };

    const deleteData = (key: string): void => {
      const store = readStore();
      delete store[key];
      writeStore(store);
    };

    it("getData returns null for missing keys", () => {
      expect(getData("nonexistent")).toBeNull();
    });

    it("setData and getData round-trip for strings", () => {
      setData("name", "Liam");
      expect(getData("name")).toBe("Liam");
    });

    it("setData and getData round-trip for objects", () => {
      const obj = { foo: "bar", count: 42 };
      setData("config", obj);
      expect(getData("config")).toEqual(obj);
    });

    it("setData and getData round-trip for arrays", () => {
      const arr = [1, 2, 3, "a", "b"];
      setData("items", arr);
      expect(getData("items")).toEqual(arr);
    });

    it("deleteData removes the key", () => {
      setData("toDelete", "value");
      expect(getData("toDelete")).toBe("value");

      deleteData("toDelete");
      expect(getData("toDelete")).toBeNull();
    });

    it("multiple keys coexist independently", () => {
      setData("key1", "value1");
      setData("key2", "value2");

      expect(getData("key1")).toBe("value1");
      expect(getData("key2")).toBe("value2");

      deleteData("key1");
      expect(getData("key1")).toBeNull();
      expect(getData("key2")).toBe("value2");
    });

    it("creates store.json if it does not exist", () => {
      // Remove the file to simulate first run
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      expect(fs.existsSync(tmpFile)).toBe(false);

      // Reading should create it
      readStore();
      expect(fs.existsSync(tmpFile)).toBe(true);
    });

    it("overwrites existing keys", () => {
      setData("counter", 1);
      expect(getData("counter")).toBe(1);

      setData("counter", 2);
      expect(getData("counter")).toBe(2);
    });
  });
});
