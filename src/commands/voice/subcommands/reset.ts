import { deleteData } from "../../../fileStore";
import { getCachedVoiceId } from "../../../services/ttsService";
import { VOICE_PROFILES } from "../../voice/voiceProfiles";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

const VOICE_ID_PREFIX = "tts_voice_id_";

// /voice reset <friend> — clears cached enrollment so a new sample is used
export const resetSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName("reset")
    .setDescription("Reset a friend's voice enrollment to re-enroll with a new sample.")
    .addStringOption((option) =>
      option
        .setName("friend")
        .setDescription("Whose voice to reset")
        .setRequired(true)
        .addChoices(
          ...VOICE_PROFILES.map((p) => ({
            name: p.name,
            value: p.name.toLowerCase(),
          })),
        ),
    );

export const handleResetSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  const friendKey = interaction.options.getString("friend", true);

  const profile = VOICE_PROFILES.find(
    (p) => p.name.toLowerCase() === friendKey,
  );

  if (!profile) {
    return void interaction.reply({
      content: `❌ | Voice profile "${friendKey}" not found.`,
      ephemeral: true,
    });
  }

  const cachedId = getCachedVoiceId(profile.name);

  if (!cachedId) {
    return void interaction.reply({
      content: `⏳ | **${profile.name}**'s voice hasn't been enrolled yet — nothing to reset.`,
      ephemeral: true,
    });
  }

  // Clear the cached voice name
  deleteData(`${VOICE_ID_PREFIX}${profile.name.toLowerCase()}`);

  interaction.reply({
    content: `🔄 | Reset **${profile.name}**'s voice enrollment. It will re-enroll with the current audio file on the next \`/voice say\`.`,
    ephemeral: true,
  });
};
