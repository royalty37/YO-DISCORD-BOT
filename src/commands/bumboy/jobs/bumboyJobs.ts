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
import {
  VICE_PLUS_ROLE_ID,
  BUMBOY_ROLE_ID,
} from "../../../utils/discordUtils/roleUtils";

let scheduledJob: Job;

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

  // Weird recursive function to reset roles and nicknames with a 1 second delay between each
  let i = 0;
  const resetBumboysWithDelay = async () => {
    setTimeout(async () => {
      if (currentBumboyRecord?.bumboys?.length) {
        const member = guild?.members.cache.find(
          (m) => m.id === currentBumboyRecord?.bumboys[i].id,
        );

        if (!member) {
          console.error(
            `*** ERROR: Member not found: ${currentBumboyRecord.bumboys[i].id}`,
          );
        } else {
          console.log(
            `*** RESETTING ROLE AND NICKNAME FOR: ${member.user.username}`,
          );
          // Spread in managed roles when setting to avoid exception (for instance server booster role)
          await member.roles.set([
            VICE_PLUS_ROLE_ID,
            ...member.roles.cache.filter((r) => r.managed).values(),
          ]);
          await member.setNickname(
            currentBumboyRecord.bumboys[i].nickname ?? "",
          );

          bumboysPostClear.push(member);
        }

        i++;
      }

      if (
        currentBumboyRecord?.bumboys &&
        i < currentBumboyRecord.bumboys.length
      ) {
        resetBumboysWithDelay();
      } else {
        await clearBumboys();

        if (bumboysPostClear.length) {
          const botChannel = await getBotChannel(client);
          botChannel?.send(
            "Following members have been promoted back to Vice Plus and had their nicknames reset:\n\n" +
              bumboysPostClear
                .map(
                  (w) =>
                    `💩 **${w.user.username}${
                      w.nickname ? ` (${w.nickname})` : ""
                    }** 💩`,
                )
                .join("\n\n") +
              `\n\nYou are no longer ${
                bumboysPostClear.length === 1 ? "a BUMBOY" : "BUMBOYS"
              } (for now)...\n\n` +
              `The BUMBOY poll can now be run again!`,
          );

          console.log("*** BUMBOY FROM DATABASE FINISHED BEING CLEARED");
        }

        // Check if any bumboys are still in the server - probably bugged so clear them too
        const bumboysStillInServer = Array.from(
          guild?.members.cache
            .filter((m) => m.roles.cache.has(BUMBOY_ROLE_ID))
            .values(),
        );

        // Another weird recursive function - essentially the same as above
        let j = 0;
        const resetBuggedBumboysWithDelay = async () => {
          setTimeout(() => {
            const member = bumboysStillInServer[j];
            console.log(
              `*** RESETTING ROLE FOR BUGGED BUMBOY: ${member.user.username}`,
            );
            // Only reset role as nickname wasn't stored in the database
            member.roles.set([
              VICE_PLUS_ROLE_ID,
              ...member.roles.cache.filter((r) => r.managed).values(),
            ]);

            j++;

            if (j < bumboysStillInServer.length) {
              resetBuggedBumboysWithDelay();
            } else {
              console.log("*** BUGGED BUMBOYS FINISHED BEING CLEARED");
            }
          }, 1000);
        };

        if (bumboysStillInServer.length) {
          // Initial call of recursive function if there are bumboys to clear
          console.log("*** BUGGED BUMBOYS FOUND, CLEARING THEM NOW");
          await resetBuggedBumboysWithDelay();
        }

        console.log("*** BUMBOY PERFORMCLEAR FINISHED");
      }
    }, 1000);
  };

  // Initial call of recursive function if there are bumboys to clear
  await resetBumboysWithDelay();
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
        currentBumboyRecord.clearTime,
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
