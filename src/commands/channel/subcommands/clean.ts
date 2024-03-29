import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Subcommands } from "../channel";
import { filterMessages } from "../../../utils/messageUtils/messageUtils";
import { Interaction } from "../../../types/types";

// Clean channel subcommand
export const cleanSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.CLEAN)
    .setDescription("Clean messages in this channel.");

// Clean subcommand execution - cleans/filters messages in channel that I deem inappropriate
export const handleCleanSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  interaction.deferReply();
  interaction.editReply("Cleaning channel...");

  // Fetch all messages in channel in batches of 100 as this is the most that can be fetched at once
  const messages: Message[] = [];
  let message = await interaction.channel?.messages
    .fetch({ limit: 1 })
    .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

  while (message) {
    await interaction.channel?.messages
      .fetch({ limit: 100, before: message.id })
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      .then((messagePage) => {
        messagePage.forEach((m) => messages.push(m));
        message =
          0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
      });
  }

  // Loop through all fetched messages and filter them through filter functions
  for (const m of messages) {
    filterMessages(m);
  }

  interaction.followUp(
    "Channel cleaned of disallowed/offensive words/statements.",
  );
};
