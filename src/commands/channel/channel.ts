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
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === subcommands.CLEAN) {
    handleCleanSubcommand(interaction);
  } else {
    interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
    console.error(`*** CHANNEL - Subcommand doesn't exist: ${subcommand}`);
  }
};

const channelCommand: Command = {
  data,
  execute,
};

module.exports = channelCommand;
