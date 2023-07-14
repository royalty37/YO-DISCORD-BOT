import { ComponentType } from "discord.js";
import {
  setLatestQueueMessage,
  currentIndex,
  setCurrentIndex,
  generateReplyObject,
  updateLatestQueueMessage,
} from "../actions/queueActions";
import { Subcommands } from "../music";
import { useQueue } from "discord-player";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music queue subcommand
export const queueSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(Subcommands.QUEUE).setDescription("Shows current queue.");

// Music resume subcommand execution
export const handleQueueSubcommand = async (
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
  if (!queue) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO QUEUE");
    return void interaction.reply({
      content: "❌ | No music is being played!",
      ephemeral: true,
    });
  }

  // Set current index to 0 for new queue message
  setCurrentIndex(0);

  // Reply with first page and get message object
  const message = await interaction.reply(generateReplyObject(queue));

  // Set latest queue message to this interaction - delete old one
  setLatestQueueMessage(interaction);

  // Create message component collector
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 1000 * 60 * 60, // 1 hour - will probably be replaced by then anyway
  });

  // On collect increment/decrement current index and regenerate reply object
  collector.on("collect", async (i) => {
    if (i.customId === "queue-prev-page") {
      console.log("*** MUSIC QUEUE SUBCOMMAND - PREV PAGE");
      setCurrentIndex(currentIndex - 1);
    } else if (i.customId === "queue-next-page") {
      console.log("*** MUSIC QUEUE SUBCOMMAND - NEXT PAGE");
      setCurrentIndex(currentIndex + 1);
    }

    updateLatestQueueMessage(queue);
  });
};
