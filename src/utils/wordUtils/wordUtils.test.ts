import { describe, it, expect } from "vitest";
import { getRandomWord, getRandomWords, getUniqueRandomWords } from "./wordUtils";

describe("wordUtils", () => {
    describe("getRandomWord", () => {
        it("returns a non-empty string", () => {
            const word = getRandomWord();
            expect(typeof word).toBe("string");
            expect(word.length).toBeGreaterThan(0);
        });
    });

    describe("getRandomWords", () => {
        it("returns an array of length n", () => {
            const words = getRandomWords(5);
            expect(words).toHaveLength(5);
        });

        it("returns an empty array for n = 0", () => {
            const words = getRandomWords(0);
            expect(words).toEqual([]);
        });

        it("all entries are strings", () => {
            const words = getRandomWords(3);
            for (const word of words) {
                expect(typeof word).toBe("string");
            }
        });
    });

    describe("getUniqueRandomWords", () => {
        it("returns n unique words", () => {
            const words = getUniqueRandomWords(5);
            expect(words).toHaveLength(5);

            const unique = new Set(words);
            expect(unique.size).toBe(5);
        });

        it("returns an empty array for n = 0", () => {
            const words = getUniqueRandomWords(0);
            expect(words).toEqual([]);
        });
    });
});
