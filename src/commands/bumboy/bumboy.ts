import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors,
  MessageReaction,
  User,
} from "discord.js";
import Command from "../../types/Command";
import { getUniqueRandomEmojis } from "../../utils/emojiUtils/emojiUtils";

type bumboyOption = {
  userName: string;
  nickName: string | null;
};

// Feature to excite the boys - the YOZA BUMBOY feature

// Created VICE PLUS and BUMBOY roles to use for this command - only includes close friends/active members
// Don't really know if it's worth programmatically retrieving the role IDs when it will theoretically never change
// Commands like these will only ever be used in my own Discord server anyway
// I guess it makes sense to create an environment variable like BUMBOY_ROLE_ID if I want to adapt this command in other servers
const VICE_PLUS_ROLE_ID = "1058420923356676226";
const BUMBOY_ROLE_ID = "903191636098568243";

// Emoji that represents a vote in description
const VOTE_EMOJI = "🟢";

// Duration of the poll in milliseconds, 1 hour
const DURATION_IN_MINUTES = 60;
const DURATION_IN_MS = 60000 * DURATION_IN_MINUTES;

// Have to set max number of options to 20 as this is the max number of reacts per message Discord allows
const NO_OF_OPTIONS = 20;

// Command cooldown only allows one BUMBOY poll per day
let onCooldown = false;
let bumboys: bumboyOption[] = [];

// Bumboy command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("bumboy")
  .setDescription("Vices cast their vote for who will be demoted to bumboy for the next 24 hours!");

