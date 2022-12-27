import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";

export const serverSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName("server").setDescription("Provides information about the server.");

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
