import { updateLatestQueueMessage } from "../actions/queueActions";
import { useQueue } from "discord-player";
import { Subcommands } from "../music";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music shuffle subcommand
export const shuffleSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(Subcommands.SHUFFLE).setDescription("Shuffles the queue.");

// Music shuffle subcommand execution
export const handleShuffleSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // Get queue
  const queue = useQueue(interaction.guildId);

  // If no queue, no music is playing
  if (!queue) {
    console.log("*** MUSIC SHUFFLE SUBCOMMAND - NO QUEUE");
    return void interaction.reply({
      content: "❌ | No music is being played!",
      ephemeral: true,
    });
  }

  queue.tracks.shuffle();
  console.log("*** MUSIC SHUFFLE SUBCOMMAND - SHUFFLED QUEUE");
  await interaction.reply({
    content: "🔀 | Current queue shuffled!",
    ephemeral: true,
  });

  // Update latest queue message upon shuffle
  updateLatestQueueMessage(queue);
};
