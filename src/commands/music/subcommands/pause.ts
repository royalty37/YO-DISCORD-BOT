import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import YoClient from "../../../types/YoClient";
import { subcommands } from "../music";

// Music pause subcommand
export const pauseSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.PAUSE).setDescription("Pauses the current song.");

// Music pause subcommand execution
export const handlePauseSubcommand = async (interaction: ChatInputCommandInteraction) => {
  // Get player from client from interaction
  const { player } = interaction.client as YoClient;

  await interaction.deferReply();

  // If no music is playing, return
  const queue = player.getQueue(interaction.guildId ?? "");
  if (!queue?.playing) {
    return void (await interaction.followUp("❌ | No music is being played!"));
  }

  // Pause music and send appropriate message
  return void interaction.followUp(queue.setPaused(true) ? "⏸ | Paused!" : "❌ | Something went wrong!");
};
