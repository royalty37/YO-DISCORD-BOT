import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music skip subcommand
export const skipSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.SKIP).setDescription("Skips the current song.");

// Music leave subcommand execution
export const handleSkipSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
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

  try {
    if (queue.songs.length === 1) {
      interaction.client.distube.stop(interaction.guildId);
      return interaction.reply("⏹️ | Stopped the music!");
    }
    await queue.skip();
    console.log("*** MUSIC SKIP SUBCOMMAND - SKIPPED SONG");
    interaction.reply(`⏭️ | Skipped!`);
  } catch (e) {
    console.error(`*** MUSIC SKIP SUBCOMMAND - EXCEPTION: ${e}`);
    interaction.reply("Something went wrong. Please try again.");
  }
};
