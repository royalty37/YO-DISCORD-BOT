import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
  GuildMember,
} from "discord.js";
import Command from "../types/Command";

const serverSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName("server").setDescription("Provides information about the server.");

const userSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName("user")
    .setDescription("Provides information about the user")
    .addUserOption((option) => option.setName("target").setDescription("The user's info you want"));

const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Provides information about the server or user.")
  .addSubcommand(serverSubcommand)
  .addSubcommand(userSubcommand);

const execute = async (interaction: ChatInputCommandInteraction) => {
  // interaction.guild is the object representing the Guild (server) in which the command was run
  if (interaction.options.getSubcommand() === "user") {
    const user = interaction.options.getUser("target");

    if (user) {
      const member = await interaction.guild?.members.fetch({ user });
      await interaction.reply(
        `***USER INFO***\nUsername: ${user.username}\nUser ID: ${interaction.user.id}\nUser joined: ${member?.joinedAt}.\nUser created: ${user.createdAt}`
      );
    } else {
      await interaction.reply(
        `***USER INFO***\nUsername: ${interaction.user.username}\nUser ID: ${interaction.user.id}\nUser joined: ${
          (interaction.member as GuildMember).joinedAt
        }.\nUser created: ${interaction.user.createdAt}`
      );
    }
  } else if (interaction.options.getSubcommand() === "server") {
    await interaction.reply(
      `***SERVER INFO***\nServer name: ${interaction?.guild?.name}\nTotal members: ${
        interaction?.guild?.memberCount
      }\nServer created: ${interaction?.guild?.createdAt}\nServer owner: ${
        (
          await interaction?.guild?.fetchOwner()
        )?.displayName
      }`
    );
  }
};

const infoCommand: Command = {
  data,
  execute,
};

module.exports = infoCommand;
