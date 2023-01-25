import { Guild } from "discord.js";
import { YoClient } from "../../types/types";

// Guild ID of my personal Discord channel
const GUILD_ID = "249728245212119043";

export const getMyGuild = async (client: YoClient): Promise<Guild> => {
  console.log("*** FETCHING MY GUILD");
  const guild = await client.guilds.fetch(GUILD_ID);

  if (!guild) {
    console.error("*** ERROR: Guild not found");
  } else {
    console.log("*** SUCCESS: Guild found");
  }

  return guild;
};
