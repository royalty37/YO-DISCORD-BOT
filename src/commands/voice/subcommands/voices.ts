import { getCachedVoiceId } from "../../../services/ttsService";
import { VOICE_PROFILES } from "../../voice/voiceProfiles";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

// /voice voices — lists all configured voice profiles
export const voicesSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName("voices")
    .setDescription("List all available voice profiles and their status.");

export const handleVoicesSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  if (VOICE_PROFILES.length === 0) {
    return void interaction.reply({
      content:
        "📋 | No voice profiles configured yet. Add entries to `voiceProfiles.ts` and place reference audio in `data/voices/`.",
      ephemeral: true,
    });
  }

  const lines = VOICE_PROFILES.map((profile) => {
    const voiceId = getCachedVoiceId(profile.name);
    const status = voiceId ? "✅ Enrolled" : "⏳ Not enrolled (will enroll on first use)";
    return `• **${profile.name}** — ${status}`;
  });

  interaction.reply({
    content: `🎤 **Voice Profiles**\n\n${lines.join("\n")}`,
    ephemeral: true,
  });
};
