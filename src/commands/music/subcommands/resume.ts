import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import YoClient from "../../../types/YoClient";
import { subcommands } from "../music";

// Music resume subcommand
export const resumeSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.RESUME).setDescription("Resumes the current song.");

// Music resume subcommand execution
export const handleResumeSubcommand = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get DisTube queue from client from interaction
  const queue = (interaction.client as YoClient).distube.getQueue(interaction.guildId ?? "");

  if (!queue) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO QUEUE");
    return void interaction.reply("❌ | No music is being played!");
  }

  if (queue.paused) {
    console.log("*** MUSIC RESUME SUBCOMMAND - RESUMING QUEUE");
    queue.resume();
    return void interaction.reply("▶ | Resumed!");
  } else {
    console.log("*** MUSIC RESUME SUBCOMMAND - ALREADY PLAYING");
    return void interaction.reply("❌ | Music is already playing!");
  }
};
