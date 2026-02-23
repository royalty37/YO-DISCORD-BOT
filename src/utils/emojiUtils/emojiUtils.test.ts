import { describe, it, expect } from "vitest";
import { getRandomEmoji, getUniqueRandomEmojis } from "./emojiUtils";
import { EMOJI_LIST } from "./emojiList";

describe("emojiUtils", () => {
  describe("getRandomEmoji", () => {
    it("returns a string present in EMOJI_LIST", () => {
      const emoji = getRandomEmoji();
      expect(typeof emoji).toBe("string");
      expect(EMOJI_LIST).toContain(emoji);
    });
  });

  describe("getUniqueRandomEmojis", () => {
    it("returns n unique emojis", () => {
      const emojis = getUniqueRandomEmojis(5);
      expect(emojis).toHaveLength(5);

      const unique = new Set(emojis);
      expect(unique.size).toBe(5);
    });

    it("all returned emojis are in EMOJI_LIST", () => {
      const emojis = getUniqueRandomEmojis(10);
      for (const emoji of emojis) {
        expect(EMOJI_LIST).toContain(emoji);
      }
    });

    it("returns an empty array for n = 0", () => {
      const emojis = getUniqueRandomEmojis(0);
      expect(emojis).toEqual([]);
    });

    it("returns 1 emoji for n = 1", () => {
      const emojis = getUniqueRandomEmojis(1);
      expect(emojis).toHaveLength(1);
    });
  });
});
