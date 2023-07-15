import { useQueue } from "discord-player";
import { Subcommands } from "../music";
import { createTrackEmbed } from "../../../utils/messageUtils/messageUtils";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music nowplaying subcommand
export const nowPlayingSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.NOWPLAYING)
    .setDescription("Shows currently playing song.");

// Music nowplaying subcommand execution
export const handleNowPlayingSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // If no guild ID, return
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // If no channel, return
  if (!interaction.channel) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO CHANNEL");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // Get DisTube queue from client from interaction
  const queue = useQueue(interaction.guildId);

  // If no queue, return
  if (!queue || !queue.currentTrack) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO QUEUE");
    return void interaction.reply({
      content: "❌ | No music is being played!",
      ephemeral: true,
    });
  }

  // Send embed show currently playing song
  await interaction.reply({
    embeds: [createTrackEmbed(queue.currentTrack)],
  });
};
