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
} from "../actions/bumboyActions";
import dayjs from "dayjs";
import { clearBumboysJob } from "../jobs/bumboyJobs";
import { Interaction } from "../../../types/types";
import { env } from "../../../environment";
import { isDevMode } from "../../../config";

// Emoji that represents a vote in description
const VOTE_EMOJI = "🟢";

// Duration of the poll in milliseconds, 1 hour
const DURATION_IN_MINUTES = 60;
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
  await interaction.guild?.members.fetch();

  // Fetch the Vice Plus and BUMBOY roles
  const vicePlusRole = await interaction.guild?.roles.fetch(env.VICE_PLUS_ROLE_ID);
  const bumboyRole = await interaction.guild?.roles.fetch(env.BUMBOY_ROLE_ID);

  console.log("*** DEBUG - Vice Plus role ID:", env.VICE_PLUS_ROLE_ID);
  console.log("*** DEBUG - BUMBOY role ID:", env.BUMBOY_ROLE_ID);
  console.log('*** DEBUG - VICE PLUS ROLE members:', vicePlusRole?.members);

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

  const getFooterText = (remainingDurationParam?: number): string =>
    `BUMBOY poll initiated by ${interaction.user.username}${remainingDurationParam
      ? `\n\nBUMBOY poll will end in approximately ${remainingDurationParam} ${remainingDurationParam > 1 ? `minutes` : `minute`
      }.`
      : ""
    }`;

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

  // Create button collector
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.customId.startsWith("bumboy_vote_"),
    time: DURATION_IN_MS,
  });

  // Recursive function to update poll embed footer with remaining duration every minute
  const updateDuration = async (duration: number) => {
    setTimeout(async () => {
      pollEmbed.setFooter({
        text: getFooterText(duration),
      });
      await message.edit({
        embeds: [pollEmbed],
        components: buildButtons(),
      });

      if (duration > 1 && !collector.ended) {
        updateDuration(duration - 1);
      }
    }, 1000 * 60);
  };

  updateDuration(DURATION_IN_MINUTES);

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
  });

  // On End listener
  collector.on("end", async () => {
    // Filter options array to only include options with the highest vote count
    const maxVotes = Math.max(...voteCounts);
    const newBumboys = includedMembers.filter(
      (_, i) => voteCounts[i] === maxVotes,
    );

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
        }.\n\n`,
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
        } each.`,
      );
    }

    pollEmbed.setFooter({ text: getFooterText() });
    message.edit({ embeds: [pollEmbed], components: buildButtons(true) });

    // In dev mode, skip role assignment and send test-run disclaimer
    if (isDevMode) {
      pollIsRunning = false;
      if (maxVotes) {
        await interaction.followUp(
          "⚠️ **Test Mode** — YOZA Bot is currently running in test mode. This was a dry run and no roles or nicknames have been changed. Nobody is the BUMBOY today... yet. 😈",
        );
      }
      return;
    }

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
        await newBumboys[i].setNickname(
          newBumboys.length === 1
            ? `💩 THE BUMBOY 💩`
            : `💩 BUMBOY ${i + 1} 💩`,
        );

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

    // Schedule job to promote bumboys back to Vice Plus after 12 hours and reset their nicknames
    clearBumboysJob(interaction.client);

    // Set pollIsRunning back to false
    pollIsRunning = false;
  });
};
