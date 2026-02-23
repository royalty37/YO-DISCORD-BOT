import { describe, it, expect, vi } from "vitest";
import channelCommand, { Subcommands } from "./channel";

describe("channel command", () => {
    it("has the correct command name", () => {
        expect(channelCommand.data.name).toBe("channel");
    });

    it("has data and execute properties", () => {
        expect(channelCommand.data).toBeDefined();
        expect(channelCommand.execute).toBeDefined();
        expect(typeof channelCommand.execute).toBe("function");
    });

    it("Subcommands enum has CLEAN", () => {
        expect(Subcommands.CLEAN).toBe("clean");
    });

    it("replies with error for unknown subcommand", async () => {
        const mockReply = vi.fn();
        const mockInteraction = {
            options: {
                getSubcommand: () => "nonexistent",
            },
            reply: mockReply,
        } as any;

        await channelCommand.execute(mockInteraction);

        expect(mockReply).toHaveBeenCalledWith({
            content: "Something went wrong. Please try again.",
            ephemeral: true,
        });
    });
});
