import { describe, it, expect, vi } from "vitest";
import musicCommand, { Subcommands } from "./music";

describe("music command", () => {
    it("has the correct command name", () => {
        expect(musicCommand.data.name).toBe("music");
    });

    it("has data and execute properties", () => {
        expect(musicCommand.data).toBeDefined();
        expect(musicCommand.execute).toBeDefined();
        expect(typeof musicCommand.execute).toBe("function");
    });

    it("Subcommands enum has all expected values", () => {
        const expected = [
            "play", "p", "pause", "resume", "join", "leave", "skip",
            "stop", "queue", "nowplaying", "playskip", "shuffle",
            "playtop", "previous", "skipto", "search", "repeat", "seek",
            "help", "lyrics",
        ];

        const enumValues = Object.values(Subcommands);
        for (const cmd of expected) {
            expect(enumValues).toContain(cmd);
        }
    });

    it("replies with error for unknown subcommand", async () => {
        const mockReply = vi.fn();
        const mockInteraction = {
            options: {
                getSubcommand: () => "nonexistent",
            },
            reply: mockReply,
        } as any;

        await musicCommand.execute(mockInteraction);

        expect(mockReply).toHaveBeenCalledWith({
            content: "Something went wrong. Please try again.",
            ephemeral: true,
        });
    });
});
