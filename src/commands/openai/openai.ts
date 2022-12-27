import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { textSubcommand, handleTextSubcommand } from "./subcommands/text";
import { editSubcommand, handleEditSubcommand } from "./subcommands/edit";
import Command from "../../types/Command";

const data = new SlashCommandBuilder()
  .setName("openai")
  .setDescription("Various openAI subcommands.")
  .addSubcommand(textSubcommand)
  .addSubcommand(editSubcommand);

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.options.getSubcommand() === "text") {
    handleTextSubcommand(interaction);
  } else if (interaction.options.getSubcommand() === "edit") {
    handleEditSubcommand(interaction);
  }
};

const infoCommand: Command = {
  data,
  execute,
};

module.exports = infoCommand;
