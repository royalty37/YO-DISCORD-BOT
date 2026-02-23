import {
  finishLatestQueueMessage,
  updateLatestQueueMessage,
} from "../actions/queueActions";
import { useQueue } from "discord-player";
import { Subcommands } from "../music";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import type {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

const VOTE_TIMEOUT_MS = 60_000; // 60 seconds

// Music skip subcommand
export const skipSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(Subcommands.SKIP).setDescription("Vote to skip the current song.");

// Music skip subcommand execution
export const handleSkipSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // If no guildId, return
  if (!interaction.guildId) {
    console.log("*** MUSIC SKIP SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  // Get queue
  const queue = useQueue(interaction.guildId);

  // If no queue, return
  if (!queue) {
    console.error("*** MUSIC SKIP SUBCOMMAND - NO QUEUE");
    return interaction.reply({
      content: "❌ | No song is playing!",
      ephemeral: true,
    });
  }

  const currentTrack = queue.currentTrack;
  if (!currentTrack) {
    return interaction.reply({
      content: "❌ | No song is currently playing!",
      ephemeral: true,
    });
  }

  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: "❌ | You must be in a voice channel to vote!",
      ephemeral: true,
    });
  }

  // If the track requester is the one skipping, skip immediately
  const requesterId = currentTrack.requestedBy?.id;
  if (requesterId && requesterId === interaction.user.id) {
    return performSkip(interaction, queue);
  }

  // Count human listeners (exclude bots)
  const listeners = voiceChannel.members.filter((m) => !m.user.bot);
  const requiredVotes = Math.ceil(listeners.size / 2);

  // If only 1 listener, skip immediately
  if (listeners.size <= 1) {
    return performSkip(interaction, queue);
  }

  // Start a vote
  const voters = new Set<string>([interaction.user.id]);

  const button = new ButtonBuilder()
    .setCustomId("vote_skip")
    .setLabel(`Vote Skip (${voters.size}/${requiredVotes})`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏭️");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  const reply = await interaction.reply({
    content: `⏭️ | **${interaction.user.displayName}** wants to skip **${currentTrack.title}**\nVotes: **${voters.size}/${requiredVotes}** needed`,
    components: [row],
    fetchReply: true,
  });

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.customId === "vote_skip",
    time: VOTE_TIMEOUT_MS,
  });

  collector.on("collect", async (btnInteraction) => {
    // Must be in the same voice channel
    const voterMember = btnInteraction.member as GuildMember;
    if (voterMember.voice.channelId !== voiceChannel.id) {
      return btnInteraction.reply({
        content: "❌ | You must be in the voice channel to vote!",
        ephemeral: true,
      });
    }

    // Prevent double voting
    if (voters.has(btnInteraction.user.id)) {
      return btnInteraction.reply({
        content: "❌ | You already voted to skip!",
        ephemeral: true,
      });
    }

    voters.add(btnInteraction.user.id);
    console.log(
      `*** VOTE SKIP - ${btnInteraction.user.displayName} voted (${voters.size}/${requiredVotes})`,
    );

    // Check if enough votes
    if (voters.size >= requiredVotes) {
      collector.stop("skipped");

      const disabledButton = ButtonBuilder.from(button)
        .setLabel(`Skipped! (${voters.size}/${requiredVotes})`)
        .setDisabled(true)
        .setStyle(ButtonStyle.Success);
      const disabledRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButton);

      await btnInteraction.update({
        content: `⏭️ | Vote passed! Skipping **${currentTrack.title}**`,
        components: [disabledRow],
      });

      // Actually skip the track
      try {
        if (!queue.tracks.toArray().length) {
          queue?.node.stop();
          console.log("*** VOTE SKIP - STOPPED QUEUE (no more tracks)");
          finishLatestQueueMessage();
        } else {
          queue.node.skip();
          console.log("*** VOTE SKIP - SKIPPED SONG");
          updateLatestQueueMessage(queue);
        }
      } catch (e) {
        console.error(`*** VOTE SKIP - EXCEPTION: ${e}`);
      }
    } else {
      // Update button label with new count
      const updatedButton = ButtonBuilder.from(button).setLabel(
        `Vote Skip (${voters.size}/${requiredVotes})`,
      );
      const updatedRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents(updatedButton);

      await btnInteraction.update({
        content: `⏭️ | **${interaction.user.displayName}** wants to skip **${currentTrack.title}**\nVotes: **${voters.size}/${requiredVotes}** needed`,
        components: [updatedRow],
      });
    }
  });

  collector.on("end", (_collected, reason) => {
    if (reason === "skipped") return; // already handled

    // Timeout — disable the button
    const expiredButton = ButtonBuilder.from(button)
      .setLabel(`Vote Expired (${voters.size}/${requiredVotes})`)
      .setDisabled(true)
      .setStyle(ButtonStyle.Secondary);
    const expiredRow =
      new ActionRowBuilder<ButtonBuilder>().addComponents(expiredButton);

    reply
      .edit({
        content: `⏭️ | Vote to skip **${currentTrack.title}** expired`,
        components: [expiredRow],
      })
      .catch(() => { });
  });
};

/** Perform an immediate skip (no vote needed) */
async function performSkip(
  interaction: Interaction<ChatInputCommandInteraction>,
  queue: ReturnType<typeof useQueue>,
) {
  if (!queue) return;

  try {
    if (!queue.tracks.toArray().length) {
      queue.node.stop();
      console.log("*** MUSIC SKIP SUBCOMMAND - STOPPED QUEUE");
      interaction.reply("⏹️ | Stopped the music!");
      return await finishLatestQueueMessage();
    }

    queue.node.skip();
    console.log("*** MUSIC SKIP SUBCOMMAND - SKIPPED SONG");
    interaction.reply("⏭️ | Skipped!");
    await updateLatestQueueMessage(queue);
  } catch (e) {
    console.error(`*** MUSIC SKIP SUBCOMMAND - EXCEPTION: ${e}`);
    interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }
}
