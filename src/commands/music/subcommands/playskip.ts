import {
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { subcommands } from "../music";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Music playskip subcommand - no handler function needed, just use play handler
export const playSkipSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.PLAYSKIP)
    .setDescription("Search for and skip the current song to play a new song!")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName(SONG_OPTION_NAME).setDescription("Song to play!").setRequired(INPUT_REQUIRED)
    );
