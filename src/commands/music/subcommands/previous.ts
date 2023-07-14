import { updateLatestQueueMessage } from "../actions/queueActions";
import { Subcommands } from "../music";
import { useHistory } from "discord-player";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music previous subcommand
export const previousSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(Subcommands.SHUFFLE).setDescription("Shuffles the queue.");

// Music previous subcommand execution
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

  // Get history
  const history = useHistory(interaction.guildId);

  // If no queue, no music is playing
  if (!history) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO HISTORY");
    return void interaction.reply({
      content: "❌ | No queue history!",
      ephemeral: true,
    });
  }

  // Send reply to user
  await interaction.reply({
    content: "⏮ | Playing previous song!",
    ephemeral: true,
  });
  console.log("*** MUSIC PREVIOUS SUBCOMMAND - GOING TO PREVIOUS TRACK");

  // Play previous song
  history.previous();

  // Update latest queue message upon shuffle
  updateLatestQueueMessage(history.queue);
};
