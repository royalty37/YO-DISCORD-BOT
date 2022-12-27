import fs from "fs";
import path from "path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
// process.env.DISCORD_TOKEN
dotenv.config();

// Create a new client instance
const client: Client<boolean> & {
  commands?: Collection<string, any>;
} = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath);

eventFiles.forEach((file) => {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

commandFolders.forEach((cf: string) => {
  // Command file name is the same as the folder name, therefore we can join it twice to get the path of the file
  const filePath = path.join(commandsPath, cf, cf);
  const command = require(filePath);

  // Set a new item in the Collection
  if (command.data && command.execute) {
    client.commands!.set(command.data.name, command);
  } else {
    console.log(`*** WARNING: Command at ${filePath} is missing 'data' or 'execute' property.`);
  }
});

// Login to Discord with your DISCORD_TOKEN
client.login(process.env.DISCORD_TOKEN);
