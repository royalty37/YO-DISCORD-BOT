import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from "discord.js";
import { subcommands } from "../info";

// Info User subcommand - has optional user parameter that if not provided will default to the user who invoked the command
export const userSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.USER)
    .setDescription("Provides information about the user")
    .addUserOption((option: SlashCommandUserOption) =>
      option.setName("user").setDescription("The user's info you want")
    );

// User subcommand execution - prints info about user
export const handleUserSubcommand = async (interaction: ChatInputCommandInteraction) => {
  // Get user from user option
  const user = interaction.options.getUser("user");

  // If user is provided, fetch user from guild and print info about user
  // Else, print info about user who invoked the command
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
};
