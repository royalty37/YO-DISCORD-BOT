import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandStringOption } from "discord.js";
import { Command, Interaction } from "../../types/types";

const INPUT_OPTION_NAME = "input";
const INPUT_REQUIRED = true;

// Really basic command that echos input - used for testing/learning
const echoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName(INPUT_OPTION_NAME)
    .setDescription("Replies with your input!")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("input").setDescription("Input to echo back").setRequired(INPUT_REQUIRED)
    ),
  execute: async (interaction: Interaction) => {
    const echoMessage = interaction.options.getString(INPUT_OPTION_NAME, INPUT_REQUIRED);
    await interaction.reply(echoMessage);
  },
};

module.exports = echoCommand;
