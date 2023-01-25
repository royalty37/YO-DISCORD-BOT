import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import YoClient from "../../../types/YoClient";
import { subcommands } from "../music";

// Music pause subcommand
export const pauseSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.PAUSE).setDescription("Pauses the current song.");

// Music pause subcommand execution
export const handlePauseSubcommand = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get DisTube from client from interaction
  const { distube } = interaction.client as YoClient;
  const queue = distube.getQueue(interaction.guildId ?? "");

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
  distube.pause(interaction.guildId);

  // Reply to user
  interaction.reply("⏸ | Paused!");
};
