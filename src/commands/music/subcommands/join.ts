import { ChannelType } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { Subcommands } from "../music";

import type {
  SlashCommandSubcommandBuilder,
  GuildMember,
  ChatInputCommandInteraction,
  VoiceChannel,
} from "discord.js";
import type { VoiceConnectionState } from "@discordjs/voice";
import type { Interaction } from "../../../types/types";

// Music join subcommand
export const joinSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.JOIN)
    .setDescription("Joins your voice channel or a supplied voice channel.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("The voice channel to join"),
    );

// Music join subcommand execution
export const handleJoinSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // Get channel from channel option
  let channel = interaction.options.getChannel("channel");

  // If channel is not provided, get channel from user's voice channel
  if (!channel) {
    const member = interaction.member as GuildMember;
    channel = member.voice.channel;
  }

  // If channel is not provided, return error message
  if (!channel) {
    console.error("*** MUSIC JOIN SUBCOMMAND - NO CHANNEL");
    return void interaction.reply({
      content:
        "❌ | You must be in a voice channel or provide a voice channel to join!",
      ephemeral: true,
    });
  }

  if (channel.type !== ChannelType.GuildVoice) {
    console.error("*** MUSIC JOIN SUBCOMMAND - NOT VOICE CHANNEL");
    return void interaction.reply({
      content: "❌ | You must provide a voice channel to join!",
      ephemeral: true,
    });
  }

  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: interaction.guildId,
    adapterCreator: (channel as VoiceChannel).guild.voiceAdapterCreator,
  });

  // TODO: Remove
  connection.on(
    "stateChange",
    (oldState: VoiceConnectionState, newState: VoiceConnectionState) => {
      const oldNetworking = Reflect.get(oldState, "networking");
      const newNetworking = Reflect.get(newState, "networking");

      const networkStateChangeHandler = (
        oldNetworkState: any,
        newNetworkState: any,
      ) => {
        const newUdp = Reflect.get(newNetworkState, "udp");
        clearInterval(newUdp?.keepAliveInterval);
      };

      oldNetworking?.off("stateChange", networkStateChangeHandler);
      newNetworking?.on("stateChange", networkStateChangeHandler);
    },
  );

  interaction.reply({
    content: `Joined the voice channel: ${channel.name}!`,
    ephemeral: true,
  });
};
