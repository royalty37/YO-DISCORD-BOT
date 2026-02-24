import {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";

import type {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandNumberOption,
} from "discord.js";
import type { Command, Interaction } from "../../types/types";
import { saveActivePoll, clearActivePoll, PersistedPollState } from "./pollStore";

// Emoji that represents a vote in description
const VOTE_EMOJI = "🟢";

// Number emojis used as button emojis
const EMOJI_NUMBERS = [
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
];

const QUESTION_OPTION_NAME = "question";
const QUESTION_REQUIRED = true;
const ALLOW_MULTIVOTE_OPTION_NAME = "allow-multiple-votes";
const ALLOW_MULTIVOTE_REQUIRED = true;
const DURATION_OPTION_NAME = "duration-minutes";
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
      .setRequired(QUESTION_REQUIRED),
  )
  .addBooleanOption((option: SlashCommandBooleanOption) =>
    option
      .setName(ALLOW_MULTIVOTE_OPTION_NAME)
      .setDescription("Allow multiple votes")
      .setRequired(ALLOW_MULTIVOTE_REQUIRED),
  )
  .addNumberOption((option: SlashCommandNumberOption) =>
    option
      .setName(DURATION_OPTION_NAME)
      .setDescription("Poll duration (in minutes)")
      .setRequired(DURATION_REQUIRED),
  );

// Add options to poll command
for (let i = 1; i <= NO_OF_OPTIONS; i++) {
  data.addStringOption((option: SlashCommandStringOption) =>
    option
      .setName(OPTION_NAME_PREFIX + i)
      .setDescription(`Option ${i} for poll`)
      // First 2 options are required
      .setRequired(i <= 2),
  );
}

