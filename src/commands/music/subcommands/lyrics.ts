import { Subcommands } from "../music";

import {
  type SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";
import { useMainPlayer, useQueue } from "discord-player";

// Music lyrics subcommand
export const lyricsSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.LYRICS)
    .setDescription("Prints lyrics of the current song or a searched song.")
    .addStringOption((option) =>
      option.setName("song").setDescription("Song to search for lyrics of."),
    );

// Music lyrics subcommand execution
export const handleLyricsSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  const song =
    interaction.options.getString("song") ??
    useQueue(interaction.guildId!)?.currentTrack?.title;

  if (!song) {
    console.error("*** MUSIC LYRICS SUBCOMMAND - NO SONG");
    return void interaction.reply({
      content:
        "❌ | No song is currently playing and no song option was supplied!",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const player = useMainPlayer();

  try {
    const results = await player.lyrics.search({ q: song });

    if (!results || results.length === 0) {
      return void interaction.editReply({
        content: `❌ | No lyrics found for ${song}!`,
      });
    }

    const lyrics = results[0];
    const lyricsText = lyrics.plainLyrics || "";
    const trimmedLyrics = lyricsText.substring(0, 4096 - 3);

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(lyrics.trackName)
          .setAuthor({ name: lyrics.artistName })
          .setDescription(
            trimmedLyrics.length === 4096 - 3
              ? `${trimmedLyrics}...`
              : trimmedLyrics,
          )
          .setColor("Random"),
      ],
    });
  } catch (e) {
    console.error("*** MUSIC LYRICS SUBCOMMAND - ERROR", { e });
    interaction.editReply({
      content: "❌ | An error occurred while searching for lyrics!",
    });
  }
};
