import { Client, Events, BaseInteraction } from "discord.js";
import YoClient from "../types/YoClient";

export const registerClientEvents = (client: YoClient) => {
  client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = (interaction.client as YoClient).commands.get(interaction.commandName);

    if (!command) {
      return console.error(`No command matching ${interaction.commandName} was found.`);
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
  });

  client.once(Events.ClientReady, (client: Client<boolean>) => {
    console.log(`Ready! Logged in as ${client?.user?.tag}`);
  });
};
