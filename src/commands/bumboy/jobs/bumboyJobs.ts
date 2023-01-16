import dayjs from "dayjs";
import { GuildMember } from "discord.js";
import { scheduleJob } from "node-schedule";
import YoClient from "../../../types/YoClient";
import { getBotChannel } from "../../../utils/discordUtils/channelUtils";
import { getMyGuild } from "../../../utils/discordUtils/guildUtils";
import { getBumboys, clearBumboys } from "../actions/bumboyActions";
import { VICE_PLUS_ROLE_ID, BUMBOY_ROLE_ID } from "../../../utils/discordUtils/roleUtils";

// Schedules for bumboys to be cleared from in 24 hours
export const clearBumboysJob = async (client: YoClient) => {
  // Fetch Guild off client and cache members
  const guild = await getMyGuild(client);
  await guild?.members.fetch();

  // Get current bumboys from database
  const currentBumboyRecord = await getBumboys();

  // If no current bumboys, return
  if (!currentBumboyRecord) {
    console.log("*** NO CURRENT BUMBOYS TO CLEAR");
    return;
  }

  const performClear = async () => {
    console.log("Promoting bumboys back to Vice Plus and resetting nicknames...");
    const bumboysPostClear: GuildMember[] = [];

    // Weird recursive function to reset roles and nicknames with a 3 second delay between each
    let i = 0;
    const resetBumboysWithDelay = async () => {
      setTimeout(async () => {
        const member = guild?.members.cache.find((m) => m.id === currentBumboyRecord.bumboys[i].id);

        if (!member) {
          console.error(`*** ERROR: Member not found: ${currentBumboyRecord.bumboys[i].id}`);
        } else {
          console.log(`*** RESETTING ROLE AND NICKNAME FOR: ${member.user.username}`);
          // Spread in managed roles when setting to avoid exception (for instance server booster role)
          // await member.roles.set([VICE_PLUS_ROLE_ID, ...member.roles.cache.filter((r) => r.managed).values()]);

          console.log("BUMBOY ROLE ID: ", BUMBOY_ROLE_ID);
          // Roles.set (commented out line above) not working properly so doing in separate steps with a second between
          await member.roles.remove(BUMBOY_ROLE_ID);
          setTimeout(async () => {
            await member.roles.add(VICE_PLUS_ROLE_ID);
          }, 1000);

          await member.setNickname(currentBumboyRecord.bumboys[i].nickname ?? "");

          bumboysPostClear.push(member);
        }

        i++;

        if (i < currentBumboyRecord.bumboys.length) {
          resetBumboysWithDelay();
        } else {
          await clearBumboys();

          const botChannel = await getBotChannel(client);

          botChannel?.send(
            "Following members have been promoted back to Vice Plus and had their nicknames reset:\n\n" +
              bumboysPostClear
                .map((w) => `💩 **${w.user.username}${w.nickname ? ` (${w.nickname})` : ""}** 💩`)
                .join("\n\n") +
              `\n\nYou are no longer ${bumboysPostClear.length === 1 ? "a BUMBOY" : "BUMBOYS"} (for now)...\n\n` +
              `The BUMBOY poll can now be run again!`
          );

          console.log("*** BUMBOY SCHEDULED CLEAR FINISHED");
        }
      }, 3000);
    };

    // Initial call of recursive function
    await resetBumboysWithDelay();
  };

  if (currentBumboyRecord) {
    if (dayjs().isAfter(dayjs(currentBumboyRecord.clearTime))) {
      // Clear bumboys immediately if clearTime has passed
      console.log("*** CLEAR TIME HAS PASSED, CLEARING BUMBOYS NOW");
      await performClear();
    } else {
      // Schedule job to clear bumboys at clearTime stored in database
      console.log("*** SCHEDULING JOB TO CLEAR BUMBOYS");
      scheduleJob("Clear Bumboys", currentBumboyRecord.clearTime, async () => {
        await performClear();
      });
    }
  }
};
