import { describe, it, expect, vi } from "vitest";
import voiceCommand, { VoiceSubcommands } from "./voice";

describe("voice command", () => {
  it("has the correct command name", () => {
    expect(voiceCommand.data.name).toBe("voice");
  });

  it("has data and execute properties", () => {
    expect(voiceCommand.data).toBeDefined();
    expect(voiceCommand.execute).toBeDefined();
    expect(typeof voiceCommand.execute).toBe("function");
  });

  it("VoiceSubcommands enum has all expected values", () => {
    const expected = ["say", "voices", "reset"];
    const enumValues = Object.values(VoiceSubcommands);

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

    await voiceCommand.execute(mockInteraction);

    expect(mockReply).toHaveBeenCalledWith({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  });
});
