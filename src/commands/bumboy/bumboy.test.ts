import { describe, it, expect, vi } from "vitest";
import bumboyCommand, { Subcommands } from "./bumboy";

describe("bumboy command", () => {
    it("has the correct command name", () => {
        expect(bumboyCommand.data.name).toBe("bumboy");
    });

    it("has data and execute properties", () => {
        expect(bumboyCommand.data).toBeDefined();
        expect(bumboyCommand.execute).toBeDefined();
        expect(typeof bumboyCommand.execute).toBe("function");
    });

    it("Subcommands enum has POLL and CLEAR", () => {
        expect(Subcommands.POLL).toBe("poll");
        expect(Subcommands.CLEAR).toBe("clear");
    });

    it("replies with error for unknown subcommand", async () => {
        const mockReply = vi.fn();
        const mockInteraction = {
            options: {
                getSubcommand: () => "nonexistent",
            },
            reply: mockReply,
        } as any;

        await bumboyCommand.execute(mockInteraction);

        expect(mockReply).toHaveBeenCalledWith({
            content: "Something went wrong. Please try again.",
            ephemeral: true,
        });
    });
});
