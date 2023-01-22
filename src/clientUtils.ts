import dotenv from "dotenv";

export let isDevMode = false;
// Uncomment this line when developing and want to use TEST BOT
// dev = true;

// Load environment variables from .env file
dotenv.config();

export const discordToken = isDevMode ? process.env.TEST_DISCORD_TOKEN : process.env.DISCORD_TOKEN;
export const clientId = isDevMode ? process.env.TEST_CLIENT_ID : process.env.CLIENT_ID;
