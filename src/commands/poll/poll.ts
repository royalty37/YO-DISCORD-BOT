import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  EmbedBuilder,
  Colors,
  MessageReaction,
  User,
  SlashCommandBooleanOption,
  SlashCommandNumberOption,
} from "discord.js";
import Command from "../../types/Command";

// Array of emoji numbers that correspond to possible options
const EMOJI_NUMBERS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

// Emoji that represents a vote in description
const VOTE_EMOJI = "🟢";

const QUESTION_OPTION_NAME = "question";
const QUESTION_REQUIRED = true;
const ALLOW_MULTIVOTE_OPTION_NAME = "allow-multiple-votes";
const MULTIVOTE_REQUIRED = true;
const DURATION_OPTION_NAME = "duration";
const DURATION_REQUIRED = true;
const NO_OF_OPTIONS = 10;
const OPTION_NAME_PREFIX = "option-";

// Poll command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Create a poll with up to 10 options!")
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName(QUESTION_OPTION_NAME)
      .setDescription("Question to ask on poll. Must have AT LEAST 2 options.")
      .setRequired(QUESTION_REQUIRED)
  )
  .addBooleanOption((option: SlashCommandBooleanOption) =>
    option.setName(ALLOW_MULTIVOTE_OPTION_NAME).setDescription("Allow multiple votes").setRequired(MULTIVOTE_REQUIRED)
  )
  .addNumberOption((option: SlashCommandNumberOption) =>
    option.setName(DURATION_OPTION_NAME).setDescription("Poll duration (in minutes)").setRequired(DURATION_REQUIRED)
  );

// Add options to poll command
for (let i = 1; i <= NO_OF_OPTIONS; i++) {
  data.addStringOption((option: SlashCommandStringOption) =>
    option
      .setName(OPTION_NAME_PREFIX + i)
      .setDescription(`Option ${i} for poll`)
      // First 2 options are required
      .setRequired(i <= 2)
  );
}

// Poll command execute function
const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  // Get Question, Allow-Multi-Vote and Duration from options
  const question = interaction.options.getString(QUESTION_OPTION_NAME, QUESTION_REQUIRED);
  const allowMultiVote = interaction.options.getBoolean(ALLOW_MULTIVOTE_OPTION_NAME, MULTIVOTE_REQUIRED);
  const duration = interaction.options.getNumber(DURATION_OPTION_NAME, DURATION_REQUIRED);

  // Loop through and get possible options
  const options: string[] = [];
  for (let i = 1; i <= NO_OF_OPTIONS; i++) {
    const option = interaction.options.getString(OPTION_NAME_PREFIX + i);
    if (option) {
      options.push(option);
    }
  }

  // Array of votes for each option (even if option is unused, collector will handle invalid votes)
  const votes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
        return `${EMOJI_NUMBERS[options.indexOf(o)]} ${o}\n ${votesEmojis ? `${votesEmojis} | ` : ""}${
          votes[options.indexOf(o)]
        } (${generatePercentage(options.indexOf(o))}%)`;
      })
      .join("\n\n");
  };

  // Function to generate footer text for poll embed, if no duration is provided, then remaining duration is not shown (used for poll end)
  const getFooterText = (remainingDurationParam?: number): string =>
    `Poll created by ${interaction.user.username}${
      remainingDurationParam
        ? `\n\nPoll will end in approximately ${
            remainingDurationParam > 1 ? `${remainingDurationParam} minutes.` : `${remainingDurationParam} minute.`
          }`
        : ""
    }`;

  // Create initial poll embed - No votes yet
  const pollEmbed = new EmbedBuilder()
    .setTitle(question)
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setThumbnail(interaction.user.avatarURL())
    .setFooter({
      text: getFooterText(duration),
    });

  // Edit reply to include poll embed and pull out message to edit after collecting reactions
  const message = await interaction.editReply({ embeds: [pollEmbed] });

  // Create reaction collector - no filter (manually handle in collect listener), 2 hour time limit, dispose = true (allow remove listener)
  const collector = message.createReactionCollector({
    filter: (_, user: User) => !user.bot,
    // 60,000 ms (a minute) * duration (in minutes)
    time: 60000 * duration,
    dispose: true,
  });

  // Recursive function edit embed every minute to show remaining duration
  const updateDuration = async (duration: number) => {
    setTimeout(async () => {
      pollEmbed.setFooter({
        text: getFooterText(duration),
      });
      await message.edit({ embeds: [pollEmbed] });

      if (duration > 0 && !collector.checkEnd()) {
        updateDuration(duration - 1);
      }
    }, 60000);
  };

  // Initial call
  updateDuration(duration);

  for (let i = 0; i < options.length; i++) {
    // Add bot reaction to message for each option
    message.react(EMOJI_NUMBERS[i]);
  }

  // On Collect listener
  collector.on("collect", (reaction: MessageReaction, user: User) => {
    // If reaction is not a valid option (reaction outside of bounds of supplied options or random emoji), remove reaction and early return
    if (
      !(
        EMOJI_NUMBERS.includes(reaction.emoji.name ?? "") &&
        EMOJI_NUMBERS.indexOf(reaction.emoji.name ?? "") < options.length
      )
    ) {
      return void reaction.remove();
    }

    // Get index of option that user voted for early to avoid a weird remove listener bug
    const index = EMOJI_NUMBERS.indexOf(reaction.emoji.name ?? "");

    // If not a multi-vote poll, check if user has already voted, if so, remove reaction and early return
    if (!allowMultiVote) {
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
    const index = EMOJI_NUMBERS.indexOf(reaction.emoji.name ?? "");
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
          `\n\n**Poll has ended**\n\n👑 **${winners[0]}** 👑 is the winner with ${
            maxVotes > 1 ? `${maxVotes} votes` : `${maxVotes} vote`
          }.`
      );
    } else {
      // If there are multiple winners, add winners to description
      pollEmbed.setDescription(
        generateDescription() +
          `\n\n**Poll has ended**\n\nWinners are:\n\n ${winners.map((w) => `👑 **${w}** 👑`).join("\n")}\n\n with ${
            maxVotes > 1 ? `${maxVotes} votes` : `${maxVotes} vote`
          } each.`
      );
    }

    pollEmbed.setFooter({ text: getFooterText() });
    message.edit({ embeds: [pollEmbed] });
  });
};

const pollCommand: Command = {
  data,
  execute,
};

module.exports = pollCommand;
