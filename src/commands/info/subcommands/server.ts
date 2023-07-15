import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Subcommands } from "../info";
import { Interaction } from "../../../types/types";

// Info Server subcommand
export const serverSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.SERVER)
    .setDescription("Provides information about the server.");

// Server subcommand execution - prints info about server
export const handleServerSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  await interaction.reply(
    `***SERVER INFO***\nServer name: ${interaction?.guild
      ?.name}\nTotal members: ${interaction?.guild
      ?.memberCount}\nServer created: ${interaction?.guild
      ?.createdAt}\nServer owner: ${(await interaction?.guild?.fetchOwner())
      ?.displayName}`,
  );
};
