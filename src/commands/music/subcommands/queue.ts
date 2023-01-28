import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music queue subcommand
export const queueSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.QUEUE).setDescription("Shows current queue.");

// Music resume subcommand execution
export const handleQueueSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  if (!interaction.channel) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO CHANNEL");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get DisTube queue from client from interaction
  const queue = interaction.client.distube.getQueue(interaction.guildId ?? "");

  if (!queue) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO QUEUE");
    return void interaction.reply("❌ | No music is being played!");
  }

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

  let currentIndex = 0;

  const message = await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("Random")
        .setTitle("🎶 | Current queue:")
        .setThumbnail(queue.songs[0].thumbnail ?? null)
        .setDescription(embedDescriptions[currentIndex])
        .setFooter({ text: `Page 1 of ${currentIndex + 1}` }),
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setCustomId("queue-prev-page").setLabel("Previous").setStyle(ButtonStyle.Primary),
        // .setDisabled(currentIndex <= 0),
        new ButtonBuilder().setCustomId("queue-next-next").setLabel("Next").setStyle(ButtonStyle.Primary),
        // .setDisabled(currentIndex >= embedDescriptions.length - 1),
      ]),
    ],
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.customId === "queue-prev-page" || i.customId === "queue-next-page",
    time: 1000 * 60 * 5,
  });

  collector.on("collect", async (interaction) => {
    console.log("COLLECTOR HIT");
    if (interaction.customId === "queue-prev-page") {
      console.log("*** MUSIC QUEUE SUBCOMMAND - PREV PAGE");
      currentIndex--;
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor("Random")
            .setTitle("🎶 | Current queue:")
            .setThumbnail(queue.songs[0].thumbnail ?? null)
            .setDescription(embedDescriptions[currentIndex])
            .setFooter({ text: `Page ${currentIndex + 1} of ${embedDescriptions.length}` }),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId("queue-prev-page").setLabel("Previous").setStyle(ButtonStyle.Primary),
            // .setDisabled(currentIndex === 0),
            new ButtonBuilder().setCustomId("queue-next-next").setLabel("Next").setStyle(ButtonStyle.Primary),
            // .setDisabled(currentIndex === embedDescriptions.length - 1),
          ]),
        ],
      });
    } else if (interaction.customId === "queue-next-page") {
      console.log("*** MUSIC QUEUE SUBCOMMAND - NEXT PAGE");
      currentIndex++;
      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor("Random")
            .setTitle("🎶 | Current queue:")
            .setThumbnail(queue.songs[0].thumbnail ?? null)
            .setDescription(embedDescriptions[currentIndex])
            .setFooter({ text: `Page ${currentIndex + 1} of ${embedDescriptions.length}` }),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder().setCustomId("queue-prev-page").setLabel("Previous").setStyle(ButtonStyle.Primary),
            // .setDisabled(currentIndex === 0),
            new ButtonBuilder().setCustomId("queue-next-next").setLabel("Next").setStyle(ButtonStyle.Primary),
            // .setDisabled(currentIndex === embedDescriptions.length - 1),
          ]),
        ],
      });
    }
  });

  // for (let i = 0; i < embedDescriptions.length; i++) {
  //   if (i === 0) {
  //     console.log("*** MUSIC QUEUE SUBCOMMAND - SENDING QUEUE PAGE 1 (i === 0)");
  //     await interaction.reply({
  //       embeds: [
  //         new EmbedBuilder()
  //           .setColor("Random")
  //           .setTitle("🎶 | Current queue:")
  //           .setThumbnail(queue.songs[0].thumbnail ?? null)
  //           .setDescription(embedDescriptions[i])
  //           .setFooter({ text: `Page 1 of ${embedDescriptions.length}` }),
  //       ],
  //     });
  //   } else {
  //     console.log(`*** MUSIC QUEUE SUBCOMMAND - SENDING QUEUE PAGE ${i + 1}`);
  //     await interaction.followUp({
  //       embeds: [
  //         new EmbedBuilder()
  //           .setColor("Random")
  //           .setTitle("🎶 | Current queue:")
  //           .setDescription(embedDescriptions[i])
  //           .setFooter({ text: `Page ${i + 1} of ${embedDescriptions.length}` }),
  //       ],
  //     });
  //   }
  // }
};
