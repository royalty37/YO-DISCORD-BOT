import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";
import { finishLatestQueueMessage } from "../actions/queueActions";

// Music skip subcommand
export const stopSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.STOP).setDescription("Skips the current song.");

// Music leave subcommand execution
export const handleStopSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  // If no guildId, return
  if (!interaction.guildId) {
    console.log("*** MUSIC SKIP SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
  }

  // Get queue from distube
  const queue = interaction.client.distube.getQueue(interaction.guildId);

  // If no queue, return
  if (!queue) {
    console.error("*** MUSIC SKIP SUBCOMMAND - NO QUEUE");
    return interaction.reply({ content: "❌ | No song is playing!", ephemeral: true });
  }

  // Stop queue
  queue.stop();

  console.log("*** MUSIC STOP SUBCOMMAND - STOPPED QUEUE");
  await interaction.reply(`⏹️ | Stopped!`);

  // Update latest queue message upon stop
  finishLatestQueueMessage();
};