// Bumboy command execute function
const execute = async (interaction: ChatInputCommandInteraction) => {
  if (onCooldown) {
    return void (await interaction.reply(
      `BUMBOY poll can only be run once every 24 hours.\n\nCurrent BUMBOYS are:\n\n${
        bumboys.length
          ? `${bumboys.map((b) => `💩 **${b.userName}${b.nickName ? ` ${b.nickName}` : ""}** 💩`).join("\n\n")}`
          : "There are currently no BUMBOYS..."
      }
        \n\nTry again later.`
    ));
  }

  // Set onCooldown to true to prevent multiple polls being run at once
  onCooldown = true;

  // Set onCooldown to false after 24 hours
  setTimeout(() => {
    onCooldown = false;
  }, 1000 * 60 * 60 * 24);

  await interaction.deferReply();

  // Fetch all members then fetch the Vice Plus role to get all members with that role
  await interaction.guild?.members.fetch();
  const vicePlusRole = await interaction.guild?.roles.fetch(VICE_PLUS_ROLE_ID);
  const bumboyRole = await interaction.guild?.roles.fetch(BUMBOY_ROLE_ID);

  if (!vicePlusRole?.members || !bumboyRole) {
    return void (await interaction.editReply("Something went wrong. Please try again."));
  }

  // Randomly retrieve 20 members Create a list of options for the poll
  const includedMembers = vicePlusRole.members.random(NO_OF_OPTIONS);

  // Array of members names in Vice Plus role that will not be included in the poll
  const nonIncludedMembers = vicePlusRole.members.filter((m) => !includedMembers.includes(m));

  // Array of objects including username and nickname options for the poll
  const options: bumboyOption[] = includedMembers.map((m) => ({ userName: m.user.username, nickName: m.nickname }));

  // Array of non included members names to include in the poll description
  const nonIncludedMemberOptions: bumboyOption[] = nonIncludedMembers.map((m) => ({
    userName: m.user.username,
    nickName: m.nickname,
  }));

  // Get a random emoji for each option - VICE PLUS
  const emojis = getUniqueRandomEmojis(options.length);

  // Programatically generate votes array corresponding to number of VICE PLUS members included in the poll
  const votes: number[] = [];
  for (let i = 0; i < options.length; i++) {
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
      nonIncludedMemberOptions.map((m) => `🍀 ${m.userName} ${m.nickName ? `(${m.nickName})` : ""} 🍀`).join("\n\n") +
      "\n\nMembers included in todays BUMBOY poll are:\n\n" +
      // Sort options by vote count, then map to generate information about each option, and join each option with a double new line
      // Spread options into new array to avoid mutating original array on sort
      [...options]
        .sort((a, b) => votes[options.indexOf(b)] - votes[options.indexOf(a)])
        .map((o) => {
          // Generate green emoji bar for each option showing vote count
          const votesEmojis = VOTE_EMOJI.repeat(votes[options.indexOf(o)]);
          return `${emojis[options.indexOf(o)]} ${o.userName}${o.nickName ? ` (${o.nickName})` : ""}\n ${
            votesEmojis ? `${votesEmojis} | ` : ""
          }${votes[options.indexOf(o)]} (${generatePercentage(options.indexOf(o))}%)`;
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

  for (let i = 0; i < options.length; i++) {
    // Add bot reaction to message for each option
    message.react(emojis[i]);
  }

  // On Collect listener
  collector.on("collect", (reaction: MessageReaction, user: User) => {
    // If reaction is not a valid option (reaction outside of bounds of supplied options or random emoji), remove reaction and early return
    if (!(emojis.includes(reaction.emoji.name ?? "") && emojis.indexOf(reaction.emoji.name ?? "") < options.length)) {
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
    bumboys = options.filter((_, i) => votes[i] === maxVotes);

    // If no votes, write a sad no votes message to description
    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() + "\n\n**BUMBOY poll has ended**\n\nUnfortunately, no votes were cast. 😔😔😔"
      );
    } else if (bumboys.length === 1) {
      // If there is only one winner, add winner to description
      pollEmbed.setDescription(
        generateDescription() +
          `\n\n**BUMBOY Poll has ended**\n\n💩 **${bumboys[0].userName}${
            bumboys[0].nickName ? ` (${bumboys[0].nickName})` : ""
          }** 💩 is the todays BUMBOY with ${maxVotes} ${maxVotes > 1 ? `votes` : `vote`}.\n\n`
      );
    } else {
      // If there are multiple winners, add winners to description
      pollEmbed.setDescription(
        generateDescription() +
          `\n\n**BUMBOY Poll has ended**\n\nTodays BUMBOYS are:\n\n ${bumboys
            .map((w) => `💩 **${w.userName}${w.nickName ? ` (${w.nickName})` : ""}** 💩`)
            .join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? `votes` : `vote`} each.`
      );
    }

    pollEmbed.setFooter({ text: getFooterText() });
    message.edit({ embeds: [pollEmbed] });

    // Set roles and change nicknames for bumboys
    // Adding a 1 second timeout as role related actions fail when done too quickly... 1000ms is just a guess but if it fails again I will increase it
    setTimeout(async () => {
      for (let i = 0; i < bumboys.length; i++) {
        const member = interaction.guild?.members.cache.find((m) => m.user.username === bumboys[i].userName);
        if (member) {
          await member.roles.set([BUMBOY_ROLE_ID]);
          await member.setNickname(bumboys.length === 1 ? `💩 THE BUMBOY 💩` : `💩 BUMBOY ${i + 1} 💩`);
        }
      }
    }, bumboys.length > 1 ? 1000 : 0);
      
    // Set timeout to promote bumboys back to Vice Plus after 24 hours and reset their nicknames
    // Set timeout for same reason as above
    setTimeout(async () => {
      console.log("Promoting bumboys back to Vice Plus and resetting nicknames...");
      setTimeout(async () => {
        for (let i = 0; i < bumboys.length; i++) {
          const member = interaction.guild?.members.cache.find((m) => m.user.username === bumboys[i].userName);
          if (member) {
            await member.roles.set([VICE_PLUS_ROLE_ID]);
            await member.setNickname(bumboys[i].nickName ?? bumboys[i].userName);
          }
        }
      }, bumboys.length > 1 ? 1000 : 0);
        
      interaction.channel?.send(
        "Following members have been promoted back to Vice Plus and had their nicknames reset:\n\n" +
          bumboys.map((w) => `💩 **${w.userName}${w.nickName ? ` (${w.nickName})` : ""}** 💩`).join("\n\n") +
          `\n\nYou are no longer ${bumboys.length === 1 ? "a BUMBOY" : "BUMBOYS"} (for now)...`
      );

      // Set bumboys array to empty ready for next poll
      bumboys = [];
      // 1000ms * 60s * 60m * 24h = 12 hours
    }, 1000 * 60 * 60 * 12);
  });
};

const bumboyCommand: Command = {
  data,
  execute,
};

module.exports = bumboyCommand;
