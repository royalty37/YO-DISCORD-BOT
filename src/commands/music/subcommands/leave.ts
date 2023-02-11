import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music leave subcommand
export const leaveSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.LEAVE).setDescription("Leaves the voice channel (if in one).");

// Music leave subcommand execution
export const handleLeaveSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  // If not in voice channel, return
  if (!interaction.client.distube.voices.size) {
    console.error("*** MUSIC LEAVE SUBCOMMAND - NOT IN VOICE CHANNEL");
    return void interaction.reply({ content: "❌ | I'm not in a voice channel!", ephemeral: true });
  }

  // If no guild ID, return
  if (!interaction.guildId) {
    console.log("*** MUSIC LEAVE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
  }

  // Leave voice channel
  interaction.client.distube.voices.leave(interaction.guildId);

  // Reply to user
  interaction.reply({ content: "Left the voice channel!", ephemeral: true });
};
