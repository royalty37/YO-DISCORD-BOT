import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { textSubcommand, handleTextSubcommand } from "./subcommands/text";
import { editSubcommand, handleEditSubcommand } from "./subcommands/edit";
import {
  createImageSubcommand,
  handleCreateImageSubcommand,
} from "./subcommands/createImage";
import {
  randomStorySubcommand,
  handleRandomStorySubcommand,
} from "./subcommands/randomStory";
import { helpSubcommand, handleHelpSubcommand } from "./subcommands/help";
import { Command, Interaction } from "../../types/types";

// Enum for subcommands
export enum Subcommands {
  TEXT = "text",
  EDIT = "edit",
  CREATE_IMAGE = "create-image",
  RANDOM_STORY = "random-story",
  HELP = "help",
}

// OpenAI command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("openai")
  .setDescription("Various openAI subcommands.")
  .addSubcommand(textSubcommand)
  .addSubcommand(editSubcommand)
  .addSubcommand(createImageSubcommand)
  .addSubcommand(randomStorySubcommand)
  .addSubcommand(helpSubcommand);

// OpenAI command execute function
const execute = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  const subcommand = interaction.options.getSubcommand();

  // Switch statement for subcommands to handle subcommand execution accordingly
  switch (subcommand) {
    case Subcommands.TEXT:
      handleTextSubcommand(interaction);
      break;
    case Subcommands.EDIT:
      handleEditSubcommand(interaction);
      break;
    case Subcommands.CREATE_IMAGE:
      handleCreateImageSubcommand(interaction);
      break;
    case Subcommands.RANDOM_STORY:
      handleRandomStorySubcommand(interaction);
      break;
    case Subcommands.HELP:
      handleHelpSubcommand(interaction);
      break;
    default:
      interaction.reply({
        content: "Something went wrong. Please try again.",
        ephemeral: true,
      });
      console.error("*** OPENAI - Subcommand doesn't exist: " + subcommand);
  }
};

const infoCommand: Command = {
  data,
  execute,
};

module.exports = infoCommand;
