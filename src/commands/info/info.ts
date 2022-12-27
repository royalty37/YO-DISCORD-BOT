import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { userSubcommand, handleUserSubcommand } from "./subcommands/user";
import { serverSubcommand, handleServerSubcommand } from "./subcommands/server";
import Command from "../../types/Command";

export enum subcommands {
  USER = "user",
  SERVER = "server",
}

const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Provides information about the server or user.")
  .addSubcommand(serverSubcommand)
  .addSubcommand(userSubcommand);

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.options.getSubcommand() === subcommands.USER) {
    handleUserSubcommand(interaction);
  } else if (interaction.options.getSubcommand() === subcommands.SERVER) {
    handleServerSubcommand(interaction);
  }
};

const infoCommand: Command = {
  data,
  execute,
};

module.exports = infoCommand;
