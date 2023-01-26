import { SlashCommandBuilder } from "discord.js";
import { playSubcommand, shorthandPlaySubcommand, handlePlaySubcommand } from "./subcommands/play";
import { pauseSubcommand, handlePauseSubcommand } from "./subcommands/pause";
import { resumeSubcommand, handleResumeSubcommand } from "./subcommands/resume";
import { joinSubcommand, handleJoinSubcommand } from "./subcommands/join";
import { leaveSubcommand, handleLeaveSubcommand } from "./subcommands/leave";
import { skipSubcommand, handleSkipSubcommand } from "./subcommands/skip";
import { stopSubcommand, handleStopSubcommand } from "./subcommands/stop";
import { queueSubcommand, handleQueueSubcommand } from "./subcommands/queue";
import { Command, Interaction } from "../../types/types";

// Enum for subcommands
export enum subcommands {
  PLAY = "play",
  SHORTHAND_PLAY = "p",
  PAUSE = "pause",
  RESUME = "resume",
  JOIN = "join",
  LEAVE = "leave",
  SKIP = "skip",
  STOP = "stop",
  QUEUE = "queue",
}

// Music command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("music")
  .setDescription("Play music!")
  .addSubcommand(playSubcommand)
  .addSubcommand(shorthandPlaySubcommand)
  .addSubcommand(pauseSubcommand)
  .addSubcommand(resumeSubcommand)
  .addSubcommand(joinSubcommand)
  .addSubcommand(leaveSubcommand)
  .addSubcommand(skipSubcommand)
  .addSubcommand(stopSubcommand)
  .addSubcommand(queueSubcommand);

// Music command execute function
const execute = async (interaction: Interaction) => {
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
    case subcommands.RESUME:
      handleResumeSubcommand(interaction);
      break;
    case subcommands.JOIN:
      handleJoinSubcommand(interaction);
      break;
    case subcommands.LEAVE:
      handleLeaveSubcommand(interaction);
      break;
    case subcommands.SKIP:
      handleSkipSubcommand(interaction);
      break;
    case subcommands.STOP:
      handleStopSubcommand(interaction);
      break;
    case subcommands.QUEUE:
      handleQueueSubcommand(interaction);
      break;
    default:
      console.log("*** ERROR: No subcommand found.");
  }
};

const musicCommand: Command = {
  data,
  execute,
};

module.exports = musicCommand;
