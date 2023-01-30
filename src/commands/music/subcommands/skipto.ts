import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { Interaction } from "../../../types/types";
import { subcommands } from "../music";

// Music skipto subcommand
export const skipToSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.SKIPTO)
    .setDescription("Skips to the provided index/number in the queue.")
    .addIntegerOption((option) =>
      option.setName("index").setDescription("Index/number of song to skip to.").setRequired(true)
    );

// Music previous subcommand execution
export const handleSkipToSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  if (!interaction.guildId) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get queue from distube
  const queue = interaction.client.distube.getQueue(interaction.guildId);

  // If no queue, no music is playing
  if (!queue) {
    console.log("*** MUSIC PAUSE SUBCOMMAND - NO QUEUE");
    return void interaction.reply("❌ | No music is being played!");
  }

  // Get index from options
  const index = interaction.options.getInteger("index", true);

  // Send reply to user
  await interaction.reply(`⏭️ | Skipping to track number ${index} in the queue!`);
  console.log(`*** MUSIC SKIPTO SUBCOMMAND - SKIPPED TO ${index}`);

  // Skip to index - catch error if invalid index
  // Index - 1 because of how I've done my queue message - 1 is currently playing
  queue.jump(index - 1).catch((e: Error) => {
    console.log(`*** MUSIC SKIPTO SUBCOMMAND - ERROR: ${e}`);
    interaction.editReply("❌ | Invalid index provided!");
  });
};
