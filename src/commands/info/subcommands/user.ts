import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from "discord.js";
import { subcommands } from "../info";

export const userSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.USER)
    .setDescription("Provides information about the user")
    .addUserOption((option: SlashCommandUserOption) =>
      option.setName("target").setDescription("The user's info you want")
    );

export const handleUserSubcommand = async (interaction: ChatInputCommandInteraction) => {
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
};
