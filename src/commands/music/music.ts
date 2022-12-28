import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../types/Command";
import { playSubcommand, shorthandPlaySubcommand, handlePlaySubcommand } from "./subcommands/play";
import { pauseSubcommand, handlePauseSubcommand } from "./subcommands/pause";

// Enum for subcommands
export enum subcommands {
  PLAY = "play",
  SHORTHAND_PLAY = "p",
  PAUSE = "pause",
}

// Music command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("music")
  .setDescription("Play music!")
  .addSubcommand(playSubcommand)
  .addSubcommand(shorthandPlaySubcommand)
  .addSubcommand(pauseSubcommand);

// Music command execute function
const execute = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  // Switch statement for subcommands to handle subcommand execution accordingly
  switch (subcommand) {
    case subcommands.PLAY:
    case subcommands.SHORTHAND_PLAY:
      handlePlaySubcommand(interaction);
      break;
    case subcommands.PAUSE:
      handlePauseSubcommand(interaction);
      break;
    default:
  }
};

const musicCommand: Command = {
  data,
  execute,
};

module.exports = musicCommand;
