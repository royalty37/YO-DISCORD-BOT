import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { Interaction } from "../../../types/types";
import { updateLatestQueueMessage } from "../actions/queueActions";
import { subcommands } from "../music";

// Music pause subcommand
export const shuffleSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.SHUFFLE).setDescription("Shuffles the queue.");

// Music pause subcommand execution
export const handleShuffleSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
  }

  // Get queue from distube
  const queue = interaction.client.distube.getQueue(interaction.guildId);

  // If no queue, no music is playing
  if (!queue) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO QUEUE");
    return void interaction.reply({ content: "❌ | No music is being played!", ephemeral: true });
  }

  queue.shuffle();
  console.log("*** MUSIC SHUFFLE SUBCOMMAND - SHUFFLED QUEUE");
  await interaction.reply({ content: "🔀 | Current queue shuffled!", ephemeral: true });

  // Update latest queue message upon shuffle
  updateLatestQueueMessage(queue);
};
