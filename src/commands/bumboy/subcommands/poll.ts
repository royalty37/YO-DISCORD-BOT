import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { Subcommands } from "../bumboy";
import {
  saveBumboys,
  getBumboys,
  clearBumboys,
  recordBumboyWins,
} from "../actions/bumboyActions";
import dayjs from "dayjs";
import { clearBumboysJob } from "../jobs/bumboyJobs";
import { Interaction } from "../../../types/types";
import { env } from "../../../environment";
import { isDevMode } from "../../../config";
import { saveActivePoll, clearActivePoll, PersistedPollState } from "../../poll/pollStore";
import { fetchGuildMembers } from "../../../utils/discordUtils/guildUtils";

// Emoji that represents a vote in description
const VOTE_EMOJI = "🟢";

// Duration of the poll – 1 minute in dev mode, 1 hour in production
const DURATION_IN_MINUTES = isDevMode ? 1 : 60;
const DURATION_IN_MS = 60000 * DURATION_IN_MINUTES;

// Maximum number of buttons Discord allows (5 rows x 5 buttons)
const MAX_BUTTONS = 25;

// True when poll is already running
let pollIsRunning = false;

export const pollSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.POLL)
    .setDescription(
      "Vices cast their vote for who will be demoted to bumboy for the next 24 hours!",
    );

