import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../types/Command";
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
const execute = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.options.getSubcommand() === subcommands.CLEAN) {
    handleCleanSubcommand(interaction);
  }
};

const channelCommand: Command = {
  data,
  execute,
};

module.exports = channelCommand;
