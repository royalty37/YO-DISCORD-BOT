import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { textSubcommand, handleTextSubcommand } from "./subcommands/text";
import { editSubcommand, handleEditSubcommand } from "./subcommands/edit";
import { createImageSubcommand, handleCreateImageSubcommand } from "./subcommands/createImage";
import Command from "../../types/Command";

export enum subcommands {
  TEXT = "text",
  EDIT = "edit",
  CREATE_IMAGE = "create-image",
}

const data = new SlashCommandBuilder()
  .setName("openai")
  .setDescription("Various openAI subcommands.")
  .addSubcommand(textSubcommand)
  .addSubcommand(editSubcommand)
  .addSubcommand(createImageSubcommand);

const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case subcommands.TEXT:
      handleTextSubcommand(interaction);
      break;
    case subcommands.EDIT:
      handleEditSubcommand(interaction);
      break;
    case subcommands.CREATE_IMAGE:
      handleCreateImageSubcommand(interaction);
      break;
    default:
      interaction.reply("Something went wrong. Please try again.");
      console.error("Subcommand doesn't exist: " + subcommand);
  }
};

const infoCommand: Command = {
  data,
  execute,
};

module.exports = infoCommand;
