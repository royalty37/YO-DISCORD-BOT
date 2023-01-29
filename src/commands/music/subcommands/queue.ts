import { ChatInputCommandInteraction, ComponentType, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";
import { setLatestQueueMessage, currentIndex, setCurrentIndex, generateReplyObject } from "../actions/queueActions";

// Music queue subcommand
export const queueSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.QUEUE).setDescription("Shows current queue.");

// Music resume subcommand execution
export const handleQueueSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
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

  // Array of embed descriptions for separate pages
  // const embedDescriptions: string[] = [];

  // Loop through all songs and build up embed descriptions array with 10 songs per page
  // let currentEmbedDescription = "";
  // queue.songs.forEach((song, index) => {
  //   const songToAppend = `${index + 1}. ${song.name}${index === 0 ? " (currently playing)" : ""}\n\n`;
  //   if (index !== 0 && index % 10 === 0) {
  //     embedDescriptions.push(currentEmbedDescription);
  //     currentEmbedDescription = songToAppend;
  //   } else {
  //     currentEmbedDescription += songToAppend;
  //     if (index === queue.songs.length - 1) {
  //       embedDescriptions.push(currentEmbedDescription);
  //     }
  //   }
  // });

  // Current page index - starts at 0
  setCurrentIndex(0);

  // Reply with first page and get message object
  const message = await interaction.reply(generateReplyObject(queue));

  setLatestQueueMessage(interaction);

  // Create message component collector
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 1000 * 60 * 10, // 10 minutes
  });

  // On collect increment/decrement current index and regenerate reply object
  collector.on("collect", async (interaction) => {
    if (interaction.customId === "queue-prev-page") {
      console.log("*** MUSIC QUEUE SUBCOMMAND - PREV PAGE");
      setCurrentIndex(currentIndex - 1);
    } else if (interaction.customId === "queue-next-page") {
      console.log("*** MUSIC QUEUE SUBCOMMAND - NEXT PAGE");
      setCurrentIndex(currentIndex + 1);
    }

    await interaction.update(generateReplyObject(queue));
  });
};
