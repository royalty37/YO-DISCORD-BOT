import { EmbedBuilder } from "discord.js";

import type { Message } from "discord.js";
import type { Track } from "discord-player";

// Function to split message into multiple messages if message is > 2000 (or max length) characters
// maxLength defaults to 2000 as that's the max length of a Discord message
export const splitMessage = (message: string, maxLength = 2000): string[] => {
  if (message.length <= maxLength) {
    return [message];
  }

  const returnArray: string[] = [];

  for (let i = 0; i < message.length; i += maxLength) {
    const toSend = message.substring(i, Math.min(message.length, i + maxLength));
    returnArray.push(toSend);
  }

  return returnArray;
};

// Regex for invite links
const INVITE_REGEX = new RegExp(
  /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z0-9]/,
);

// Function to filter/remove messages that contain Discord invite links
export const filterInvites = async (message: Message<boolean>) => {
  if (INVITE_REGEX.test(message.content)) {
    console.log("*** Deleting Discord invite");
    await message.delete();
    if (message.channel.isSendable()) {
      await message.channel.send(
        `Discord invites are not allowed ${message.author.username}!`,
      );
    }
  }
};

// Function to filter/remove messages that contain banned words
export const filterBannedWords = async (message: Message<boolean>) => {
  // Get banned words from .env as a JSON array string
  if (!process.env.BANNED_WORDS) {
    return console.log("*** No banned words found in .env, skipping filter...");
  }

  let bannedWords: string[];
  try {
    bannedWords = JSON.parse(process.env.BANNED_WORDS);
  } catch {
    return console.error("*** ERROR: BANNED_WORDS is not valid JSON, skipping filter...");
  }

  const content = message.content.toLowerCase();

  // Use word-boundary regex to avoid false positives (e.g. "class" matching "ass")
  for (const bannedWord of bannedWords) {
    const regex = new RegExp(`\\b${bannedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(content)) {
      console.log("*** Deleting banned word");
      await message.delete();
      if (message.channel.isSendable()) {
        await message.channel.send(
          `Banned word detected ${message.author.username}!`,
        );
      }
      break; // Message already deleted, no need to check remaining words
    }
  }
};

export const filterMessages = async (message: Message<boolean>) => {
  await filterInvites(message);
  await filterBannedWords(message);
};

export const createTrackEmbed = (track: Track) =>
  new EmbedBuilder()
    .setColor("Random")
    .setTitle("🎶 | Added song to the queue:")
    .setDescription(`[${track.title}](${track.url} 'optional hovertext')`)
    .setThumbnail(track.thumbnail)
    .addFields([
      {
        name: "**Duration:**",
        value: track.duration,
        inline: true,
      },
      {
        name: "**Views**",
        value: track.views.toString(),
        inline: true,
      },
    ])
    .setFooter({
      text: `Requested by: ${track.requestedBy?.username}`,
      iconURL: track.requestedBy?.displayAvatarURL(),
    })
    .setTimestamp();
