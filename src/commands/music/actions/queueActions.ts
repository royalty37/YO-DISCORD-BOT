import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { Queue } from "distube";
import { Interaction } from "../../../types/types";
import { REPEAT_MODE_ARRAY } from "../constants/musicConstants";

// CurrentIndex of embedDescription in existing queue message
export let currentIndex = 0;

// Latest queue message interaction
export let latestQueueInteraction: Interaction<ChatInputCommandInteraction>;

// embedDescriptions for printing queue message
export let embedDescriptions: string[] = [];

// Generates embed descriptions for queue message
const generateEmbedDescription = (queue: Queue) => {
  const newEmbedDescriptions: string[] = [];
  let currentEmbedDescription = "";
  queue.songs.forEach((song, index) => {
    const songToAppend = `${index + 1}. ${song.name}${index === 0 ? " (currently playing)" : ""}\n\n`;
    if (index !== 0 && index % 10 === 0) {
      newEmbedDescriptions.push(currentEmbedDescription);
      currentEmbedDescription = songToAppend;
    } else {
      currentEmbedDescription += songToAppend;
      if (index === queue.songs.length - 1) {
        newEmbedDescriptions.push(currentEmbedDescription);
      }
    }
  });

  embedDescriptions = newEmbedDescriptions;
};

// Generates/regenerates reply object when pressing next/previous buttons
export const generateReplyObject = (queue: Queue) => {
  generateEmbedDescription(queue);

  // If currentIndex is out of bounds, set it to the last index (page number decreases as songs are removed from queue)
  if (currentIndex >= embedDescriptions.length) {
    currentIndex = embedDescriptions.length - 1;
  }

  return {
    embeds: [
      new EmbedBuilder()
        .setColor("Random")
        .setTitle(`🎶 | Repeat mode: **${REPEAT_MODE_ARRAY[queue.repeatMode]}** | Current queue:`)
        .setThumbnail(queue.songs[currentIndex].thumbnail ?? null)
        .setDescription(embedDescriptions[currentIndex])
        .setFooter({ text: `Page ${currentIndex + 1} of ${embedDescriptions.length}` }),
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setCustomId("queue-prev-page")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentIndex <= 0),
        new ButtonBuilder()
          .setCustomId("queue-next-page")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentIndex >= embedDescriptions.length - 1),
      ]),
    ],
  };
};

// Updates latest queue message with new embed description
export const updateLatestQueueMessage = async (queue: Queue) => {
  if (latestQueueInteraction) {
    try {
      await latestQueueInteraction.editReply(generateReplyObject(queue));
    } catch (e) {
      console.log("*** UPDATE LATEST QUEUE MESSAGE ERROR - INTERACTION PROBABLY EXPIRED");
    }
  }
};

// Updates latest queue message with new embed description saying no songs in queue - called on queue end
export const finishLatestQueueMessage = async () => {
  if (latestQueueInteraction) {
    try {
      await latestQueueInteraction.editReply({
        embeds: [
          new EmbedBuilder().setColor("Random").setTitle("🎶 | Current queue:").setDescription("No songs in queue."),
        ],
      });
    } catch (e) {
      console.log("*** FINISH LATEST QUEUE MESSAGE ERROR - INTERACTION PROBABLY EXPIRED");
    }
  }
};

// Sets latest queue message interaction and deletes previous queue message
export const setLatestQueueMessage = (interaction: Interaction<ChatInputCommandInteraction>) => {
  if (latestQueueInteraction) {
    try {
      latestQueueInteraction.deleteReply();
    } catch (e) {
      console.log("*** SET LATEST QUEUE MESSAGE ERROR - INTERACTION PROBABLY EXPIRED");
    }
  }

  latestQueueInteraction = interaction;
};

// Sets current index of embedDescription - new queue or pressing next/previous buttons
export const setCurrentIndex = (index: number) => {
  currentIndex = index;
};
