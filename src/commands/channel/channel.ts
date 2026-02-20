import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Interaction } from "../../types/types";
import { cleanSubcommand, handleCleanSubcommand } from "./subcommands/clean";

// Subcommands enum for channel command
export enum Subcommands {
  CLEAN = "clean",
}

// Server command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("channel")
  .setDescription("Subcommands for Discord channel management.")
  .addSubcommand(cleanSubcommand);

const subcommandHandlers: Record<
  string,
  (interaction: Interaction<ChatInputCommandInteraction>) => void
> = {
  [Subcommands.CLEAN]: handleCleanSubcommand,
};

const execute = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  const subcommand = interaction.options.getSubcommand();
  const handler = subcommandHandlers[subcommand];

  if (handler) {
    handler(interaction);
  } else {
    interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
    console.error(`*** CHANNEL - Subcommand doesn't exist: ${subcommand}`);
  }
};

const channelCommand: Command = {
  data,
  execute,
};

export default channelCommand;

