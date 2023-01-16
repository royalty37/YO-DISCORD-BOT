import YoClient from "../../types/YoClient";
import { getMyGuild } from "./guildUtils";

// Channel ID of text channel dedicated to this bot
const BOT_CHANNEL_ID = "1057644079682437140";

// Returns the text channel dedicated to this bot - if it exists and is indeed text based
export const getBotChannel = async (client: YoClient) => {
  const guild = await getMyGuild(client);
  const channel = await guild?.channels.fetch(BOT_CHANNEL_ID);

  if (!channel) {
    console.error("*** ERROR: Channel not found");
    return;
  } else {
    console.log("*** SUCCESS: Channel found");
  }

  if (channel.isTextBased()) {
    return channel;
  } else {
    console.error("*** ERROR: Channel is not text based");
  }
};
