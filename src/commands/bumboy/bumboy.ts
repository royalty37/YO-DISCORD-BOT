import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  EmbedBuilder,
  Colors,
  MessageReaction,
  User,
} from "discord.js";
import Command from "../../types/Command";
import { getUniqueRandomEmojismojis } from "../../utils/emojiUtils/emojiUtils";

// Feature to excite the boys - the YOZA BUMBOY feature

// Created a VICE PLUS role to use for this command - only includes close friends/active members
// Don't really know if it's worth programmatically retrieving the role ID when it will theoretically never change
// Commands like these will only ever be used in my own Discord server
// I guess it makes sense to set an environment variable like BUMBOY_ROLE_ID if I want to use this command in other servers
const VICE_PLUS_ROLE_ID = "1058420923356676226";
const BUMBOY_ROLE_ID = "903191636098568243";

// Emoji that represents a vote in description
const VOTE_EMOJI = "🟢";

// Duration of the poll in milliseconds, 2 hours
const NO_OF_MINUTES = 60 * 2;
const DURATION = 60000 * NO_OF_MINUTES;

// Have to set max number of options to 20 as this is the max number of reacts per message Discord allows
const NO_OF_OPTIONS = 20;

// Command cooldown only allows one BUMBOY poll per day
const onCooldown = false;

// Bumboy command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("bumboy")
  .setDescription("Vices cast their vote for who will be demoted to bumboy for the next 24 hours!");

// Bumboy command execute function
const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  // Fetch all members then fetch the Vice Plus role to get all members with that role
  await interaction.guild?.members.fetch();
  const vicePlusRole = await interaction.guild?.roles.fetch(VICE_PLUS_ROLE_ID);
  const bumboyRole = interaction.guild?.roles.fetch(BUMBOY_ROLE_ID);

  console.log("ROLES: ", interaction.guild?.roles);

  if (!vicePlusRole?.members) {
    return void (await interaction.editReply("Something went wrong. Please try again."));
  }

  // Randomly retrieve 20 members Create a list of options for the poll
  const options = vicePlusRole.members.random(NO_OF_OPTIONS).map((m) => m.user.username);

  // Array of members names in Vice Plus role that will not be included in the poll
  const nonIncludedMembers: string[] = vicePlusRole.members
    .map((m) => m.user.username)
    .filter((m) => !options.includes(m));

  // Get a random emoji for each option - VICE PLUS
  const emojis = getUniqueRandomEmojismojis(options.length);

  // Programatically get emojis for each option
  interaction.guild?.emojis.cache.forEach((e) => {
    console.log("EMOJI NAME: ", e.name);
  });

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

    // Sort options by vote count, then map to generate information about each option, and join each option with a double new line
    // Spread options into new array to avoid mutating original array on sort
    return [...options]
      .sort((a, b) => votes[options.indexOf(b)] - votes[options.indexOf(a)])
      .map((o) => {
        // Generate green emoji bar for each option showing vote count
        const votesEmojis = VOTE_EMOJI.repeat(votes[options.indexOf(o)]);
        return `${emojis[options.indexOf(o)]} ${o}\n ${votesEmojis ? `${votesEmojis} | ` : ""}${
          votes[options.indexOf(o)]
        } (${generatePercentage(options.indexOf(o))}%)`;
      })
      .join("\n\n");
  };

  const getFooterText = (remainingDurationParam?: number): string =>
    `BUMBOY poll initiated by ${interaction.user.username}${
      remainingDurationParam
        ? `\n\nBUMBOY poll will end in approximately ${
            remainingDurationParam > 1 ? `${remainingDurationParam} minutes.` : `${remainingDurationParam} minute.`
          }`
        : ""
    }`;

  // Create initial poll embed - No votes yet
  const pollEmbed = new EmbedBuilder()
    .setTitle("Who is the YOZA Bumboy today?")
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setThumbnail(interaction.user.avatarURL())
    .setFooter({
      text: getFooterText(DURATION),
    });

  // Edit reply to include poll embed and pull out message to edit after collecting reactions
  const message = await interaction.editReply({ embeds: [pollEmbed] });

  // Create reaction collector - no filter (manually handle in collect listener), 2 hour time limit, dispose = true (allow remove listener)
  const collector = message.createReactionCollector({
    filter: (_, user: User) => !user.bot,
    time: DURATION,
    dispose: true,
  });

  const updateDuration = async (duration: number) => {
    setTimeout(async () => {
      pollEmbed.setFooter({
        text: getFooterText(duration),
      });
      await message.edit({ embeds: [pollEmbed] });

      if (duration > 1 && !collector.checkEnd()) {
        updateDuration(duration - 1);
      }
    }, 60000);
  };

  updateDuration(NO_OF_MINUTES);

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
  collector.on("end", () => {
    // Filter options array to only include options with the highest vote count
    const maxVotes = Math.max(...votes);
    const winners = options.filter((_, i) => votes[i] === maxVotes);

    // If no votes, write a sad no votes to description
    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() + "\n\n**Poll has ended**\n\nUnfortunately, no votes were cast. 😔😔😔"
      );
    } else if (winners.length === 1) {
      // If there is only one winner, add winner to description
      pollEmbed.setDescription(
        generateDescription() +
          `\n\n**BUMBOY Poll has ended**\n\n👑 **${winners[0]}** 👑 is the winner with ${
            maxVotes > 1 ? `${maxVotes} votes` : `${maxVotes} vote`
          }.`
      );
    } else {
      // If there are multiple winners, add winners to description
      pollEmbed.setDescription(
        generateDescription() +
          `\n\n**Poll has ended**\n\nWinners are:\n\n ${winners
            .map((w) => `👑 **${w}** 👑`)
            .join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? `votes` : `vote`} each.`
      );
    }

    pollEmbed.setFooter({ text: getFooterText() });
    message.edit({ embeds: [pollEmbed] });
  });
};

const bumboyCommand: Command = {
  data,
  execute,
};

module.exports = bumboyCommand;
