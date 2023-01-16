import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  MessageReaction,
  SlashCommandSubcommandBuilder,
  User,
} from "discord.js";
import { subcommands } from "../bumboy";
import { getUniqueRandomEmojis } from "../../../utils/emojiUtils/emojiUtils";
import { saveBumboys, getBumboys, clearBumboys } from "../actions/bumboyActions";
import dayjs from "dayjs";
import { clearBumboysJob } from "../jobs/bumboyJobs";
import YoClient from "../../../types/YoClient";
import { VICE_PLUS_ROLE_ID, BUMBOY_ROLE_ID } from "../../../utils/discordUtils/roleUtils";

// Emoji that represents a vote in description
const VOTE_EMOJI = "🟢";

// Duration of the poll in milliseconds, 1 hour
const DURATION_IN_MINUTES = 60;
const DURATION_IN_MS = 60000 * DURATION_IN_MINUTES;

// Have to set max number of options to 20 as this is the max number of reacts per message Discord allows
const NO_OF_OPTIONS = 20;

// True when poll is already running
let pollIsRunning = false;

export const pollSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.POLL)
    .setDescription("Vices cast their vote for who will be demoted to bumboy for the next 24 hours!");

export const handlePollSubcommand = async (interaction: ChatInputCommandInteraction) => {
  // If poll is already running, send message and early return
  if (pollIsRunning) {
    return void (await interaction.reply("BUMBOY poll is already running!\n\nCheck above!"));
  }

  // Set pollRunning to true
  pollIsRunning = true;

  await interaction.deferReply();

  await interaction.guild?.members.fetch();

  // Fetch all members then fetch the Vice Plus role to get all members with that role
  const vicePlusRole = await interaction.guild?.roles.fetch(VICE_PLUS_ROLE_ID);
  const bumboyRole = await interaction.guild?.roles.fetch(BUMBOY_ROLE_ID);

  // If no Vice Plus role or BUMBOY role, send error message and early return
  if (!vicePlusRole?.members || !bumboyRole) {
    pollIsRunning = false;
    return void (await interaction.editReply("Something went wrong. Please try again."));
  }

  // Get current BUMBOYS record from database
  const currentBumboysRecord = await getBumboys();

  if (currentBumboysRecord && bumboyRole) {
    const currentBumboyIds = currentBumboysRecord.bumboys.map((b) => b.id);
    const currentBumboys = Array.from(bumboyRole.members.filter((m) => currentBumboyIds.includes(m.id)).values());

    // If there are BUMBOYS in Discord, clear Ids in database and continue, otherwise print current BUMBOYS and early return
    if (currentBumboys.length === 0) {
      await clearBumboys();
    } else {
      pollIsRunning = false;
      return void (await interaction.editReply(
        `BUMBOY poll can only be run once every 12 hours.\n\n${
          currentBumboys.length
            ? `Current BUMBOYS are:\n\n${currentBumboys.map((b) => `💩 **${b.user.username}** 💩`).join("\n\n")}`
            : "There are currently no BUMBOYS..."
        }
              \n\nTry again later at ${dayjs(currentBumboysRecord.clearTime).format("DD/MM/YYYY h:mm:ss a")}`
      ));
    }
  }

  // Randomly retrieve 20 members used as options for the poll
  const includedMembers = vicePlusRole.members.random(NO_OF_OPTIONS);

  // Array of members names in Vice Plus role that will not be included in the poll
  const nonIncludedMembers = vicePlusRole.members.filter((m) => !includedMembers.includes(m));

  // Get a random emoji for each option - VICE PLUS
  const emojis = getUniqueRandomEmojis(includedMembers.length);

  // Programatically generate votes array corresponding to number of VICE PLUS members included in the poll
  const votes: number[] = [];
  for (let i = 0; i < includedMembers.length; i++) {
    votes.push(0);
  }

  // Function to generate description for poll embed based on current votes
  const generateDescription = (): string => {
    // Generate percentage for each option on poll
    const generatePercentage = (index: number): string => {
      const percentage = (votes[index] / votes.reduce((a, b) => a + b, 0)) * 100 || 0;

      // If percentage is a decimal, round to 2 decimal places
      if (percentage.toString().includes(".") && percentage.toString().split(".")[1].length > 2) {
        return percentage.toFixed(2);
      }

      return percentage.toString();
    };

    // Generate description for poll embed, include members who were not randomly selected for the poll
    return (
      "The BUMBOY poll is a poll to determine who will be demoted to BUMBOY and have their nickname changed for 24 hours. This doesn't revoke any permissions (except for the ability to change your nickname), but the BUMBOY must suffer the embarrassment of being the BUMBOY.\n\n" +
      "This poll is a non multi vote poll, which means you can only cast a single vote. To change your vote, remove your existing vote (reaction) and cast a new vote.\n\nOnly members of the Vice Plus role may participate.\n\nThe BUMBOY poll can only be run once every 24 hours.\n\n" +
      "Luckily, the following members are exempt from todays YOZA Bumboy vote (Discord only allows a maximum of 20 reacts on a message):\n\n" +
      nonIncludedMembers.map((m) => `🍀 ${m.user.username} ${m.nickname ? `(${m.nickname})` : ""} 🍀`).join("\n\n") +
      "\n\nMembers included in todays BUMBOY poll are:\n\n" +
      // Sort options by vote count, then map to generate information about each option, and join each option with a double new line
      // Spread options into new array to avoid mutating original array on sort
      [...includedMembers]
        .sort((a, b) => votes[includedMembers.indexOf(b)] - votes[includedMembers.indexOf(a)])
        .map((o) => {
          // Generate green emoji bar for each option showing vote count
          const votesEmojis = VOTE_EMOJI.repeat(votes[includedMembers.indexOf(o)]);
          return `${emojis[includedMembers.indexOf(o)]} ${o.user.username}${o.nickname ? ` (${o.nickname})` : ""}\n ${
            votesEmojis ? `${votesEmojis} | ` : ""
          }${votes[includedMembers.indexOf(o)]} (${generatePercentage(includedMembers.indexOf(o))}%)`;
        })
        .join("\n\n")
    );
  };

  const getFooterText = (remainingDurationParam?: number): string =>
    `BUMBOY poll initiated by ${interaction.user.username}${
      remainingDurationParam
        ? `\n\nBUMBOY poll will end in approximately ${remainingDurationParam} ${
            remainingDurationParam > 1 ? `minutes` : `minute`
          }.`
        : ""
    }`;

  // Create initial poll embed - No votes yet
  const pollEmbed = new EmbedBuilder()
    .setTitle("Who is the YOZA Bumboy today?")
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setThumbnail(interaction.user.avatarURL())
    .setFooter({
      // Embed shows duration in minutes
      text: getFooterText(DURATION_IN_MINUTES),
    });

  // Edit reply to include poll embed and pull out message to edit after collecting reactions
  const message = await interaction.editReply({ embeds: [pollEmbed] });

  // Create reaction collector - no filter (manually handle in collect listener), 2 hour time limit, dispose = true (allow remove listener)
  const collector = message.createReactionCollector({
    filter: (_, user: User) => !user.bot,
    // Collector uses milliseconds
    time: DURATION_IN_MS,
    dispose: true,
  });

  // Recursive function to update poll embed footer with remaining duration every minute
  const updateDuration = async (duration: number) => {
    setTimeout(async () => {
      pollEmbed.setFooter({
        text: getFooterText(duration),
      });
      await message.edit({ embeds: [pollEmbed] });

      if (duration > 1 && !collector.ended) {
        updateDuration(duration - 1);
      }
    }, 1000 * 60);
  };

  updateDuration(DURATION_IN_MINUTES);

  for (let i = 0; i < includedMembers.length; i++) {
    // Add bot reaction to message for each option
    message.react(emojis[i]);
  }

  // On Collect listener
  collector.on("collect", (reaction: MessageReaction, user: User) => {
    // If reaction is not a valid option (reaction outside of bounds of supplied options or random emoji), remove reaction and early return
    if (
      !(
        emojis.includes(reaction.emoji.name ?? "") && emojis.indexOf(reaction.emoji.name ?? "") < includedMembers.length
      )
    ) {
      return void reaction.remove();
    }

    // Get index of option that user voted for early to avoid a weird remove listener bug
    const index = emojis.indexOf(reaction.emoji.name ?? "");

    // If user is not a vice plus, remove reaction and early return
    if (!vicePlusRole.members.has(user.id)) {
      // Calling reaction.users.remove() will trigger the remove listener, so we need to manually increment the vote count before the remove listener decrements it
      // A slight roundabout solution but not necessarily non performant - Would prefer to block the remove listener or early return in the remove listener but unsure if it's doable
      votes[index]++;
      return void reaction.users.remove(user);
    }

    // Check if user has already voted, if so, remove reaction and early return
    let userHasVoted = false;

    // Loop through existing reactions to check if user has already voted
    message.reactions.cache.each((existingReaction) => {
      // Skip if reaction is the current reaction or if user has been confirmed to have already voted
      if (existingReaction === reaction || userHasVoted) {
        return;
      }

      userHasVoted = !!existingReaction.users.cache.get(user.id);
    });

    // If user has already voted, remove that users reaction and early return
    if (userHasVoted) {
      // Calling reaction.users.remove() will trigger the remove listener, so we need to manually increment the vote count before the remove listener decrements it
      // A slight roundabout solution but not necessarily non performant - Would prefer to block the remove listener or early return in the remove listener but unsure if it's doable
      votes[index]++;
      return void reaction.users.remove(user);
    }

    // If everything is all good, register the vote
    // Get index of reaction emoji in EMOJI_NUMBERS array and increment vote count for that index
    votes[index]++;

    // Update poll embed description and edit message
    pollEmbed.setDescription(generateDescription());
    message.edit({ embeds: [pollEmbed] });
  });

  // On Remove listener
  collector.on("remove", (reaction: MessageReaction, user: User) => {
    // Get index of reaction emoji in EMOJI_NUMBERS array and decrement vote count for that index
    const index = emojis.indexOf(reaction.emoji.name ?? "");
    votes[index]--;

    // Update poll embed description and edit message
    pollEmbed.setDescription(generateDescription());
    message.edit({ embeds: [pollEmbed] });
  });

  // On End listener
  collector.on("end", async () => {
    // Filter options array to only include options with the highest vote count
    const maxVotes = Math.max(...votes);
    const newBumboys = includedMembers.filter((_, i) => votes[i] === maxVotes);

    // If no votes, write a sad no votes message to description
    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() +
          "\n\n**BUMBOY poll has ended**\n\nUnfortunately, no votes were cast. 😔😔😔\n\nThis however means that the BUMBOY poll can be run again immediately!"
      );
    } else if (newBumboys.length === 1) {
      // If there is only one winner, add winner to description
      pollEmbed.setDescription(
        generateDescription() +
          `\n\n**BUMBOY Poll has ended**\n\n💩 **${newBumboys[0].user.username}${
            newBumboys[0].nickname ? ` (${newBumboys[0].nickname})` : ""
          }** 💩 is the todays BUMBOY with ${maxVotes} ${maxVotes > 1 ? `votes` : `vote`}.\n\n`
      );
    } else {
      // If there are multiple winners, add winners to description
      pollEmbed.setDescription(
        generateDescription() +
          `\n\n**BUMBOY Poll has ended**\n\nTodays BUMBOYS are:\n\n ${newBumboys
            .map((w) => `💩 **${w.user.username}${w.nickname ? ` (${w.nickname})` : ""}** 💩`)
            .join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? `votes` : `vote`} each.`
      );
    }

    pollEmbed.setFooter({ text: getFooterText() });
    message.edit({ embeds: [pollEmbed] });

    // Set roles and change nicknames for bumboys
    // Weird recursive function to set bumboys one at a time with a 3 second delay between each
    let i = 0;
    const setBumboys = async () => {
      setTimeout(async () => {
        console.log(`*** MAKING MEMBER BUMBOY: ${newBumboys[i].user.username}`);
        // Spread in managed roles when setting to avoid exception (for instance server booster role)
        // await newBumboys[i].roles.set([BUMBOY_ROLE_ID, ...newBumboys[i].roles.cache.filter((r) => r.managed).values()]);

        // Roles.set (commented out line above) not working properly so doing in separate steps with a second between
        await newBumboys[i].roles.remove(VICE_PLUS_ROLE_ID);
        setTimeout(async () => {
          await newBumboys[i].roles.add(BUMBOY_ROLE_ID);
        }, 1000);

        await newBumboys[i].setNickname(newBumboys.length === 1 ? `💩 THE BUMBOY 💩` : `💩 BUMBOY ${i + 1} 💩`);

        i++;

        if (i < newBumboys.length) {
          setBumboys();
        } else {
          console.log("*** ALL BUMBOYS SET FOLLOWING POLL");
        }
      }, 1000);
    };

    // Initial call of recursive function
    await setBumboys();

    // Save BUMBOY IDs and nicknames to database
    await saveBumboys(newBumboys.map((b) => ({ id: b.id, nickname: b.nickname })));

    // Schedule job to promote bumboys back to Vice Plus after 12 hours and reset their nicknames
    clearBumboysJob(interaction.client as YoClient);

    // Set pollIsRunning back to false
    pollIsRunning = false;
  });
};
