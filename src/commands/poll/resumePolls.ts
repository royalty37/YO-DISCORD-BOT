import { Client, ComponentType, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, Message } from "discord.js";
import { YoClient } from "../../types/types";
import { getActiveBumboyPoll, getActiveRegularPolls, clearActivePoll, saveActivePoll, PersistedPollState } from "./pollStore";
import { saveBumboys, recordBumboyWins } from "../bumboy/actions/bumboyActions";
import { clearBumboysJob } from "../bumboy/jobs/bumboyJobs";
import { env } from "../../environment";
import { isDevMode } from "../../config";

// ─── Shared Helpers ─────────────────────────────────────────────────────────

const VOTE_EMOJI = "🟢";

const EMOJI_NUMBERS = [
  "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣",
  "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟",
];

async function fetchPollMessage(
  client: Client,
  channelId: string,
  messageId: string,
): Promise<Message | null> {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased()) return null;
    return await (channel as TextChannel).messages.fetch(messageId);
  } catch {
    return null;
  }
}

// ─── Bumboy Poll Resume ─────────────────────────────────────────────────────

async function resumeBumboyPoll(client: YoClient, state: PersistedPollState): Promise<void> {
  const remainingMs = new Date(state.endTime).getTime() - Date.now();

  // Fetch the original message
  const message = await fetchPollMessage(client, state.channelId, state.messageId);

  if (!message) {
    console.log("*** POLL RESUME - Could not fetch bumboy poll message, clearing state");
    clearActivePoll("bumboy");
    return;
  }

  // Resolve member IDs to GuildMember objects
  const guild = message.guild;
  if (!guild) {
    clearActivePoll("bumboy");
    return;
  }
  await guild.members.fetch();

  const includedMemberIds = state.includedMemberIds ?? [];
  const includedMembers = includedMemberIds
    .map((id) => guild.members.cache.get(id))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  if (includedMembers.length === 0) {
    console.log("*** POLL RESUME - No included members found, clearing bumboy poll");
    clearActivePoll("bumboy");
    return;
  }

  // Restore vote state
  const voteCounts = [...state.voteCounts];
  const singleVotes = new Map(Object.entries(state.singleVotes).map(([k, v]) => [k, v as number]));

  // ─── Helper functions (mirrors poll.ts) ─────────────────────────────

  const getRemainingMinutes = (): number =>
    Math.max(0, Math.ceil((new Date(state.endTime).getTime() - Date.now()) / 60000));

  const generateDescription = (): string => {
    const totalVotes = voteCounts.reduce((a, b) => a + b, 0);
    const generatePercentage = (index: number): string => {
      const pct = totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : 0;
      return pct.toString().includes(".") && pct.toString().split(".")[1].length > 2
        ? pct.toFixed(2) : pct.toString();
    };

    let description =
      "The BUMBOY poll is a poll to determine who will be demoted to BUMBOY and have their nickname changed for 24 hours. This doesn't revoke any permissions (except for the ability to change your nickname), but the BUMBOY must suffer the embarrassment of being the BUMBOY.\n\n" +
      "This poll is a non multi vote poll, which means you can only cast a single vote. To change your vote, click a different button.\n\nOnly members of the Vice Plus role may participate.\n\nThe BUMBOY poll can only be run once every 24 hours.\n\n" +
      "✅ _Poll resumed after bot restart._\n\n" +
      "Members included in todays BUMBOY poll are:\n\n" +
      [...includedMembers]
        .sort((a, b) => voteCounts[includedMembers.indexOf(b)] - voteCounts[includedMembers.indexOf(a)])
        .map((o) => {
          const idx = includedMembers.indexOf(o);
          const votesEmojis = VOTE_EMOJI.repeat(voteCounts[idx]);
          return `${o.user.username}${o.nickname ? ` (${o.nickname})` : ""}\n ${votesEmojis ? `${votesEmojis} | ` : ""}${voteCounts[idx]} (${generatePercentage(idx)}%)`;
        })
        .join("\n\n");

    return description;
  };

  const getFooterText = (mins?: number): string => {
    const base = `BUMBOY poll initiated by ${state.initiatorUsername}`;
    if (mins === undefined) return base;
    if (mins <= 0) return `${base}\n\nBUMBOY poll has ended.`;
    return `${base}\n\nBUMBOY poll will end in approximately ${mins} ${mins > 1 ? "minutes" : "minute"}.`;
  };

  const generateVoteBreakdown = (): string => {
    if (singleVotes.size === 0) return "";
    const votesByCandidate = new Map<number, string[]>();
    for (const [voterId, optionIndex] of singleVotes) {
      if (!votesByCandidate.has(optionIndex)) votesByCandidate.set(optionIndex, []);
      votesByCandidate.get(optionIndex)!.push(voterId);
    }
    const sortedEntries = [...votesByCandidate.entries()].sort((a, b) => b[1].length - a[1].length);
    let breakdown = "\n\n📋 **Vote Breakdown — Who voted for who:**\n\n";
    for (const [optionIndex, voterIds] of sortedEntries) {
      const candidate = includedMembers[optionIndex];
      const candidateName = candidate.nickname ?? candidate.user.username;
      const voterNames = voterIds.map((id) => {
        const member = guild.members.cache.get(id);
        return member ? (member.nickname ?? member.user.username) : `Unknown (${id})`;
      });
      breakdown += `**${candidateName}** — ${voterNames.join(", ")}\n`;
    }
    return breakdown;
  };

  const buildButtons = (disabled = false): ActionRowBuilder<ButtonBuilder>[] => {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 0; i < includedMembers.length; i++) {
      const member = includedMembers[i];
      const name = member.nickname ?? member.user.username;
      const label = name.length > 72 ? name.substring(0, 69) + "..." : name;
      const button = new ButtonBuilder()
        .setCustomId(`bumboy_vote_${i}`)
        .setLabel(`${label} (${voteCounts[i]})`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
      currentRow.addComponents(button);
      if ((i + 1) % 5 === 0 || i === includedMembers.length - 1) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }
    return rows;
  };

  const persistState = (): void => {
    const updated: PersistedPollState = {
      ...state,
      voteCounts: [...voteCounts],
      singleVotes: Object.fromEntries(singleVotes),
    };
    saveActivePoll(updated);
  };

  // ─── Poll already expired during downtime ───────────────────────────

  if (remainingMs <= 0) {
    console.log("*** POLL RESUME - Bumboy poll expired during downtime, processing results");
    clearActivePoll("bumboy");

    const maxVotes = Math.max(...voteCounts);
    const newBumboys = includedMembers.filter((_, i) => voteCounts[i] === maxVotes);
    const voteBreakdown = generateVoteBreakdown();

    const pollEmbed = new EmbedBuilder()
      .setTitle("Who is the YOZA Bumboy today?")
      .setColor(Colors.Red)
      .setFooter({ text: getFooterText(0) });

    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() +
        "\n\n**BUMBOY poll has ended** _(poll ended while bot was offline)_\n\nUnfortunately, no votes were cast. 😔😔😔\n\nThis however means that the BUMBOY poll can be run again immediately!",
      );
    } else if (newBumboys.length === 1) {
      pollEmbed.setDescription(
        generateDescription() +
        `\n\n**BUMBOY Poll has ended** _(poll ended while bot was offline)_\n\n💩 **${newBumboys[0].user.username}${newBumboys[0].nickname ? ` (${newBumboys[0].nickname})` : ""}** 💩 is the todays BUMBOY with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"}.` + voteBreakdown,
      );
    } else {
      pollEmbed.setDescription(
        generateDescription() +
        `\n\n**BUMBOY Poll has ended** _(poll ended while bot was offline)_\n\nTodays BUMBOYS are:\n\n ${newBumboys.map((w) => `💩 **${w.user.username}${w.nickname ? ` (${w.nickname})` : ""}** 💩`).join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"} each.` + voteBreakdown,
      );
    }

    await message.edit({ embeds: [pollEmbed], components: buildButtons(true) });

    if (!isDevMode && maxVotes) {
      // Assign bumboy roles
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let i = 0; i < newBumboys.length; i++) {
        console.log(`*** MAKING MEMBER BUMBOY (RESUME): ${newBumboys[i].user.username}`);
        await newBumboys[i].roles.set([
          env.BUMBOY_ROLE_ID,
          ...newBumboys[i].roles.cache.filter((r) => r.managed).values(),
        ]);
        await newBumboys[i].setNickname(
          newBumboys.length === 1 ? "💩 THE BUMBOY 💩" : `💩 BUMBOY ${i + 1} 💩`,
        );
        await sleep(1000);
      }
      await saveBumboys(newBumboys.map((b) => ({ id: b.id, nickname: b.nickname })));
      recordBumboyWins(newBumboys.map((b) => b.id));
      clearBumboysJob(client);
    }

    return;
  }

  // ─── Poll still active — re-attach collector and interval ───────────

  console.log(`*** POLL RESUME - Resuming bumboy poll with ${getRemainingMinutes()} minutes remaining`);

  const pollEmbed = new EmbedBuilder()
    .setTitle("Who is the YOZA Bumboy today?")
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setFooter({ text: getFooterText(getRemainingMinutes()) });

  await message.edit({ embeds: [pollEmbed], components: buildButtons() });

  // Fetch the Vice Plus role for vote validation
  const vicePlusRole = await guild.roles.fetch(env.VICE_PLUS_ROLE_ID);

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.customId.startsWith("bumboy_vote_"),
    time: remainingMs,
  });

  const durationInterval = setInterval(async () => {
    const mins = getRemainingMinutes();
    if (collector.ended) { clearInterval(durationInterval); return; }
    pollEmbed.setFooter({ text: getFooterText(mins) });
    try { await message.edit({ embeds: [pollEmbed], components: buildButtons() }); }
    catch { clearInterval(durationInterval); }
    if (mins <= 0) clearInterval(durationInterval);
  }, 60000);

  collector.on("collect", async (btnInteraction) => {
    const optionIndex = parseInt(btnInteraction.customId.replace("bumboy_vote_", ""), 10);
    const userId = btnInteraction.user.id;

    if (vicePlusRole && !vicePlusRole.members.has(userId)) {
      return btnInteraction.reply({ content: "❌ | Only Vice Plus members may vote in the BUMBOY poll!", ephemeral: true });
    }

    if (singleVotes.has(userId)) {
      const prev = singleVotes.get(userId)!;
      if (prev === optionIndex) {
        return btnInteraction.reply({ content: `❌ | You already voted for **${includedMembers[optionIndex].user.username}**! Click a different button to change your vote.`, ephemeral: true });
      }
      voteCounts[prev]--;
      voteCounts[optionIndex]++;
      singleVotes.set(userId, optionIndex);
    } else {
      voteCounts[optionIndex]++;
      singleVotes.set(userId, optionIndex);
    }

    pollEmbed.setDescription(generateDescription());
    await btnInteraction.update({ embeds: [pollEmbed], components: buildButtons() });
    persistState();
  });

  collector.on("end", async () => {
    clearInterval(durationInterval);
    clearActivePoll("bumboy");

    const maxVotes = Math.max(...voteCounts);
    const newBumboys = includedMembers.filter((_, i) => voteCounts[i] === maxVotes);
    const voteBreakdown = generateVoteBreakdown();

    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() + "\n\n**BUMBOY poll has ended**\n\nUnfortunately, no votes were cast. 😔😔😔\n\nThis however means that the BUMBOY poll can be run again immediately!",
      );
    } else if (newBumboys.length === 1) {
      pollEmbed.setDescription(
        generateDescription() + `\n\n**BUMBOY Poll has ended**\n\n💩 **${newBumboys[0].user.username}${newBumboys[0].nickname ? ` (${newBumboys[0].nickname})` : ""}** 💩 is the todays BUMBOY with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"}.` + voteBreakdown,
      );
    } else {
      pollEmbed.setDescription(
        generateDescription() + `\n\n**BUMBOY Poll has ended**\n\nTodays BUMBOYS are:\n\n ${newBumboys.map((w) => `💩 **${w.user.username}${w.nickname ? ` (${w.nickname})` : ""}** 💩`).join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"} each.` + voteBreakdown,
      );
    }

    pollEmbed.setFooter({ text: getFooterText(0) });
    await message.edit({ embeds: [pollEmbed], components: buildButtons(true) });

    if (!isDevMode && maxVotes) {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let i = 0; i < newBumboys.length; i++) {
        console.log(`*** MAKING MEMBER BUMBOY (RESUME): ${newBumboys[i].user.username}`);
        await newBumboys[i].roles.set([
          env.BUMBOY_ROLE_ID,
          ...newBumboys[i].roles.cache.filter((r) => r.managed).values(),
        ]);
        await newBumboys[i].setNickname(
          newBumboys.length === 1 ? "💩 THE BUMBOY 💩" : `💩 BUMBOY ${i + 1} 💩`,
        );
        await sleep(1000);
      }
      await saveBumboys(newBumboys.map((b) => ({ id: b.id, nickname: b.nickname })));
      recordBumboyWins(newBumboys.map((b) => b.id));
      clearBumboysJob(client);
    }
  });
}

