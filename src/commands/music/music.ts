import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import {
  playSubcommand,
  shorthandPlaySubcommand,
  handlePlaySubcommand,
} from "./subcommands/play";
import { pauseSubcommand, handlePauseSubcommand } from "./subcommands/pause";
import { resumeSubcommand, handleResumeSubcommand } from "./subcommands/resume";
import { joinSubcommand, handleJoinSubcommand } from "./subcommands/join";
import { leaveSubcommand, handleLeaveSubcommand } from "./subcommands/leave";
import { skipSubcommand, handleSkipSubcommand } from "./subcommands/skip";
import { stopSubcommand, handleStopSubcommand } from "./subcommands/stop";
import { queueSubcommand, handleQueueSubcommand } from "./subcommands/queue";
import {
  nowPlayingSubcommand,
  handleNowPlayingSubcommand,
} from "./subcommands/nowplaying";
import {
  shuffleSubcommand,
  handleShuffleSubcommand,
} from "./subcommands/shuffle";
import { skipToSubcommand, handleSkipToSubcommand } from "./subcommands/skipto";
import { searchSubcommand, handleSearchSubcommand } from "./subcommands/search";
import { repeatSubcommand, handleRepeatSubcommand } from "./subcommands/repeat";
import { seekSubcommand, handleSeekSubcommand } from "./subcommands/seek";
import { helpSubcommand, handleHelpSubcommand } from "./subcommands/help";
import { playSkipSubcommand } from "./subcommands/playskip";
import { playTopSubcommand } from "./subcommands/playtop";
import { Command, Interaction } from "../../types/types";

// Enum for subcommands
export enum Subcommands {
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
  PREVIOUS = "previous",
  SKIPTO = "skipto",
  SEARCH = "search",
  REPEAT = "repeat",
  SEEK = "seek",
  HELP = "help",
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
  .addSubcommand(shuffleSubcommand)
  .addSubcommand(skipToSubcommand)
  .addSubcommand(searchSubcommand)
  .addSubcommand(repeatSubcommand)
  .addSubcommand(seekSubcommand)
  .addSubcommand(helpSubcommand);

// Music command execute function
const execute = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  const subcommand = interaction.options.getSubcommand();

  // Switch statement for subcommands to handle subcommand execution accordingly
  switch (subcommand) {
    case Subcommands.PLAY:
    case Subcommands.SHORTHAND_PLAY:
      handlePlaySubcommand(interaction);
      break;
    case Subcommands.PAUSE:
      handlePauseSubcommand(interaction);
      break;
    case Subcommands.RESUME:
      handleResumeSubcommand(interaction);
      break;
    case Subcommands.JOIN:
      handleJoinSubcommand(interaction);
      break;
    case Subcommands.LEAVE:
      handleLeaveSubcommand(interaction);
      break;
    case Subcommands.SKIP:
      handleSkipSubcommand(interaction);
      break;
    case Subcommands.STOP:
      handleStopSubcommand(interaction);
      break;
    case Subcommands.QUEUE:
      handleQueueSubcommand(interaction);
      break;
    case Subcommands.NOWPLAYING:
      handleNowPlayingSubcommand(interaction);
      break;
    case Subcommands.PLAYSKIP:
      handlePlaySubcommand(interaction, true);
      break;
    case Subcommands.PLAYTOP:
      handlePlaySubcommand(interaction, false, true);
    case Subcommands.SHUFFLE:
      handleShuffleSubcommand(interaction);
      break;
    case Subcommands.SKIPTO:
      handleSkipToSubcommand(interaction);
      break;
    case Subcommands.SEARCH:
      handleSearchSubcommand(interaction);
      break;
    case Subcommands.REPEAT:
      handleRepeatSubcommand(interaction);
      break;
    case Subcommands.SEEK:
      handleSeekSubcommand(interaction);
      break;
    case Subcommands.HELP:
      handleHelpSubcommand(interaction);
      break;
    default:
      interaction.reply({
        content: "Something went wrong. Please try again.",
        ephemeral: true,
      });
      console.log(`*** MUSIC - Subcommand doesn't exist: ${subcommand}`);
  }
};

const musicCommand: Command = {
  data,
  execute,
};

module.exports = musicCommand;
