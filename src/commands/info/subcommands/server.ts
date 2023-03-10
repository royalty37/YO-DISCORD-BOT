import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../info";

// Info Server subcommand
export const serverSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.SERVER).setDescription("Provides information about the server.");

// Server subcommand execution - prints info about server
export const handleServerSubcommand = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply(
    `***SERVER INFO***\nServer name: ${interaction?.guild?.name}\nTotal members: ${
      interaction?.guild?.memberCount
    }\nServer created: ${interaction?.guild?.createdAt}\nServer owner: ${
      (
        await interaction?.guild?.fetchOwner()
      )?.displayName
    }`
  );
};
