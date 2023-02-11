import {
  SlashCommandSubcommandBuilder,
  VoiceChannel,
  GuildMember,
  ChannelType,
  ChatInputCommandInteraction,
} from "discord.js";
import { subcommands } from "../music";
import { Interaction } from "../../../types/types";

// Music join subcommand
export const joinSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.JOIN)
    .setDescription("Joins your voice channel or a supplied voice channel.")
    .addChannelOption((option) => option.setName("channel").setDescription("The voice channel to join"));

// Music join subcommand execution
export const handleJoinSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
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
      content: "❌ | You must be in a voice channel or provide a voice channel to join!",
      ephemeral: true,
    });
  }

  if (channel.type !== ChannelType.GuildVoice) {
    console.error("*** MUSIC JOIN SUBCOMMAND - NOT VOICE CHANNEL");
    return void interaction.reply({ content: "❌ | You must provide a voice channel to join!", ephemeral: true });
  }

  if (!interaction.guildId) {
    console.log("*** MUSIC RESUME SUBCOMMAND - NO GUILD ID");
    return void interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
  }

  await interaction.client.distube.voices.join(channel as VoiceChannel);
  interaction.reply({ content: `Joined the voice channel: ${channel.name}!`, ephemeral: true });
};