export const handlePollSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // If poll is already running, send message and early return
  if (pollIsRunning) {
    await interaction.reply("BUMBOY poll is already running!\n\nCheck above!");
    return console.log("*** BUMBOY POLL - Poll is already running.");
  }

  // Fetch all guild members into cache first (Role.members reads from cache)
  await fetchGuildMembers(interaction.guild);

  // Fetch the Vice Plus and BUMBOY roles
  const vicePlusRole = await interaction.guild?.roles.fetch(env.VICE_PLUS_ROLE_ID);
  const bumboyRole = await interaction.guild?.roles.fetch(env.BUMBOY_ROLE_ID);

  // If no Vice Plus role or BUMBOY role, send error message and early return
  if (!vicePlusRole) {
    await interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
    return console.error("*** BUMBOY POLL - No Vice Plus role.");
  }

  if (!vicePlusRole.members) {
    await interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
    return console.error("*** BUMBOY POLL - No Vice Plus role members.");
  }

  if (!bumboyRole) {
    await interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
    return console.error("*** BUMBOY POLL - No BUMBOY role.");
  }

  // Set pollRunning to true
  pollIsRunning = true;

  await interaction.deferReply();

  // Get current BUMBOYS record from database
  const currentBumboysRecord = await getBumboys();

  if (currentBumboysRecord && bumboyRole) {
    const currentBumboyIds = currentBumboysRecord.bumboys.map((b) => b.id);
    const currentBumboys = Array.from(
      bumboyRole.members
        .filter((m) => currentBumboyIds.includes(m.id))
        .values(),
    );

    // If there are BUMBOYS in Discord, clear Ids in database and continue, otherwise print current BUMBOYS and early return
    if (currentBumboys.length === 0) {
      await clearBumboys();
    } else {
      pollIsRunning = false;
      interaction.editReply(
        `BUMBOY poll can only be run once every 12 hours.\n\n${currentBumboys.length
          ? `Current BUMBOYS are:\n\n${currentBumboys
            .map((b) => `💩 **${b.user.username}** 💩`)
            .join("\n\n")}`
          : "There are currently no BUMBOYS..."
        }
              \n\nTry again later at ${dayjs(
          currentBumboysRecord.clearTime,
        ).format("DD/MM/YYYY h:mm:ss a")}`,
      );
      return console.log(
        "*** BUMBOY POLL - BUMBOY poll can only be run once every 12 hours.",
      );
    }
  }

  // Determine how many members to include (up to MAX_BUTTONS)
  const totalVicePlusMembers = vicePlusRole.members.size;
  const includedCount = Math.min(totalVicePlusMembers, MAX_BUTTONS);

  // Randomly retrieve members used as options for the poll (up to 25)
  const includedMembers = vicePlusRole.members.random(includedCount);

  // Array of members in Vice Plus role that will not be included in the poll (only if overflow)
  const nonIncludedMembers = vicePlusRole.members.filter(
    (m) => !includedMembers.includes(m),
  );

  // Whether all vice plus members fit in the poll
  const allMembersFit = nonIncludedMembers.size === 0;

  // Vote tracking: userId -> optionIndex (single-vote)
  const singleVotes = new Map<string, number>();
  // Per-option vote counts
  const voteCounts = new Array(includedMembers.length).fill(0);

  // Absolute end time for the poll
  const endTime = new Date(Date.now() + DURATION_IN_MS).toISOString();

  // Helper to compute remaining whole minutes from endTime
  const getRemainingMinutes = (): number =>
    Math.max(0, Math.ceil((new Date(endTime).getTime() - Date.now()) / 60000));

  // Helper to persist current poll state to the store
  const persistState = (messageId: string, channelId: string): void => {
    const state: PersistedPollState = {
      type: "bumboy",
      messageId,
      channelId,
      initiatorUsername: interaction.user.username,
      endTime,
      voteCounts: [...voteCounts],
      singleVotes: Object.fromEntries(singleVotes),
      multiVotes: {},
      includedMemberIds: includedMembers.map((m) => m.id),
      nonIncludedMemberIds: nonIncludedMembers.map((m) => m.id),
    };
    saveActivePoll(state);
  };

  // Function to generate description for poll embed based on current votes
  const generateDescription = (): string => {
    const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

    // Generate percentage for each option on poll
    const generatePercentage = (index: number): string => {
      const percentage =
        totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : 0;

      if (
        percentage.toString().includes(".") &&
        percentage.toString().split(".")[1].length > 2
      ) {
        return percentage.toFixed(2);
      }

      return percentage.toString();
    };

    // Build the intro text
    let description =
      "The BUMBOY poll is a poll to determine who will be demoted to BUMBOY and have their nickname changed for 24 hours. This doesn't revoke any permissions (except for the ability to change your nickname), but the BUMBOY must suffer the embarrassment of being the BUMBOY.\n\n" +
      "This poll is a non multi vote poll, which means you can only cast a single vote. To change your vote, click a different button.\n\nOnly members of the Vice Plus role may participate.\n\nThe BUMBOY poll can only be run once every 24 hours.\n\n";

    // Conditionally show exempt members or "all members included" message
    if (allMembersFit) {
      description +=
        "✅ All Vice Plus members are included in todays BUMBOY poll!\n\n";
    } else {
      description +=
        `Luckily, the following members are exempt from todays YOZA Bumboy vote (Discord only allows a maximum of ${MAX_BUTTONS} buttons on a message):\n\n` +
        nonIncludedMembers
          .map(
            (m) =>
              `🍀 ${m.user.username} ${m.nickname ? `(${m.nickname})` : ""} 🍀`,
          )
          .join("\n\n") +
        "\n\n";
    }

    description +=
      "Members included in todays BUMBOY poll are:\n\n" +
      [...includedMembers]
        .sort(
          (a, b) =>
            voteCounts[includedMembers.indexOf(b)] -
            voteCounts[includedMembers.indexOf(a)],
        )
        .map((o) => {
          const idx = includedMembers.indexOf(o);
          const votesEmojis = VOTE_EMOJI.repeat(voteCounts[idx]);
          return `${o.user.username}${o.nickname ? ` (${o.nickname})` : ""
            }\n ${votesEmojis ? `${votesEmojis} | ` : ""}${voteCounts[idx]
            } (${generatePercentage(idx)}%)`;
        })
        .join("\n\n");

    return description;
  };

  const getFooterText = (remainingMinutesParam?: number): string => {
    const base = `BUMBOY poll initiated by ${interaction.user.username}`;
    if (remainingMinutesParam === undefined) return base;
    if (remainingMinutesParam <= 0) return `${base}\n\nBUMBOY poll has ended.`;
    return `${base}\n\nBUMBOY poll will end in approximately ${remainingMinutesParam} ${remainingMinutesParam > 1 ? "minutes" : "minute"}.`;
  };

  // Generate a "who voted for who" breakdown from the singleVotes map
  const generateVoteBreakdown = (): string => {
    if (singleVotes.size === 0) return "";

    // Group voters by the candidate they voted for (optionIndex -> voterIds[])
    const votesByCandidate = new Map<number, string[]>();
    for (const [voterId, optionIndex] of singleVotes) {
      if (!votesByCandidate.has(optionIndex)) {
        votesByCandidate.set(optionIndex, []);
      }
      votesByCandidate.get(optionIndex)!.push(voterId);
    }

    // Sort candidates by vote count descending
    const sortedEntries = [...votesByCandidate.entries()].sort(
      (a, b) => b[1].length - a[1].length,
    );

    let breakdown = "\n\n📋 **Vote Breakdown — Who voted for who:**\n\n";

    for (const [optionIndex, voterIds] of sortedEntries) {
      const candidate = includedMembers[optionIndex];
      const candidateName = candidate.nickname ?? candidate.user.username;

      // Resolve voter display names from guild cache
      const voterNames = voterIds.map((id) => {
        const member = interaction.guild?.members.cache.get(id);
        return member
          ? (member.nickname ?? member.user.username)
          : `Unknown (${id})`;
      });

      breakdown += `**${candidateName}** — ${voterNames.join(", ")}\n`;
    }

    return breakdown;
  };

  // Build buttons for each included member
  const buildButtons = (
    disabled = false,
  ): ActionRowBuilder<ButtonBuilder>[] => {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();

    for (let i = 0; i < includedMembers.length; i++) {
      const member = includedMembers[i];
      // Use username (truncated to fit Discord's 80-char button label limit)
      const name = member.nickname ?? member.user.username;
      const label =
        name.length > 72
          ? name.substring(0, 69) + "..."
          : name;

      const button = new ButtonBuilder()
        .setCustomId(`bumboy_vote_${i}`)
        .setLabel(`${label} (${voteCounts[i]})`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);

      currentRow.addComponents(button);

      // 5 buttons per row
      if ((i + 1) % 5 === 0 || i === includedMembers.length - 1) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }

    return rows;
  };

  // Create initial poll embed - No votes yet
  const pollEmbed = new EmbedBuilder()
    .setTitle("Who is the YOZA Bumboy today?")
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setThumbnail(interaction.user.avatarURL())
    .setFooter({
      text: getFooterText(DURATION_IN_MINUTES),
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
    filter: (i) => i.customId.startsWith("bumboy_vote_"),
    time: DURATION_IN_MS,
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
      await message.edit({
        embeds: [pollEmbed],
        components: buildButtons(),
      });
    } catch {
      // Message may have been deleted or edited by the end handler
      clearInterval(durationInterval);
    }

    if (remainingMinutes <= 0) {
      clearInterval(durationInterval);
    }
  }, isDevMode ? 1000 * 10 : 1000 * 60);

  // On Collect listener
  collector.on("collect", async (btnInteraction) => {
    const optionIndex = parseInt(
      btnInteraction.customId.replace("bumboy_vote_", ""),
      10,
    );
    const userId = btnInteraction.user.id;

    // Only Vice Plus members may vote
    if (!vicePlusRole.members.has(userId)) {
      return btnInteraction.reply({
        content: "❌ | Only Vice Plus members may vote in the BUMBOY poll!",
        ephemeral: true,
      });
    }

    // Single-vote mode
    if (singleVotes.has(userId)) {
      const previousIndex = singleVotes.get(userId)!;

      if (previousIndex === optionIndex) {
        return btnInteraction.reply({
          content: `❌ | You already voted for **${includedMembers[optionIndex].user.username}**! Click a different button to change your vote.`,
          ephemeral: true,
        });
      }

      // Move vote from old option to new option
      voteCounts[previousIndex]--;
      voteCounts[optionIndex]++;
      singleVotes.set(userId, optionIndex);
      console.log(
        `*** BUMBOY POLL - ${btnInteraction.user.displayName} changed vote from "${includedMembers[previousIndex].user.username}" to "${includedMembers[optionIndex].user.username}"`,
      );
    } else {
      // New vote
      voteCounts[optionIndex]++;
      singleVotes.set(userId, optionIndex);
      console.log(
        `*** BUMBOY POLL - ${btnInteraction.user.displayName} voted for "${includedMembers[optionIndex].user.username}"`,
      );
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
  collector.on("end", async () => {
    // Stop the countdown interval
    clearInterval(durationInterval);

    // Clear persisted poll state
    clearActivePoll("bumboy");

    // Filter options array to only include options with the highest vote count
    const maxVotes = Math.max(...voteCounts);
    const newBumboys = includedMembers.filter(
      (_, i) => voteCounts[i] === maxVotes,
    );

    // Generate the vote breakdown to append after the results
    const voteBreakdown = generateVoteBreakdown();

    // If no votes, write a sad no votes message to description
    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() +
        "\n\n**BUMBOY poll has ended**\n\nUnfortunately, no votes were cast. 😔😔😔\n\nThis however means that the BUMBOY poll can be run again immediately!",
      );
    } else if (newBumboys.length === 1) {
      // If there is only one winner, add winner to description
      pollEmbed.setDescription(
        generateDescription() +
        `\n\n**BUMBOY Poll has ended**\n\n💩 **${newBumboys[0].user.username
        }${newBumboys[0].nickname ? ` (${newBumboys[0].nickname})` : ""
        }** 💩 is the todays BUMBOY with ${maxVotes} ${maxVotes > 1 ? `votes` : `vote`
        }.\n\n` + voteBreakdown,
      );
    } else {
      // If there are multiple winners, add winners to description
      pollEmbed.setDescription(
        generateDescription() +
        `\n\n**BUMBOY Poll has ended**\n\nTodays BUMBOYS are:\n\n ${newBumboys
          .map(
            (w) =>
              `💩 **${w.user.username}${w.nickname ? ` (${w.nickname})` : ""
              }** 💩`,
          )
          .join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? `votes` : `vote`
        } each.` + voteBreakdown,
      );
    }

    pollEmbed.setFooter({ text: getFooterText(0) });
    message.edit({ embeds: [pollEmbed], components: buildButtons(true) });

    // Set roles and change nicknames for bumboys
    // Weird recursive function to set bumboys one at a time with a 3 second delay between each
    let i = 0;
    const setBumboys = async () => {
      setTimeout(async () => {
        console.log(`*** MAKING MEMBER BUMBOY: ${newBumboys[i].user.username}`);
        // Spread in managed roles when setting to avoid exception (for instance server booster role)
        await newBumboys[i].roles.set([
          env.BUMBOY_ROLE_ID,
          ...newBumboys[i].roles.cache.filter((r) => r.managed).values(),
        ]);
        // Discord does not allow bots to change the server owner's nickname
        if (newBumboys[i].id === interaction.guild?.ownerId) {
          console.log(`*** SKIPPING NICKNAME CHANGE FOR SERVER OWNER: ${newBumboys[i].user.username}`);
        } else {
          await newBumboys[i].setNickname(
            newBumboys.length === 1
              ? `💩 THE BUMBOY 💩`
              : `💩 BUMBOY ${i + 1} 💩`,
          );
        }

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
    await saveBumboys(
      newBumboys.map((b) => ({ id: b.id, nickname: b.nickname })),
    );

    // Record wins on the leaderboard
    recordBumboyWins(newBumboys.map((b) => b.id));

    // Schedule job to promote bumboys back to Vice Plus after 12 hours and reset their nicknames
    clearBumboysJob(interaction.client);

    // Set pollIsRunning back to false
    pollIsRunning = false;
  });
};
