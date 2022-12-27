import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../types/Command";

const INPUT_REQUIRED = true;

const echoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input!")
    .addStringOption((option) =>
      option.setName("input").setDescription("Input to echo back").setRequired(INPUT_REQUIRED)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const echoMessage = interaction.options.getString("input", INPUT_REQUIRED);
    await interaction.reply(echoMessage);
  },
};

module.exports = echoCommand;
