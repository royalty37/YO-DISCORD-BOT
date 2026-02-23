import { describe, it, expect, vi } from "vitest";
import infoCommand, { Subcommands } from "./info";

describe("info command", () => {
    it("has the correct command name", () => {
        expect(infoCommand.data.name).toBe("info");
    });

    it("has data and execute properties", () => {
        expect(infoCommand.data).toBeDefined();
        expect(infoCommand.execute).toBeDefined();
        expect(typeof infoCommand.execute).toBe("function");
    });

    it("Subcommands enum has USER and SERVER", () => {
        expect(Subcommands.USER).toBe("user");
        expect(Subcommands.SERVER).toBe("server");
    });

    it("replies with error for unknown subcommand", async () => {
        const mockReply = vi.fn();
        const mockInteraction = {
            options: {
                getSubcommand: () => "nonexistent",
            },
            reply: mockReply,
        } as any;

        await infoCommand.execute(mockInteraction);

        expect(mockReply).toHaveBeenCalledWith({
            content: "Something went wrong. Please try again.",
            ephemeral: true,
        });
    });
});
