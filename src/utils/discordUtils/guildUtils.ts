import { Guild } from "discord.js";
import { YoClient } from "../../types/types";

export const getMyGuild = async (client: YoClient): Promise<Guild> => {
  const guildId = process.env.GUILD_ID;
  if (!guildId) {
    throw new Error("GUILD_ID environment variable is not set");
  }

  console.log("*** FETCHING MY GUILD");
  const guild = await client.guilds.fetch(guildId);

  if (!guild) {
    console.error("*** ERROR: Guild not found");
  } else {
    console.log("*** SUCCESS: Guild found");
  }

  return guild;
};
