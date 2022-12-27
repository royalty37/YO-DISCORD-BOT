import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { REST, Routes } from "discord.js";
import Command from "./types/Command";

dotenv.config();

const commands: Command[] = [];

// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

// Loop over the command files and push them to the commands array
commandFolders.forEach((cf) => {
  // Command file name is the same as the folder name, therefore we can join it twice to get the path of the file
  const command = require(`./commands/${cf}/${cf}`);
  commands.push(command.data.toJSON());
});

// Create a new REST instance
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN ?? "");

const deployCommands = async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID ?? "", process.env.GUILD_ID ?? ""),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
};

deployCommands();
