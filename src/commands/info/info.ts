import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { userSubcommand, handleUserSubcommand } from "./subcommands/user";
import { serverSubcommand, handleServerSubcommand } from "./subcommands/server";
import { Command, Interaction } from "../../types/types";

// Subcommands enum for info command
export enum subcommands {
  USER = "user",
  SERVER = "server",
}

// Info command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Provides information about the server or user.")
  .addSubcommand(serverSubcommand)
  .addSubcommand(userSubcommand);

// Info command execute function
const execute = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === subcommands.USER) {
    handleUserSubcommand(interaction);
  } else if (subcommand === subcommands.SERVER) {
    handleServerSubcommand(interaction);
  } else {
    interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
    console.error(`*** INFO - Subcommand doesn't exist: ${subcommand}`);
  }
};

const infoCommand: Command = {
  data,
  execute,
};

module.exports = infoCommand;
