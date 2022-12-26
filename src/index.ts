import fs from "fs";
import path from "path";
import { CacheType, Client, Collection, Events, GatewayIntentBits, Interaction } from "discord.js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
// process.env.DISCORD_TOKEN
dotenv.config();

// Create a new client instance
const client: Client<boolean> & {
  commands?: Collection<string, any>;
} = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath);

commandFiles.forEach((file) => {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // Set a new item in the Collection
  if (command.data && command.execute) {
    client.commands!.set(command.data.name, command);
  } else {
    console.log(`*** WARNING: Command at ${filePath} is missing 'data' or 'execute' property.`);
  }
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (c: Client<true>) => {
  console.log("Client is ready! Logged in as: " + c.user.tag);
});

client.on(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = client.commands!.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
  }
});

// Login to Discord with your DISCORD_TOKEN
client.login(process.env.DISCORD_TOKEN);
