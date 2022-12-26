import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import Command from "../types/Command";

const serverCommand: Command = {
  data: new SlashCommandBuilder().setName("server").setDescription("Provides information about the server."),
  execute: async (interaction) => {
    // interaction.guild is the object representing the Guild (server) in which the command was run
    await interaction.reply(
      `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
    );
  },
};

module.exports = serverCommand;
