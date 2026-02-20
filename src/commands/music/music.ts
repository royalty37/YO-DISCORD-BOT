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
import { lyricsSubcommand, handleLyricsSubcommand } from "./subcommands/lyrics";
import {
  previousSubcommand,
  handlePreviousSubcommand,
} from "./subcommands/previous";
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
  LYRICS = "lyrics",
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
  .addSubcommand(previousSubcommand)
  .addSubcommand(helpSubcommand)
  .addSubcommand(lyricsSubcommand);

// Handler map for subcommands
const subcommandHandlers: Record<
  string,
  (interaction: Interaction<ChatInputCommandInteraction>) => void
> = {
  [Subcommands.PLAY]: handlePlaySubcommand,
  [Subcommands.SHORTHAND_PLAY]: handlePlaySubcommand,
  [Subcommands.PAUSE]: handlePauseSubcommand,
  [Subcommands.RESUME]: handleResumeSubcommand,
  [Subcommands.JOIN]: handleJoinSubcommand,
  [Subcommands.LEAVE]: handleLeaveSubcommand,
  [Subcommands.SKIP]: handleSkipSubcommand,
  [Subcommands.STOP]: handleStopSubcommand,
  [Subcommands.QUEUE]: handleQueueSubcommand,
  [Subcommands.NOWPLAYING]: handleNowPlayingSubcommand,
  [Subcommands.PLAYSKIP]: (interaction) => handlePlaySubcommand(interaction, true),
  [Subcommands.PLAYTOP]: (interaction) => handlePlaySubcommand(interaction, false, true),
  [Subcommands.SHUFFLE]: handleShuffleSubcommand,
  [Subcommands.SKIPTO]: handleSkipToSubcommand,
  [Subcommands.SEARCH]: handleSearchSubcommand,
  [Subcommands.REPEAT]: handleRepeatSubcommand,
  [Subcommands.SEEK]: handleSeekSubcommand,
  [Subcommands.HELP]: handleHelpSubcommand,
  [Subcommands.LYRICS]: handleLyricsSubcommand,
  [Subcommands.PREVIOUS]: handlePreviousSubcommand,
};

// Music command execute function
const execute = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  const subcommand = interaction.options.getSubcommand();
  const handler = subcommandHandlers[subcommand];

  if (handler) {
    handler(interaction);
  } else {
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

export default musicCommand;

