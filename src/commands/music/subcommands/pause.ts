import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { Interaction } from "../../../types/types";
import { subcommands } from "../music";

// Music pause subcommand
export const pauseSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.PAUSE).setDescription("Pauses the current song.");

// Music pause subcommand execution
export const handlePauseSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
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

  // If music is already paused, don't pause it again
  if (queue.paused) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - ALREADY PAUSED");
    return void interaction.reply("❌ | Music is already paused!");
  }

  // Pause the music
  interaction.client.distube.pause(interaction.guildId);

  // Reply to user
  interaction.reply("⏸ | Paused!");
};
