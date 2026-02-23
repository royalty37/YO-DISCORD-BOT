import dayjs from "dayjs";
import { GuildMember } from "discord.js";
import { Job, scheduleJob } from "node-schedule";
import { YoClient } from "../../../types/types";
import { getBotChannel } from "../../../utils/discordUtils/channelUtils";
import { getMyGuild } from "../../../utils/discordUtils/guildUtils";
import {
  getBumboys,
  clearBumboys,
  CurrentBumboysRecord,
} from "../actions/bumboyActions";
import { env } from "../../../environment";

let scheduledJob: Job;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Reset a single member's roles back to Vice Plus (preserving managed roles like server booster)
const resetMemberRole = async (member: GuildMember) => {
  await member.roles.set([
    env.VICE_PLUS_ROLE_ID,
    ...member.roles.cache.filter((r) => r.managed).values(),
  ]);
};

const performClear = async (
  client: YoClient,
  currentBumboyRecord: CurrentBumboysRecord | null,
) => {
  if (!currentBumboyRecord) {
    console.log(
      "*** NO CURRENT BUMBOYS TO CLEAR, WILL STILL CHECK ROLE IN DISCORD",
    );
  }

  // Fetch Guild off client and cache members
  const guild = await getMyGuild(client);
  await guild?.members.fetch();

  console.log(
    "*** Promoting bumboys back to Vice Plus and resetting nicknames...",
  );
  const bumboysPostClear: GuildMember[] = [];

  // Reset roles and nicknames with a 1 second delay between each (rate-limiting)
  if (currentBumboyRecord?.bumboys?.length) {
    for (const bumboyData of currentBumboyRecord.bumboys) {
      const member = guild?.members.cache.find((m) => m.id === bumboyData.id);

      if (!member) {
        console.error(`*** ERROR: Member not found: ${bumboyData.id}`);
        continue;
      }

      console.log(
        `*** RESETTING ROLE AND NICKNAME FOR: ${member.user.username}`,
      );
      await resetMemberRole(member);
      await member.setNickname(bumboyData.nickname ?? "");
      bumboysPostClear.push(member);

      await sleep(1000);
    }
  }

  await clearBumboys();

  if (bumboysPostClear.length) {
    const botChannel = await getBotChannel(client);
    botChannel?.send(
      "Following members have been promoted back to Vice Plus and had their nicknames reset:\n\n" +
      bumboysPostClear
        .map(
          (w) =>
            `💩 **${w.user.username}${w.nickname ? ` (${w.nickname})` : ""
            }** 💩`,
        )
        .join("\n\n") +
      `\n\nYou are no longer ${bumboysPostClear.length === 1 ? "a BUMBOY" : "BUMBOYS"
      } (for now)...\n\n` +
      `The BUMBOY poll can now be run again!`,
    );

    console.log("*** BUMBOY FROM DATABASE FINISHED BEING CLEARED");
  }

  // Check if any bumboys are still in the server (bugged) — clear them too
  const bumboysStillInServer = guild?.members.cache
    .filter((m) => m.roles.cache.has(env.BUMBOY_ROLE_ID))
    .values();

  if (bumboysStillInServer) {
    for (const member of bumboysStillInServer) {
      console.log(
        `*** RESETTING ROLE FOR BUGGED BUMBOY: ${member.user.username}`,
      );
      await resetMemberRole(member);
      await sleep(1000);
    }
    console.log("*** BUGGED BUMBOYS FINISHED BEING CLEARED");
  }

  console.log("*** BUMBOY PERFORMCLEAR FINISHED");
};

// Function to run president force clears bumboys, cancels scheduled job if there is one then clears bumboys
export const performForceClear = async (
  client: YoClient,
  currentBumboyRecord: CurrentBumboysRecord | null,
) => {
  if (scheduledJob) {
    scheduledJob.cancel();
    console.log("*** SCHEDULED BUMBOY CLEAR CANCELLED");
  }

  await performClear(client, currentBumboyRecord);
};

// Schedules for bumboys to be cleared from in 24 hours
export const clearBumboysJob = async (client: YoClient) => {
  // Get current bumboys from database
  const currentBumboyRecord = await getBumboys();

  if (currentBumboyRecord) {
    if (dayjs().isAfter(dayjs(currentBumboyRecord.clearTime))) {
      // Clear bumboys immediately if clearTime has passed
      console.log("*** CLEAR TIME HAS PASSED, CLEARING BUMBOYS NOW");
      await performClear(client, currentBumboyRecord);
    } else {
      // Schedule job to clear bumboys at clearTime stored in database
      console.log("*** SCHEDULING JOB TO CLEAR BUMBOYS");
      scheduledJob = scheduleJob(
        "Clear Bumboys",
        new Date(currentBumboyRecord.clearTime),
        async () => {
          await performClear(client, currentBumboyRecord);
          console.log("*** BUMBOY SCHEDULED CLEAR FINISHED");
        },
      );
    }
  } else {
    console.log("*** NO CURRENT BUMBOYS RECORD TO CLEAR");
  }
};
