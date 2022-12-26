import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../types/Command";

const pingCommand: Command = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({ content: "Pong!", ephemeral: true });
  },
};

module.exports = pingCommand;
