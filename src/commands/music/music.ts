import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { playSubcommand, shorthandPlaySubcommand, handlePlaySubcommand } from "./subcommands/play";
import { pauseSubcommand, handlePauseSubcommand } from "./subcommands/pause";
import { resumeSubcommand, handleResumeSubcommand } from "./subcommands/resume";
import { joinSubcommand, handleJoinSubcommand } from "./subcommands/join";
import { leaveSubcommand, handleLeaveSubcommand } from "./subcommands/leave";
import { skipSubcommand, handleSkipSubcommand } from "./subcommands/skip";
import { stopSubcommand, handleStopSubcommand } from "./subcommands/stop";
import { queueSubcommand, handleQueueSubcommand } from "./subcommands/queue";
import { nowPlayingSubcommand, handleNowPlayingSubcommand } from "./subcommands/nowplaying";
import { shuffleSubcommand, handleShuffleSubcommand } from "./subcommands/shuffle";
import { playSkipSubcommand } from "./subcommands/playskip";
import { Command, Interaction } from "../../types/types";
import { playTopSubcommand } from "./subcommands/playtop";

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
  NOWPLAYING = "nowplaying",
  PLAYSKIP = "playskip",
  SHUFFLE = "shuffle",
  PLAYTOP = "playtop",
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
  .addSubcommand(queueSubcommand)
  .addSubcommand(nowPlayingSubcommand)
  .addSubcommand(playSkipSubcommand)
  .addSubcommand(playTopSubcommand)
  .addSubcommand(shuffleSubcommand);

// Music command execute function
const execute = async (interaction: Interaction<ChatInputCommandInteraction>) => {
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
    case subcommands.NOWPLAYING:
      handleNowPlayingSubcommand(interaction);
      break;
    case subcommands.PLAYSKIP:
      handlePlaySubcommand(interaction, true);
      break;
    case subcommands.PLAYTOP:
      handlePlaySubcommand(interaction, false, true);
    case subcommands.SHUFFLE:
      handleShuffleSubcommand(interaction);
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
