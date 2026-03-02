import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { saySubcommand, handleSaySubcommand } from "./subcommands/say";
import {
  voicesSubcommand,
  handleVoicesSubcommand,
} from "./subcommands/voices";
import {
  resetSubcommand,
  handleResetSubcommand,
} from "./subcommands/reset";

import type { Command, Interaction } from "../../types/types";
import { env } from "../../environment";

const ADMIN_ID = env.ADMIN_USER_ID;

// Enum for voice subcommands
export enum VoiceSubcommands {
  SAY = "say",
  VOICES = "voices",
  RESET = "reset",
}

// Handler map for subcommands
const subcommandHandlers: Record<
  string,
  (interaction: Interaction<ChatInputCommandInteraction>) => void
> = {
  [VoiceSubcommands.SAY]: handleSaySubcommand,
  [VoiceSubcommands.VOICES]: handleVoicesSubcommand,
  [VoiceSubcommands.RESET]: handleResetSubcommand,
};

// /voice command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("voice")
  .setDescription("Speak in a friend's cloned voice using AI!")
  .addSubcommand(saySubcommand)
  .addSubcommand(voicesSubcommand)
  .addSubcommand(resetSubcommand);

// Voice command execute function
const execute = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // Only I can use this command
  if (!ADMIN_ID || interaction.user.id !== ADMIN_ID) {
    await interaction.reply({
      content:
        "You do not have permission to use this command.",
      ephemeral: true,
    });
    return console.log("*** BUMBOY CLEAR - User is not the president.");
  }

  const subcommand = interaction.options.getSubcommand();
  const handler = subcommandHandlers[subcommand];

  if (handler) {
    handler(interaction);
  } else {
    interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
    console.log(`*** VOICE - Subcommand doesn't exist: ${subcommand}`);
  }
};

const voiceCommand: Command = {
  data,
  execute,
};

export default voiceCommand;
