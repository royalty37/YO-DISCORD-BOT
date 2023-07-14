import { Subcommands } from "../music";
import { useTimeline } from "discord-player";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music resume subcommand
export const resumeSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(Subcommands.RESUME).setDescription("Resumes the current song.");

// Music resume subcommand execution
export const handleResumeSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  const timeline = useTimeline(interaction.guildId);
  // Get DisTube queue from client from interaction

  if (!timeline) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO TIMELINE");
    return void interaction.reply({
      content: "❌ | No music is being played!",
      ephemeral: true,
    });
  }

  if (!timeline.paused) {
    console.log("*** MUSIC RESUME SUBCOMMAND - ALREADY PLAYING");
    return void interaction.reply({
      content: "❌ | Music is already playing!",
      ephemeral: true,
    });
  }

  console.log("*** MUSIC RESUME SUBCOMMAND - RESUMING QUEUE");
  timeline.resume();
  interaction.reply("▶️ | Resumed!");
};