// Poll command execute function
const execute = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  await interaction.deferReply();

  // Get Question, Allow-Multi-Vote and Duration from options
  const question = interaction.options.getString(
    QUESTION_OPTION_NAME,
    QUESTION_REQUIRED,
  );
  const allowMultiVote = interaction.options.getBoolean(
    ALLOW_MULTIVOTE_OPTION_NAME,
    ALLOW_MULTIVOTE_REQUIRED,
  );
  const duration = interaction.options.getNumber(
    DURATION_OPTION_NAME,
    DURATION_REQUIRED,
  );

  // Loop through and get possible options
  const options: string[] = [];
  for (let i = 1; i <= NO_OF_OPTIONS; i++) {
    const option = interaction.options.getString(OPTION_NAME_PREFIX + i);
    if (option) {
      options.push(option);
    }
  }

  // Vote tracking
  // Single-vote: userId -> optionIndex
  const singleVotes = new Map<string, number>();
  // Multi-vote: userId -> Set of optionIndices
  const multiVotes = new Map<string, Set<number>>();
  // Per-option vote counts
  const voteCounts = new Array(options.length).fill(0);

  // Absolute end time for the poll
  const durationMs = 60000 * duration;
  const endTime = new Date(Date.now() + durationMs).toISOString();

  // Helper to compute remaining whole minutes from endTime
  const getRemainingMinutes = (): number =>
    Math.max(0, Math.ceil((new Date(endTime).getTime() - Date.now()) / 60000));

  // Helper to persist current poll state to the store
  const persistState = (messageId: string, channelId: string): void => {
    const state: PersistedPollState = {
      type: "regular",
      messageId,
      channelId,
      initiatorUsername: interaction.user.username,
      endTime,
      voteCounts: [...voteCounts],
      singleVotes: Object.fromEntries(singleVotes),
      multiVotes: Object.fromEntries(
        [...multiVotes.entries()].map(([k, v]) => [k, [...v]]),
      ),
      question,
      options: [...options],
      allowMultiVote,
    };
    saveActivePoll(state);
  };

  // Function to generate description for poll embed based on current votes
  const generateDescription = (): string => {
    const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

    // Generate percentage for each option on poll
    const generatePercentage = (index: number): string => {
      const percentage = totalVotes > 0
        ? (voteCounts[index] / totalVotes) * 100
        : 0;

      if (
        percentage.toString().includes(".") &&
        percentage.toString().split(".")[1].length > 2
      ) {
        return percentage.toFixed(2);
      }

      return percentage.toString();
    };

    // Generate description for poll embed
    return (
      `This is a ${allowMultiVote ? "" : "non "}multi vote poll, which means participants are ${allowMultiVote
        ? "allowed to cast multiple votes"
        : "only allowed to cast a single vote. To change your vote, click a different option button"
      }. Vote by clicking the button corresponding to the option you want to vote for.\n\n` +
      // Sort options by vote count, then map to generate information about each option
      [...options]
        .sort((a, b) => voteCounts[options.indexOf(b)] - voteCounts[options.indexOf(a)])
        .map((o) => {
          const idx = options.indexOf(o);
          const votesEmojis = VOTE_EMOJI.repeat(voteCounts[idx]);
          return `${EMOJI_NUMBERS[idx]} ${o}\n ${votesEmojis ? `${votesEmojis} | ` : ""
            }${voteCounts[idx]} (${generatePercentage(idx)}%)`;
        })
        .join("\n\n")
    );
  };

  // Function to generate footer text for poll embed
  const getFooterText = (remainingMinutesParam?: number): string => {
    const base = `Poll created by ${interaction.user.username}`;
    if (remainingMinutesParam === undefined) return base;
    if (remainingMinutesParam <= 0) return `${base}\n\nPoll has ended.`;
    return `${base}\n\nPoll will end in approximately ${remainingMinutesParam} ${remainingMinutesParam > 1 ? "minutes" : "minute"}.`;
  };

  // Generate a "who voted for what" breakdown
  const generateVoteBreakdown = (): string => {
    // Collect all votes into optionIndex -> voterIds[]
    const votesByOption = new Map<number, string[]>();

    if (allowMultiVote) {
      for (const [voterId, optionIndices] of multiVotes) {
        for (const idx of optionIndices) {
          if (!votesByOption.has(idx)) votesByOption.set(idx, []);
          votesByOption.get(idx)!.push(voterId);
        }
      }
    } else {
      for (const [voterId, idx] of singleVotes) {
        if (!votesByOption.has(idx)) votesByOption.set(idx, []);
        votesByOption.get(idx)!.push(voterId);
      }
    }

    if (votesByOption.size === 0) return "";

    // Sort by vote count descending
    const sortedEntries = [...votesByOption.entries()].sort(
      (a, b) => b[1].length - a[1].length,
    );

    let breakdown = "\n\n📋 **Vote Breakdown — Who voted for what:**\n\n";

    for (const [optionIndex, voterIds] of sortedEntries) {
      const voterNames = voterIds.map((id) => {
        const member = interaction.guild?.members.cache.get(id);
        return member
          ? (member.nickname ?? member.user.username)
          : `Unknown (${id})`;
      });

      breakdown += `**${options[optionIndex]}** — ${voterNames.join(", ")}\n`;
    }

    return breakdown;
  };

  // Build buttons for each option
  const buildButtons = (disabled = false): ActionRowBuilder<ButtonBuilder>[] => {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();

    for (let i = 0; i < options.length; i++) {
      // Truncate label to 80 chars (Discord limit)
      const label = options[i].length > 80
        ? options[i].substring(0, 77) + "..."
        : options[i];

      const button = new ButtonBuilder()
        .setCustomId(`poll_vote_${i}`)
        .setLabel(`${label} (${voteCounts[i]})`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJI_NUMBERS[i])
        .setDisabled(disabled);

      currentRow.addComponents(button);

      // 5 buttons per row
      if ((i + 1) % 5 === 0 || i === options.length - 1) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }

    return rows;
  };

  // Create initial poll embed - No votes yet
  const pollEmbed = new EmbedBuilder()
    .setTitle(question)
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setThumbnail(interaction.user.avatarURL())
    .setFooter({
      text: getFooterText(duration),
    });

  // Edit reply to include poll embed with buttons
  const message = await interaction.editReply({
    embeds: [pollEmbed],
    components: buildButtons(),
  });

  // Persist initial poll state
  persistState(message.id, message.channelId);

  // Create button collector
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.customId.startsWith("poll_vote_"),
    // 60,000 ms (a minute) * duration (in minutes)
    time: durationMs,
  });

  // Interval-based countdown that ticks every minute until the collector ends
  const durationInterval = setInterval(async () => {
    const remainingMinutes = getRemainingMinutes();

    if (collector.ended) {
      clearInterval(durationInterval);
      return;
    }

    pollEmbed.setFooter({
      text: getFooterText(remainingMinutes),
    });

    try {
      await message.edit({ embeds: [pollEmbed], components: buildButtons() });
    } catch {
      clearInterval(durationInterval);
    }

    if (remainingMinutes <= 0) {
      clearInterval(durationInterval);
    }
  }, 60000);

  // On Collect listener
  collector.on("collect", async (btnInteraction) => {
    const optionIndex = parseInt(
      btnInteraction.customId.replace("poll_vote_", ""),
      10,
    );
    const userId = btnInteraction.user.id;

    if (allowMultiVote) {
      // Multi-vote: toggle vote on/off
      if (!multiVotes.has(userId)) {
        multiVotes.set(userId, new Set());
      }
      const userVotes = multiVotes.get(userId)!;

      if (userVotes.has(optionIndex)) {
        // Remove vote
        userVotes.delete(optionIndex);
        voteCounts[optionIndex]--;
        console.log(
          `*** POLL - ${btnInteraction.user.displayName} removed vote for "${options[optionIndex]}"`,
        );
      } else {
        // Add vote
        userVotes.add(optionIndex);
        voteCounts[optionIndex]++;
        console.log(
          `*** POLL - ${btnInteraction.user.displayName} voted for "${options[optionIndex]}"`,
        );
      }
    } else {
      // Single-vote mode
      if (singleVotes.has(userId)) {
        const previousIndex = singleVotes.get(userId)!;

        if (previousIndex === optionIndex) {
          // Already voted for this option
          return btnInteraction.reply({
            content: `❌ | You already voted for **${options[optionIndex]}**! Click a different option to change your vote.`,
            ephemeral: true,
          });
        }

        // Move vote from old option to new option
        voteCounts[previousIndex]--;
        voteCounts[optionIndex]++;
        singleVotes.set(userId, optionIndex);
        console.log(
          `*** POLL - ${btnInteraction.user.displayName} changed vote from "${options[previousIndex]}" to "${options[optionIndex]}"`,
        );
      } else {
        // New vote
        voteCounts[optionIndex]++;
        singleVotes.set(userId, optionIndex);
        console.log(
          `*** POLL - ${btnInteraction.user.displayName} voted for "${options[optionIndex]}"`,
        );
      }
    }

    // Update poll embed and buttons
    pollEmbed.setDescription(generateDescription());
    await btnInteraction.update({
      embeds: [pollEmbed],
      components: buildButtons(),
    });

    // Persist updated vote state
    persistState(message.id, message.channelId);
  });

  // On End listener
  collector.on("end", () => {
    // Stop the countdown interval
    clearInterval(durationInterval);

    // Clear persisted poll state
    clearActivePoll("regular", message.id);

    // Filter options array to only include options with the highest vote count
    const maxVotes = Math.max(...voteCounts);
    const winners = options.filter((_, i) => voteCounts[i] === maxVotes);

    // Generate the vote breakdown to append after the results
    const voteBreakdown = generateVoteBreakdown();

    // If no votes, write a sad no votes message to description
    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() +
        "\n\n**Poll has ended**\n\nUnfortunately, no votes were cast. 😔😔😔",
      );
    } else if (winners.length === 1) {
      // If there is only one winner, add winner to description
      pollEmbed.setDescription(
        generateDescription() +
        `\n\n**Poll has ended**\n\n👑 **${winners[0]
        }** 👑 is the winner with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"
        }.` + voteBreakdown,
      );
    } else {
      // If there are multiple winners, add winners to description
      pollEmbed.setDescription(
        generateDescription() +
        `\n\n**Poll has ended**\n\nWinners are:\n\n ${winners
          .map((w) => `👑 **${w}** 👑`)
          .join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"
        } each.` + voteBreakdown,
      );
    }

    pollEmbed.setFooter({ text: getFooterText(0) });
    message.edit({ embeds: [pollEmbed], components: buildButtons(true) });
  });
};

const pollCommand: Command = {
  data,
  execute,
};

export default pollCommand;
