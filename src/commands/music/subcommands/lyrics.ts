import { Subcommands } from "../music";
import { lyricsExtractor } from "@discord-player/extractor";

import {
  type SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";
import { useQueue } from "discord-player";

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

  interaction.deferReply();

  const lyricsFinder = lyricsExtractor();

  try {
    const lyrics = await lyricsFinder.search(song);

    if (!lyrics) {
      return void interaction.editReply({
        content: `❌ | No lyrics found for ${song}!`,
      });
    }

    const trimmedLyrics = lyrics.lyrics.substring(0, 4096 - 3);

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(lyrics.title)
          .setURL(lyrics.url)
          .setThumbnail(lyrics.thumbnail)
          .setAuthor({
            name: lyrics.artist.name,
            iconURL: lyrics.artist.image,
            url: lyrics.artist.url,
          })
          .setDescription(
            trimmedLyrics.length === 4096 - 3
              ? `${trimmedLyrics}...`
              : trimmedLyrics,
          )
          .setColor("Random"),
      ],
    });
  } catch (e) {
    console.error("*** MUSIC LYRICS SUBCOMMAND - NO SONG", { e });
    interaction.editReply({
      content: "❌ | An error occurred while searching for lyrics!",
    });
  }
};
