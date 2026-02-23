import { describe, it, expect } from "vitest";
import { splitMessage } from "./messageUtils";

// Re-create the regex from messageUtils for direct testing
const INVITE_REGEX = new RegExp(
  /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z0-9]/,
);

describe("messageUtils", () => {
  describe("splitMessage", () => {
    it("returns single-element array when message fits within maxLength", () => {
      const result = splitMessage("Hello world");
      expect(result).toEqual(["Hello world"]);
    });

    it("returns single-element array for exactly maxLength characters", () => {
      const msg = "a".repeat(2000);
      const result = splitMessage(msg);
      expect(result).toEqual([msg]);
    });

    it("splits long messages into multiple chunks", () => {
      const msg = "a".repeat(5000);
      const result = splitMessage(msg);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(2000);
      expect(result[1]).toHaveLength(2000);
      expect(result[2]).toHaveLength(1000);
    });

    it("reconstructs original message from chunks", () => {
      const msg = "Hello ".repeat(500); // 3000 chars
      const result = splitMessage(msg);
      const reassembled = result.join("");
      expect(reassembled).toBe(msg);
    });

    it("respects custom maxLength parameter", () => {
      const msg = "abcdefghij"; // 10 chars
      const result = splitMessage(msg, 3);
      expect(result).toEqual(["abc", "def", "ghi", "j"]);
    });

    it("returns empty string in array when given empty string", () => {
      const result = splitMessage("");
      expect(result).toEqual([""]);
    });
  });

  describe("INVITE_REGEX", () => {
    it("matches discord.gg invite links", () => {
      expect(INVITE_REGEX.test("https://discord.gg/abc123")).toBe(true);
      expect(INVITE_REGEX.test("discord.gg/invite1")).toBe(true);
    });

    it("matches discordapp.com/invite links", () => {
      expect(INVITE_REGEX.test("https://discordapp.com/invite/abc123")).toBe(true);
    });

    it("matches discord.io, discord.me, discord.li", () => {
      expect(INVITE_REGEX.test("https://discord.io/server1")).toBe(true);
      expect(INVITE_REGEX.test("https://discord.me/server2")).toBe(true);
      expect(INVITE_REGEX.test("https://discord.li/server3")).toBe(true);
    });

    it("matches without protocol", () => {
      expect(INVITE_REGEX.test("discord.gg/myserver")).toBe(true);
    });

    it("matches with www prefix", () => {
      expect(INVITE_REGEX.test("https://www.discord.gg/myserver")).toBe(true);
    });

    it("does not match non-invite URLs", () => {
      expect(INVITE_REGEX.test("https://google.com")).toBe(false);
      expect(INVITE_REGEX.test("https://discord.com/channels/123")).toBe(false);
      expect(INVITE_REGEX.test("regular text message")).toBe(false);
    });
  });
});
