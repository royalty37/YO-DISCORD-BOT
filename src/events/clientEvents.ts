import { Client, Events, BaseInteraction } from "discord.js";
import YoClient from "../types/YoClient";

// Register client events
export const registerClientEvents = (client: YoClient) => {
  // InteractionCreate event
  client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
    // If interaction is not a chat input command, return
    if (!interaction.isChatInputCommand()) {
      return console.error('Interaction is not a chat input command.');
    }

    // Get command from client commands collection
    const command = (interaction.client as YoClient).commands.get(interaction.commandName);
    // If command is not found, log error and return
    if (!command) {
      return console.error(`No command matching ${interaction.commandName} was found.`);
    }

    // Try to execute command
    try {
      await command.execute(interaction);
    } catch (error) {
      // If error, log error and send error message
      console.error(error);
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
  });

  // ClientReady event
  client.once(Events.ClientReady, (client: Client<boolean>) => {
    // Log client ready when client is ready
    console.log(`Ready! Logged in as ${client?.user?.tag}`);
  });
};
