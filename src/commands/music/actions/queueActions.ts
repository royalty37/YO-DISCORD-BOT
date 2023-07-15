import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { REPEAT_MODE_ARRAY } from "../constants/musicConstants";

import type { ChatInputCommandInteraction } from "discord.js";
import type { GuildQueue } from "discord-player";
import type { Interaction } from "../../../types/types";

// CurrentIndex of embedDescription in existing queue message
export let currentIndex = 0;

// Latest queue message interaction
export let latestQueueInteraction: Interaction<ChatInputCommandInteraction>;

// embedDescriptions for printing queue message
export let embedDescriptions: string[] = [];

// Generates embed descriptions for queue message
const generateEmbedDescription = (queue: GuildQueue) => {
  const newEmbedDescriptions: string[] = [];
  let currentEmbedDescription = "";
  const tracks = queue.tracks.toArray();
  if (queue.currentTrack) {
    tracks.unshift(queue.currentTrack);
  }

  tracks.forEach((track, index) => {
    const songToAppend = `${index + 1}. ${track.title}${
      index === 0 ? " (currently playing)" : ""
    }\n\n`;
    if (index !== 0 && index % 10 === 0) {
      newEmbedDescriptions.push(currentEmbedDescription);
      currentEmbedDescription = songToAppend;
    } else {
      currentEmbedDescription += songToAppend;
      if (index === tracks.length - 1) {
        newEmbedDescriptions.push(currentEmbedDescription);
      }
    }
  });

  embedDescriptions = newEmbedDescriptions;
};

// Generates/regenerates reply object when pressing next/previous buttons
export const generateReplyObject = (queue: GuildQueue) => {
  generateEmbedDescription(queue);

  // If currentIndex is out of bounds, set it to the last index (page number decreases as songs are removed from queue)
  if (currentIndex >= embedDescriptions.length) {
    currentIndex = embedDescriptions.length - 1;
  }

  // Create array with current track as first element...
  const tracks = queue.tracks.toArray();
  if (queue.currentTrack) {
    tracks.unshift(queue.currentTrack);
  }

  return {
    embeds: [
      new EmbedBuilder()
        .setColor("Random")
        .setTitle(
          `🎶 | Repeat mode: **${
            REPEAT_MODE_ARRAY[queue.repeatMode]
          }** | Current queue:`,
        )
        .setThumbnail(tracks[currentIndex]?.thumbnail ?? null)
        .setDescription(embedDescriptions[currentIndex])
        .setFooter({
          text: `Page ${currentIndex + 1} of ${embedDescriptions.length}`,
        }),
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
export const updateLatestQueueMessage = async (queue: GuildQueue) => {
  if (latestQueueInteraction) {
    try {
      await latestQueueInteraction.editReply(generateReplyObject(queue));
    } catch (e) {
      console.log(
        "*** UPDATE LATEST QUEUE MESSAGE ERROR - INTERACTION PROBABLY EXPIRED",
        { e },
      );
    }
  }
};

// Updates latest queue message with new embed description saying no songs in queue - called on queue end
export const finishLatestQueueMessage = async () => {
  if (latestQueueInteraction) {
    try {
      await latestQueueInteraction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Random")
            .setTitle("🎶 | Current queue:")
            .setDescription("No songs in queue."),
        ],
      });
    } catch (e) {
      console.log(
        "*** FINISH LATEST QUEUE MESSAGE ERROR - INTERACTION PROBABLY EXPIRED",
        { e },
      );
    }
  }
};

// Sets latest queue message interaction and deletes previous queue message
export const setLatestQueueMessage = (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  if (latestQueueInteraction) {
    try {
      latestQueueInteraction.deleteReply();
    } catch (e) {
      console.log(
        "*** SET LATEST QUEUE MESSAGE ERROR - INTERACTION PROBABLY EXPIRED",
        { e },
      );
    }
  }

  latestQueueInteraction = interaction;
};

// Sets current index of embedDescription - new queue or pressing next/previous buttons
export const setCurrentIndex = (index: number) => {
  currentIndex = index;
};
