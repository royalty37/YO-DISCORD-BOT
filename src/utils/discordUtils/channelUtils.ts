import { YoClient } from "../../types/types";
import { getMyGuild } from "./guildUtils";
import { env } from "../../environment";

export const getBotChannel = async (client: YoClient) => {
  const botChannelId = env.BOT_CHANNEL_ID;
  if (!botChannelId) {
    console.error("*** ERROR: BOT_CHANNEL_ID environment variable is not set");
    return;
  }

  const guild = await getMyGuild(client);
  const channel = await guild?.channels.fetch(botChannelId);

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
