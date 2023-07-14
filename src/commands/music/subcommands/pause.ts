import { Subcommands } from "../music";
import { useTimeline } from "discord-player";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// Music pause subcommand
export const pauseSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(Subcommands.PAUSE).setDescription("Pauses the current song.");

// Music pause subcommand execution
export const handlePauseSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // Get queue
  const timeline = useTimeline(interaction.guildId);

  // If no queue, no music is playing
  if (!timeline) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO TIMELINE");
    return void interaction.reply({
      content: "❌ | No music is being played!",
      ephemeral: true,
    });
  }

  // If no queue, no music is playing
  if (!timeline.track) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO TRACK");
    return void interaction.reply({
      content: "❌ | No music is being played!",
      ephemeral: true,
    });
  }

  // If music is already paused, don't pause it again
  if (timeline.paused) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - ALREADY PAUSED");
    return void interaction.reply({
      content: "❌ | Music is already paused!",
      ephemeral: true,
    });
  }

  // Pause the music
  timeline.pause();

  // Reply to user
  interaction.reply("⏸ | Paused!");
};