// ─── Regular Poll Resume ────────────────────────────────────────────────────

async function resumeRegularPoll(client: Client, state: PersistedPollState): Promise<void> {
  const remainingMs = new Date(state.endTime).getTime() - Date.now();
  const options = state.options ?? [];
  const question = state.question ?? "Poll";
  const allowMultiVote = state.allowMultiVote ?? false;

  const message = await fetchPollMessage(client, state.channelId, state.messageId);

  if (!message) {
    console.log(`*** POLL RESUME - Could not fetch regular poll message ${state.messageId}, clearing state`);
    clearActivePoll("regular", state.messageId);
    return;
  }

  // Restore vote state
  const voteCounts = [...state.voteCounts];
  const singleVotes = new Map(Object.entries(state.singleVotes).map(([k, v]) => [k, v as number]));
  const multiVotes = new Map(
    Object.entries(state.multiVotes).map(([k, v]) => [k, new Set(v as number[])]),
  );

  // ─── Helper functions ───────────────────────────────────────────────

  const getRemainingMinutes = (): number =>
    Math.max(0, Math.ceil((new Date(state.endTime).getTime() - Date.now()) / 60000));

  const generateDescription = (): string => {
    const totalVotes = voteCounts.reduce((a, b) => a + b, 0);
    const generatePercentage = (index: number): string => {
      const pct = totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : 0;
      return pct.toString().includes(".") && pct.toString().split(".")[1].length > 2
        ? pct.toFixed(2) : pct.toString();
    };

    return (
      `This is a ${allowMultiVote ? "" : "non "}multi vote poll, which means participants are ${allowMultiVote
        ? "allowed to cast multiple votes"
        : "only allowed to cast a single vote. To change your vote, click a different option button"
      }. Vote by clicking the button corresponding to the option you want to vote for.\n\n` +
      `_✅ Poll resumed after bot restart._\n\n` +
      [...options]
        .sort((a, b) => voteCounts[options.indexOf(b)] - voteCounts[options.indexOf(a)])
        .map((o) => {
          const idx = options.indexOf(o);
          const votesEmojis = VOTE_EMOJI.repeat(voteCounts[idx]);
          return `${EMOJI_NUMBERS[idx]} ${o}\n ${votesEmojis ? `${votesEmojis} | ` : ""}${voteCounts[idx]} (${generatePercentage(idx)}%)`;
        })
        .join("\n\n")
    );
  };

  const getFooterText = (mins?: number): string => {
    const base = `Poll created by ${state.initiatorUsername}`;
    if (mins === undefined) return base;
    if (mins <= 0) return `${base}\n\nPoll has ended.`;
    return `${base}\n\nPoll will end in approximately ${mins} ${mins > 1 ? "minutes" : "minute"}.`;
  };

  const generateVoteBreakdown = (): string => {
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
    const sortedEntries = [...votesByOption.entries()].sort((a, b) => b[1].length - a[1].length);
    let breakdown = "\n\n📋 **Vote Breakdown — Who voted for what:**\n\n";
    for (const [optionIndex, voterIds] of sortedEntries) {
      const voterNames = voterIds.map((id) => {
        const member = message.guild?.members.cache.get(id);
        return member ? (member.nickname ?? member.user.username) : `Unknown (${id})`;
      });
      breakdown += `**${options[optionIndex]}** — ${voterNames.join(", ")}\n`;
    }
    return breakdown;
  };

  const buildButtons = (disabled = false): ActionRowBuilder<ButtonBuilder>[] => {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 0; i < options.length; i++) {
      const label = options[i].length > 80 ? options[i].substring(0, 77) + "..." : options[i];
      const button = new ButtonBuilder()
        .setCustomId(`poll_vote_${i}`)
        .setLabel(`${label} (${voteCounts[i]})`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(EMOJI_NUMBERS[i])
        .setDisabled(disabled);
      currentRow.addComponents(button);
      if ((i + 1) % 5 === 0 || i === options.length - 1) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }
    return rows;
  };

  const persistState = (): void => {
    const updated: PersistedPollState = {
      ...state,
      voteCounts: [...voteCounts],
      singleVotes: Object.fromEntries(singleVotes),
      multiVotes: Object.fromEntries(
        [...multiVotes.entries()].map(([k, v]) => [k, [...v]]),
      ),
    };
    saveActivePoll(updated);
  };

  // ─── Finalize poll (shared between expired and end handler) ─────────

  const finalizePoll = (pollEmbed: EmbedBuilder, offlineNote: string): void => {
    const maxVotes = Math.max(...voteCounts);
    const winners = options.filter((_, i) => voteCounts[i] === maxVotes);
    const voteBreakdown = generateVoteBreakdown();

    if (!maxVotes) {
      pollEmbed.setDescription(
        generateDescription() + `\n\n**Poll has ended**${offlineNote}\n\nUnfortunately, no votes were cast. 😔😔😔`,
      );
    } else if (winners.length === 1) {
      pollEmbed.setDescription(
        generateDescription() + `\n\n**Poll has ended**${offlineNote}\n\n👑 **${winners[0]}** 👑 is the winner with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"}.` + voteBreakdown,
      );
    } else {
      pollEmbed.setDescription(
        generateDescription() + `\n\n**Poll has ended**${offlineNote}\n\nWinners are:\n\n ${winners.map((w) => `👑 **${w}** 👑`).join("\n")}\n\n with ${maxVotes} ${maxVotes > 1 ? "votes" : "vote"} each.` + voteBreakdown,
      );
    }

    pollEmbed.setFooter({ text: getFooterText(0) });
  };

  // ─── Poll already expired during downtime ───────────────────────────

  if (remainingMs <= 0) {
    console.log(`*** POLL RESUME - Regular poll ${state.messageId} expired during downtime, processing results`);
    clearActivePoll("regular", state.messageId);

    const pollEmbed = new EmbedBuilder()
      .setTitle(question)
      .setColor(Colors.Red);

    finalizePoll(pollEmbed, " _(poll ended while bot was offline)_");
    await message.edit({ embeds: [pollEmbed], components: buildButtons(true) });
    return;
  }

  // ─── Poll still active — re-attach collector and interval ───────────

  console.log(`*** POLL RESUME - Resuming regular poll "${question}" with ${getRemainingMinutes()} minutes remaining`);

  const pollEmbed = new EmbedBuilder()
    .setTitle(question)
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setFooter({ text: getFooterText(getRemainingMinutes()) });

  await message.edit({ embeds: [pollEmbed], components: buildButtons() });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.customId.startsWith("poll_vote_"),
    time: remainingMs,
  });

  const durationInterval = setInterval(async () => {
    const mins = getRemainingMinutes();
    if (collector.ended) { clearInterval(durationInterval); return; }
    pollEmbed.setFooter({ text: getFooterText(mins) });
    try { await message.edit({ embeds: [pollEmbed], components: buildButtons() }); }
    catch { clearInterval(durationInterval); }
    if (mins <= 0) clearInterval(durationInterval);
  }, 60000);

  collector.on("collect", async (btnInteraction) => {
    const optionIndex = parseInt(btnInteraction.customId.replace("poll_vote_", ""), 10);
    const userId = btnInteraction.user.id;

    if (allowMultiVote) {
      if (!multiVotes.has(userId)) multiVotes.set(userId, new Set());
      const userVotes = multiVotes.get(userId)!;
      if (userVotes.has(optionIndex)) {
        userVotes.delete(optionIndex);
        voteCounts[optionIndex]--;
      } else {
        userVotes.add(optionIndex);
        voteCounts[optionIndex]++;
      }
    } else {
      if (singleVotes.has(userId)) {
        const prev = singleVotes.get(userId)!;
        if (prev === optionIndex) {
          return btnInteraction.reply({ content: `❌ | You already voted for **${options[optionIndex]}**! Click a different option to change your vote.`, ephemeral: true });
        }
        voteCounts[prev]--;
        voteCounts[optionIndex]++;
        singleVotes.set(userId, optionIndex);
      } else {
        voteCounts[optionIndex]++;
        singleVotes.set(userId, optionIndex);
      }
    }

    pollEmbed.setDescription(generateDescription());
    await btnInteraction.update({ embeds: [pollEmbed], components: buildButtons() });
    persistState();
  });

  collector.on("end", () => {
    clearInterval(durationInterval);
    clearActivePoll("regular", state.messageId);
    finalizePoll(pollEmbed, "");
    message.edit({ embeds: [pollEmbed], components: buildButtons(true) });
  });
}

// ─── Main Entry Point ───────────────────────────────────────────────────────

export async function resumeActivePolls(client: YoClient): Promise<void> {
  console.log("*** POLL RESUME - Checking for active polls to resume...");

  // Resume bumboy poll
  const bumboyPoll = getActiveBumboyPoll();
  if (bumboyPoll) {
    console.log("*** POLL RESUME - Found active bumboy poll, resuming...");
    try {
      await resumeBumboyPoll(client, bumboyPoll);
    } catch (error) {
      console.error("*** POLL RESUME - Error resuming bumboy poll:", error);
      clearActivePoll("bumboy");
    }
  }

  // Resume regular polls
  const regularPolls = getActiveRegularPolls();
  if (regularPolls.length > 0) {
    console.log(`*** POLL RESUME - Found ${regularPolls.length} active regular poll(s), resuming...`);
    for (const poll of regularPolls) {
      try {
        await resumeRegularPoll(client, poll);
      } catch (error) {
        console.error(`*** POLL RESUME - Error resuming regular poll ${poll.messageId}:`, error);
        clearActivePoll("regular", poll.messageId);
      }
    }
  }

  if (!bumboyPoll && regularPolls.length === 0) {
    console.log("*** POLL RESUME - No active polls to resume.");
  }
}
