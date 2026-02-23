import { describe, it, expect } from "vitest";
import { REPEAT_MODE_ARRAY } from "./musicConstants";

describe("musicConstants", () => {
    it("REPEAT_MODE_ARRAY has exactly 4 entries", () => {
        expect(REPEAT_MODE_ARRAY).toHaveLength(4);
    });

    it("contains the expected repeat mode labels", () => {
        expect(REPEAT_MODE_ARRAY).toEqual(["Off", "Track", "Queue", "Autoplay"]);
    });

    it("index 0 is Off (default)", () => {
        expect(REPEAT_MODE_ARRAY[0]).toBe("Off");
    });
});
