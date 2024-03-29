import { Subcommands } from "../music";

import type {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Playtop subcommand - play song that is searched for ahead of queue - no handler, uses play handler
export const playTopSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.PLAYTOP)
    .setDescription(
      "Search for a song and play (or add to the front of the queue)!",
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(SONG_OPTION_NAME)
        .setDescription("Song to play!")
        .setRequired(INPUT_REQUIRED),
    );
