import { Subcommands } from "../music";
import { useQueue } from "discord-player";
import { updateLatestQueueMessage } from "../actions/queueActions";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

const INDEX_OPTION_NAME = "index";

const INDEX_REQUIRED = true;

// Music skipto subcommand
export const skipToSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.SKIPTO)
    .setDescription("Skips to the provided index/number in the queue.")
    .addIntegerOption((option) =>
      option
        .setName(INDEX_OPTION_NAME)
        .setDescription("Index/number of song to skip to.")
        .setRequired(INDEX_REQUIRED),
    );

// Music previous subcommand execution
export const handleSkipToSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get queue from distube
  const queue = useQueue(interaction.guildId);

  // If no queue, no music is playing
  if (!queue) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO QUEUE");
    return void interaction.reply("❌ | No music is being played!");
  }

  // Get index from options
  const index = interaction.options.getInteger(
    INDEX_OPTION_NAME,
    INDEX_REQUIRED,
  );

  // Send reply to user
  await interaction.reply(
    `⏭️ | Skipping to track number ${index} in the queue!`,
  );
  console.log(`*** MUSIC SKIPTO SUBCOMMAND - SKIPPED TO ${index}`);

  // Skip to index - catch error if invalid index
  // Index - 1 because of how I've done my queue message - 1 is currently playing and isn't even in the queue
  queue.tracks.remove((_, i) => i < index - 2);
  queue.node.skip();

  // Update latest queue message
  updateLatestQueueMessage(queue);
};
