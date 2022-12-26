import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import Command from "../types/Command";

const pingCommand: Command = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  execute: async (interaction: CommandInteraction) => {
    await interaction.reply("Pong!");
  },
};

module.exports = pingCommand;
