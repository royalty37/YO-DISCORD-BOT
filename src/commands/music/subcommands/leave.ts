import { Subcommands } from "../music";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music leave subcommand
export const leaveSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.LEAVE)
    .setDescription("Leaves the voice channel (if in one).");

// Music leave subcommand execution
export const handleLeaveSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }
  // If not in voice channel, return
  const connection = interaction.client.player.voiceUtils.getConnection(
    interaction.guildId,
  );

  if (!connection) {
    console.error("*** MUSIC LEAVE SUBCOMMAND - NOT IN VOICE CHANNEL");
    return void interaction.reply({
      content: "❌ | I'm not in a voice channel!",
      ephemeral: true,
    });
  }

  // If no guild ID, return
  if (!interaction.guildId) {
    console.log("*** MUSIC LEAVE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // Leave voice channel
  connection.disconnect();

  // Reply to user
  interaction.reply({ content: "Left the voice channel!", ephemeral: true });
};
