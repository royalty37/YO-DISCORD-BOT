import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import YoClient from "../../../types/YoClient";
import { subcommands } from "../music";

// Music resume subcommand
export const resumeSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.RESUME).setDescription("Resumes the current song.");

// Music resume subcommand execution
export const handleResumeSubcommand = async (interaction: ChatInputCommandInteraction) => {
  // Get player from client from interaction
  // const { player } = interaction.client as YoClient;
  // await interaction.deferReply();
  // // If no music is playing, return
  // const queue = player.getQueue(interaction.guildId ?? "");
  // if (!queue?.playing) {
  //   return void interaction.followUp("❌ | No music is being played!");
  // }
  // // Resume music and send appropriate message
  // interaction.followUp(queue.setPaused(false) ? "▶ | Resumed!" : "❌ | Something went wrong!");
};
