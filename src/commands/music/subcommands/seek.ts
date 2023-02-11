import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

const MINUTES_OPTION_NAME = "minutes";
const SECONDS_OPTION_NAME = "seconds";

const MINUTES_AND_SECONDS_REQUIRED = true;

// Music resume subcommand
export const seekSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.SEEK)
    .setDescription("Seeks the specific position in the current song.")
    .addIntegerOption((option) =>
      option
        .setName(MINUTES_OPTION_NAME)
        .setDescription("Minutes to seek in format m:m")
        .setRequired(MINUTES_AND_SECONDS_REQUIRED)
    )
    .addIntegerOption((option) =>
      option
        .setName(SECONDS_OPTION_NAME)
        .setDescription("Seconds to seek in format s:s")
        .setRequired(MINUTES_AND_SECONDS_REQUIRED)
    );

// Music resume subcommand execution
export const handleSeekSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  // If no guild ID, return
  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
  }

  // Get DisTube queue from client from interaction
  const queue = interaction.client.distube.getQueue(interaction.guildId);

  // If no queue, return
  if (!queue) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO QUEUE");
    return void interaction.reply({ content: "❌ | No music is being played!", ephemeral: true });
  }

  // Get minutes and seconds from interaction
  const minutes = interaction.options.getInteger(MINUTES_OPTION_NAME, MINUTES_AND_SECONDS_REQUIRED);
  const seconds = interaction.options.getInteger(SECONDS_OPTION_NAME, MINUTES_AND_SECONDS_REQUIRED);

  // Calculate total seconds
  const totalSeconds = minutes * 60 + seconds;

  // Seek to total seconds
  queue.seek(totalSeconds);

  // Reply with seeked to
  interaction.reply({ content: `⏩ | Seeked to ${minutes}:${seconds}`, ephemeral: true });
};
