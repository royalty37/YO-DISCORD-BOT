import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music nowplaying subcommand
export const nowPlayingSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.NOWPLAYING).setDescription("Shows currently playing song.");

// Music nowplaying subcommand execution
export const handleNowPlayingSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  // If no guild ID, return
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // If no channel, return
  if (!interaction.channel) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO CHANNEL");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get DisTube queue from client from interaction
  const queue = interaction.client.distube.getQueue(interaction.guildId);

  // If no queue, return
  if (!queue) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO QUEUE");
    return void interaction.reply("❌ | No music is being played!");
  }

  // Get currently playing song
  const song = queue.songs[0];

  // Send embed show currently playing song
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Random")
        .setTitle("🎶 | Currently playing:")
        .setDescription(`**${song.name}!**`)
        .setThumbnail(song.thumbnail ?? null)
        .addFields([
          {
            name: "**Duration:**",
            value: song.formattedDuration ?? "Unknown",
            inline: true,
          },
          {
            name: "**Views**",
            value: song.views.toString(),
            inline: true,
          },
          {
            name: "**Likes**",
            value: song.likes.toString(),
            inline: true,
          },
        ])
        .setFooter({ text: `Requested by: ${song.user?.username}`, iconURL: song.user?.displayAvatarURL() })
        .setTimestamp(),
    ],
  });
};
