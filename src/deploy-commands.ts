import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";
import { Command } from "./types/types";

// Check if DISCORD_TOKEN or TEST_DISCORD_TOKEN environment variable is set - if not, exit
if (!process.env.DISCORD_TOKEN) {
  console.error("*** ERROR: DISCORD_TOKEN environment variable not found.");
  process.exit(1);
}

// Check if GUILD_ID environment variable is set - if not, exit
if (!process.env.GUILD_ID) {
  console.error("*** ERROR: GUILD_ID environment variable not found.");
  process.exit(1);
}

// Check if CLIENT_ID or TEST_CLIENT_ID environment variable is set - if not, exit
if (!process.env.CLIENT_ID) {
  console.error(
    "*** ERROR: CLIENT_ID or TEST_CLIENT_ID environment variable not found.",
  );
  process.exit(1);
}

// Create a new commands array
const commands: Command[] = [];

// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

// Loop over the command files and push them to the commands array
for (const cf of commandFolders) {
  // Command file name is the same as the folder name, therefore we can join it twice to get the path of the file
  const commandFiles = fs
    .readdirSync(path.join(commandsPath, cf))
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const command = require(`./commands/${cf}/${file}`);
    commands.push(command.data.toJSON());
  }
}

// Create a new REST instance
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Define a function that will be used to register the commands
const deployCommands = async () => {
  try {
    console.log(
      `*** Started refreshing ${commands.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        process.env.GUILD_ID!,
      ),
      {
        body: commands,
      },
    );

    console.log(
      `*** Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(`***EXCEPTION deploying commands: ${error}`);
  }
};

// Run the function
deployCommands();
