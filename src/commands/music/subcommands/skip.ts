import { finishLatestQueueMessage } from "../actions/queueActions";
import { useQueue } from "discord-player";
import { Subcommands } from "../music";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music skip subcommand
export const skipSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(Subcommands.SKIP).setDescription("Skips the current song.");

// Music leave subcommand execution
export const handleSkipSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // If no guildId, return
  if (!interaction.guildId) {
    console.log("*** MUSIC SKIP SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // Get queue
  const queue = useQueue(interaction.guildId);

  // If no queue, return
  if (!queue) {
    console.error("*** MUSIC SKIP SUBCOMMAND - NO QUEUE");
    return interaction.reply({
      content: "❌ | No song is playing!",
      ephemeral: true,
    });
  }

  try {
    // If only one song in queue, stop the queue and return
    if (!queue.tracks.toArray().length) {
      queue?.node.stop();
      console.log("*** MUSIC SKIP SUBCOMMAND - STOPPED QUEUE");
      interaction.reply("⏹️ | Stopped the music!");

      // Update latest queue message upon stop and return
      return await finishLatestQueueMessage();
    }

    // Skip song
    queue.node.skip();
    console.log("*** MUSIC SKIP SUBCOMMAND - SKIPPED SONG");
    interaction.reply(`⏭️ | Skipped!`);
  } catch (e) {
    console.error(`*** MUSIC SKIP SUBCOMMAND - EXCEPTION: ${e}`);
    interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }
};
