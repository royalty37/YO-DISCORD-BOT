import { SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music leave subcommand
export const leaveSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.LEAVE).setDescription("Leaves the voice channel (if in one).");

// Music leave subcommand execution
export const handleLeaveSubcommand = async (interaction: Interaction) => {
  if (!interaction.client.distube.voices.size) {
    console.error("*** MUSIC LEAVE SUBCOMMAND - NOT IN VOICE CHANNEL");
    return void interaction.reply("❌ | I'm not in a voice channel!");
  }

  if (!interaction.guildId) {
    console.log("*** MUSIC LEAVE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  interaction.client.distube.voices.leave(interaction.guildId);
  interaction.reply("Left the voice channel!");
};
