import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import YoClient from "../../../types/YoClient";
import { subcommands } from "../music";

export const pauseSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.PAUSE).setDescription("Pauses the current song.");

export const handlePauseSubcommand = async (interaction: ChatInputCommandInteraction) => {
  const { player } = interaction.client as YoClient;

  await interaction.deferReply();

  const queue = player.getQueue(interaction.guildId ?? "");
  if (!queue || !queue.playing) {
    return void (await interaction.followUp("❌ | No music is being played!"));
  }

  return void interaction.followUp(queue.setPaused(true) ? "⏸ | Paused!" : "❌ | Something went wrong!");
};
