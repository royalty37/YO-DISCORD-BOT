import { EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music queue subcommand
export const queueSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.QUEUE).setDescription("Shows current queue.");

// Music resume subcommand execution
export const handleQueueSubcommand = async (interaction: Interaction) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get DisTube queue from client from interaction
  const queue = interaction.client.distube.getQueue(interaction.guildId ?? "");

  if (!queue) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO QUEUE");
    return void interaction.reply("❌ | No music is being played!");
  }

  // await interaction.deferReply();

  const embedDescriptions: string[] = [];

  let currentEmbedDescription = "";
  queue.songs.forEach((song, index) => {
    const songToAppend = `${index + 1}. ${song.name}${index === 0 ? " (currently playing)" : ""}\n\n`;
    if (currentEmbedDescription.length + songToAppend.length > 2048) {
      embedDescriptions.push(currentEmbedDescription);
      currentEmbedDescription = songToAppend;
    } else {
      currentEmbedDescription = currentEmbedDescription.concat(songToAppend);
      if (index === queue.songs.length - 1) {
        embedDescriptions.push(currentEmbedDescription);
      }
    }
  });

  console.log(embedDescriptions);

  for (let i = 0; i < embedDescriptions.length; i++) {
    if (i === 0) {
      console.log("*** MUSIC QUEUE SUBCOMMAND - SENDING QUEUE PAGE 1 (i === 0)");
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Random")
            .setTitle("🎶 | Current queue:")
            .setThumbnail(queue.songs[0].thumbnail ?? null)
            .setDescription(embedDescriptions[i])
            .setFooter({ text: `Page 1 of ${embedDescriptions.length}` }),
        ],
      });
    } else {
      console.log(`*** MUSIC QUEUE SUBCOMMAND - SENDING QUEUE PAGE ${i + 1}`);
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor("Random")
            .setTitle("🎶 | Current queue:")
            .setDescription(embedDescriptions[i])
            .setFooter({ text: `Page ${i + 1} of ${embedDescriptions.length}` }),
        ],
      });
    }
  }
};
