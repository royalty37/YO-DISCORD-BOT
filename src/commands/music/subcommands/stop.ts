import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Subcommands } from "../music";
import { Interaction } from "../../../types/types";
import { finishLatestQueueMessage } from "../actions/queueActions";
import { useQueue } from "discord-player";

// Music skip subcommand
export const stopSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.STOP)
    .setDescription("Stops music and clears the queue.");

// Music leave subcommand execution
export const handleStopSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // If no guildId, return
  if (!interaction.guildId) {
    console.log("*** MUSIC STOP SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // Get queue from distube
  const queue = useQueue(interaction.guildId);

  // If no queue, return
  if (!queue) {
    console.error("*** MUSIC STOP SUBCOMMAND - NO QUEUE");
    return interaction.reply({
      content: "❌ | No song is playing!",
      ephemeral: true,
    });
  }

  // Clear queue
  queue.clear();

  console.log("*** MUSIC STOP SUBCOMMAND - STOPPED QUEUE");
  await interaction.reply(`⏹️ | Stopped!`);

  // Update latest queue message upon stop
  finishLatestQueueMessage();
};
