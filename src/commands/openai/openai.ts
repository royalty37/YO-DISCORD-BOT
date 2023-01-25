import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { textSubcommand, handleTextSubcommand } from "./subcommands/text";
import { editSubcommand, handleEditSubcommand } from "./subcommands/edit";
import { createImageSubcommand, handleCreateImageSubcommand } from "./subcommands/createImage";
import { randomStorySubcommand, handleRandomStorySubcommand } from "./subcommands/randomStory";
import { Command, Interaction } from "../../types/types";

// Enum for subcommands
export enum subcommands {
  TEXT = "text",
  EDIT = "edit",
  CREATE_IMAGE = "create-image",
  RANDOM_STORY = "random-story",
}

// OpenAI command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("openai")
  .setDescription("Various openAI subcommands.")
  .addSubcommand(textSubcommand)
  .addSubcommand(editSubcommand)
  .addSubcommand(createImageSubcommand)
  .addSubcommand(randomStorySubcommand);

// OpenAI command execute function
const execute = async (interaction: Interaction) => {
  const subcommand = interaction.options.getSubcommand();

  // Switch statement for subcommands to handle subcommand execution accordingly
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
    case subcommands.RANDOM_STORY:
      handleRandomStorySubcommand(interaction);
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
