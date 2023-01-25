import fs from "fs";
import path from "path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";
import { YtDlpPlugin } from "@distube/yt-dlp";
import { SpotifyPlugin } from "@distube/spotify";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { YoClient } from "./types/types";
import { registerClientEvents } from "./events/clientEvents";
import { registerDistubeEvents } from "./events/distubeEvents";
import { registerProcessEvents } from "./events/processEvents";
import { initMongo } from "./mongoSetup";
import { scheduleJobs } from "./scheduleJobs";
import { discordToken } from "./clientUtils";

// Check if DISCORD_TOKEN or TEST_DISCORD_TOKEN environment variable is set - if not, exit
if (!discordToken) {
  console.error("*** ERROR: DISCORD_TOKEN OR TEST_DISCORD_TOKEN environment variable not found.");
  process.exit(1);
}

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as YoClient;

client.commands = new Collection<string, any>();
client.distube = new DisTube(client, {
  searchSongs: 5,
  searchCooldown: 10,
  leaveOnEmpty: true,
  leaveOnFinish: false,
  leaveOnStop: false,
  emitAddListWhenCreatingQueue: false,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new YtDlpPlugin({ update: true }), new SpotifyPlugin(), new SoundCloudPlugin()],
});

// Register Client and Player events
registerClientEvents(client);
registerDistubeEvents(client.distube);
registerProcessEvents();

// Initiate mongoDB connection
initMongo();

// Get commandsPath and command folders within
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

// Loop over command folders and command files within and push them to the commands array
for (const cf of commandFolders) {
  // Command file name is the same as the folder name, therefore we can join it twice to get the path of the file
  const commandFiles = fs.readdirSync(path.join(commandsPath, cf)).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${cf}/${file}`);

    // Set a new item in the Collection only if command has both 'data' and 'execute' properties
    if (command.data && command.execute) {
      client.commands!.set(command.data.name, command);
    } else {
      console.log(`*** WARNING: Command at ${file} is missing 'data' or 'execute' property.`);
    }
  }
}

// Login to Discord with DISCORD_TOKEN or TEST_DISCORD_TOKEN
client.login(discordToken).then(() => {
  // Reschedule jobs
  scheduleJobs(client);
});
