import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  StreamType,
} from "@discordjs/voice";
import { Readable } from "stream";
import {
  enrollVoice,
  synthesizeSpeech,
  getCachedVoiceId,
} from "../../../services/ttsService";
import { VOICE_PROFILES } from "../../voice/voiceProfiles";

import type {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandSubcommandBuilder,
  VoiceChannel,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// /voice say <friend> <message>
export const saySubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName("say")
    .setDescription("Say something in a friend's cloned voice!")
    .addStringOption((option) =>
      option
        .setName("friend")
        .setDescription("Whose voice to use")
        .setRequired(true)
        .addChoices(
          ...VOICE_PROFILES.map((p) => ({
            name: p.name,
            value: p.name.toLowerCase(),
          })),
        ),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What to say")
        .setRequired(true),
    );

export const handleSaySubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  try {
    // 1. Validate the user is in a voice channel
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return void interaction.reply({
        content: "❌ | You must be in a voice channel!",
        ephemeral: true,
      });
    }

    if (!interaction.guildId) {
      return void interaction.reply({
        content: "Something went wrong. Please try again.",
        ephemeral: true,
      });
    }

    const friendKey = interaction.options.getString("friend", true);
    const message = interaction.options.getString("message", true);

    // 2. Find the voice profile
    const profile = VOICE_PROFILES.find(
      (p) => p.name.toLowerCase() === friendKey,
    );

    if (!profile) {
      return void interaction.reply({
        content: `❌ | Voice profile "${friendKey}" not found.`,
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // 3. Get or enroll the voice
    let voiceId = getCachedVoiceId(profile.name);

    if (!voiceId) {
      await interaction.editReply(
        `🎙️ | First time using ${profile.name}'s voice — enrolling...`,
      );
      voiceId = await enrollVoice(
        profile.name,
        profile.fileName,
        profile.referenceText,
      );
    }

    // 4. Synthesize speech
    await interaction.editReply(
      `🔊 | Generating speech as ${profile.name}...`,
    );
    const audioBuffer = await synthesizeSpeech(voiceId, message);

    // 5. Join voice channel and play
    const existingConnection = getVoiceConnection(interaction.guildId);

    // Always create a fresh connection for TTS to avoid stale state
    const connection = existingConnection ?? joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guildId,
      adapterCreator: (voiceChannel as VoiceChannel).guild
        .voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const stream = Readable.from(audioBuffer);
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    connection.subscribe(player);
    player.play(resource);

    await interaction.editReply(
      `🗣️ | Speaking as **${profile.name}**: "${message}"`,
    );

    // 6. Wait for playback to finish, then clean up
    await new Promise<void>((resolve) => {
      player.once(AudioPlayerStatus.Idle, () => {
        player.stop(true);

        // Only disconnect if we created a new connection for TTS
        if (!existingConnection) {
          setTimeout(() => {
            connection.destroy();
          }, 500);
        }

        resolve();
      });

      player.once("error", (error) => {
        console.error("*** TTS AUDIO PLAYER ERROR:", error);
        player.stop(true);
        if (!existingConnection) {
          connection.destroy();
        }
        resolve();
      });
    });
  } catch (error) {
    console.error("*** VOICE SAY SUBCOMMAND ERROR:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (interaction.deferred) {
      await interaction.editReply(`❌ | Failed to speak: ${errorMsg}`);
    } else {
      await interaction.reply({
        content: `❌ | Failed to speak: ${errorMsg}`,
        ephemeral: true,
      });
    }
  }
};
