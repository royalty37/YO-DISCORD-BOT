import { Subcommands } from "../music";

import type {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Music playskip subcommand - no handler function needed, just use play handler
export const playSkipSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.PLAYSKIP)
    .setDescription("Search for and skip the current song to play a new song!")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(SONG_OPTION_NAME)
        .setDescription("Song to play!")
        .setRequired(INPUT_REQUIRED),
    );
