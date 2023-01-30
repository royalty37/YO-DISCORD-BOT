import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { Interaction } from "../../../types/types";
import { updateLatestQueueMessage } from "../actions/queueActions";
import { subcommands } from "../music";

// Music previous subcommand
export const previousSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.SHUFFLE).setDescription("Shuffles the queue.");

// Music previous subcommand execution
export const handleShuffleSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get queue from distube
  const queue = interaction.client.distube.getQueue(interaction.guildId);

  // If no queue, no music is playing
  if (!queue) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO QUEUE");
    return void interaction.reply("❌ | No music is being played!");
  }

  // Send reply to user
  await interaction.reply("⏮ | Playing previous song!");
  console.log("*** MUSIC SHUFFLE SUBCOMMAND - SHUFFLED QUEUE");

  // Play previous song
  queue.previous();

  // Update latest queue message upon shuffle
  updateLatestQueueMessage(queue);
};
