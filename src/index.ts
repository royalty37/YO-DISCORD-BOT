import * as discord from "discord.js";
import * as dotenv from "dotenv";

// Load environment variables from .env file
// process.env.DISCORD_TOKEN
dotenv.config();

const { Client, Events, GatewayIntentBits } = discord;

const client = new Client({ intents: GatewayIntentBits.Guilds });

client.once(Events.ClientReady, (c) => {
  console.log("Client is ready! Logged in as: " + c.user.tag);
});

client.login(process.env.DISCORD_TOKEN);
