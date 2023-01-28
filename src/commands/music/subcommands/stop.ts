import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music skip subcommand
export const stopSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.STOP).setDescription("Skips the current song.");

// Music leave subcommand execution
export const handleStopSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  // If no guildId, return
  if (!interaction.guildId) {
    console.log("*** MUSIC SKIP SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  const queue = interaction.client.distube.getQueue(interaction.guildId);

  if (!queue) {
    console.error("*** MUSIC SKIP SUBCOMMAND - NO QUEUE");
    return interaction.reply("❌ | No song is playing!");
  }

  queue.stop();
  console.log("*** MUSIC SKIP SUBCOMMAND - SKIPPED SONG");
  interaction.reply(`⏹️ | Stopped!`);
};
