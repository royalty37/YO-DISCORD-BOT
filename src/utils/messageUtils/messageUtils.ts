import { Message } from "discord.js";

// Function to split message into multiple messages if message is > 2000 (or max length) characters
// maxLength defaults to 2000 as that's the max length of a Discord message
export const splitMessage = (message: string, maxLength = 2000): string[] => {
  if (message.length <= maxLength) {
    return [message];
  }

  const returnArray: string[] = [];

  for (let i = 0; i < message.length; i += 2000) {
    const toSend = message.substring(i, Math.min(message.length, i + 2000));
    returnArray.push(toSend);
  }

  return returnArray;
};

// Regex for invite links
const INVITE_REGEX = new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z0-9]/);

// Function to filter/remove messages that contain Discord invite links
export const filterInvites = async (message: Message<boolean>) => {
  if (INVITE_REGEX.test(message.content)) {
    console.log("*** Deleting Discord invite");
    await message.delete();
    await message.channel.send(`Discord invites are not allowed ${message.author.username}!`);
  }
};

// Function to filter/remove messages that contain banned words
export const filterBannedWords = async (message: Message<boolean>) => {
  // Get banned words from .env and split into an array
  const bannedWords = process.env.BANNED_WORDS?.split(", ");

  // If no banned words found, .env is probably missing BANNED_WORDS. Skip filter.
  if (!bannedWords) {
    return console.log("*** No banned words found in .env, skipping filter...");
  }

  // Loop through banned words to see if message contains any and if so, delete.
  for (const bannedWord of bannedWords) {
    if (message.content.toLowerCase().includes(bannedWord)) {
      console.log("*** Deleting banned word");
      await message.delete();
      await message.channel.send(`Banned word detected ${message.author.username}!`);
    }
  }
};
