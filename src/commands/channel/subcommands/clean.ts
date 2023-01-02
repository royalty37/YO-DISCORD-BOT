import { ChatInputCommandInteraction, Message, SlashCommandSubcommandBuilder } from "discord.js";
import { subcommands } from "../channel";
import { filterInvites, filterBannedWords } from "../../../utils/messageUtils/messageUtils";

// Clean channel subcommand
export const cleanSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.CLEAN).setDescription("Clean messages in this channel.");

// Clean subcommand execution - cleans/filters messages in channel that I deem inappropriate
export const handleCleanSubcommand = async (interaction: ChatInputCommandInteraction) => {
  interaction.deferReply();
  interaction.editReply("Cleaning channel...");

  let messages: Message[] = [];

  let message = await interaction.channel?.messages
    .fetch({ limit: 1 })
    .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

  while (message) {
    await interaction.channel?.messages.fetch({ limit: 100, before: message.id }).then((messagePage) => {
      messagePage.forEach((message) => messages.push(message));

      message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
    });
  }

  for (const message of messages) {
    await filterInvites(message);
    await filterBannedWords(message);
  }

  interaction.followUp("Channel cleaned of disallowed/offensive words/statements.");
};
