import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { env } from "./environment";
import { YoClient } from "./types/types";
import { registerClientEvents } from "./events/clientEvents";
import { registerPlayerEvents } from "./events/playerEvents";
import { registerProcessEvents } from "./events/processEvents";
import { scheduleJobs } from "./scheduleJobs";
import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { DefaultExtractors } from "@discord-player/extractor";

dotenv.config();

// Check if DISCORD_TOKEN environment variable is set - if not, exit
if (!env.DISCORD_TOKEN) {
  console.error("*** ERROR: DISCORD_TOKEN environment variable not found.");
  process.exit(1);
}

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as YoClient;

client.commands = new Collection<string, any>();
client.player = new Player(client);

// Register YoutubeiExtractor with yt-dlp streaming (bypasses broken native streams)
client.player.extractors.register(YoutubeiExtractor, {
  useYoutubeDL: true,
  logLevel: "ALL",
});

// Load remaining extractors for Spotify, SoundCloud, etc.
client.player.extractors.loadMulti(DefaultExtractors);

// Register Client and Player events
registerClientEvents(client);
registerPlayerEvents(client.player);
registerProcessEvents();


// Get commandsPath and command folders within
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

// Loop over command folders and command files within and push them to the commands array
for (const cf of commandFolders) {
  // Command file name is the same as the folder name, therefore we can join it twice to get the path of the file
  // Include .ts files for when running in dev mode - ts-node and nodemon
  const commandFiles = fs
    .readdirSync(path.join(commandsPath, cf))
    .filter((file) => (file.endsWith(".js") || file.endsWith(".ts")) && !file.endsWith(".test.ts") && !file.endsWith(".test.js"));

  for (const file of commandFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const imported = require(`./commands/${cf}/${file}`);
    const command = imported.default ?? imported;

    // Set a new item in the Collection only if command has both 'data' and 'execute' properties
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `*** WARNING: Command at ${file} is missing 'data' or 'execute' property.`,
      );
    }
  }
}

const start = async () => {
  // Login to Discord with DISCORD_TOKEN
  await client.login(env.DISCORD_TOKEN);
  // Reschedule jobs
  await scheduleJobs(client);
};

start();
