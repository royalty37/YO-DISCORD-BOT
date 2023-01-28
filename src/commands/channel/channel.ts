import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command, Interaction } from "../../types/types";
import { cleanSubcommand, handleCleanSubcommand } from "./subcommands/clean";

// Subcommands enum for channel command
export enum subcommands {
  CLEAN = "clean",
}

// Server command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("channel")
  .setDescription("Subcommands for Discord channel management.")
  .addSubcommand(cleanSubcommand);

// Channel command execute function
const execute = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  if (interaction.options.getSubcommand() === subcommands.CLEAN) {
    handleCleanSubcommand(interaction);
  }
};

const channelCommand: Command = {
  data,
  execute,
};

module.exports = channelCommand;
