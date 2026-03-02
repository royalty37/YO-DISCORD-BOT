import fs from "fs";
import path from "path";
import { env } from "../environment";
import { getData, setData } from "../fileStore";

const DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/api/v1";
const VOICES_DIR = path.join(__dirname, "..", "..", "data", "voices");
const VOICE_ID_PREFIX = "tts_voice_id_";
const TTS_MODEL = "qwen3-tts-vc-2026-01-22";

// ── Enrollment ──────────────────────────────────────────────────────

interface EnrollResponse {
  output: {
    voice: string;
  };
}

/**
 * Enrolls a voice with the DashScope API using a reference audio file.
 * Returns the enrolled voice name and caches it in the file store.
 */
export const enrollVoice = async (
  name: string,
  audioFileName: string,
  referenceText?: string,
): Promise<string> => {
  const apiKey = env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is not set. Cannot enroll voice.");
  }

  const audioPath = path.join(VOICES_DIR, audioFileName);
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Reference audio file not found: ${audioPath}`);
  }

  const audioBuffer = fs.readFileSync(audioPath);
  const audioBase64 = audioBuffer.toString("base64");

  // Determine MIME type from extension (per DashScope docs)
  const ext = path.extname(audioFileName).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
  };
  const mimeType = mimeMap[ext] || "audio/wav";

  const body: Record<string, unknown> = {
    model: "qwen-voice-enrollment",
    input: {
      action: "create",
      target_model: TTS_MODEL,
      preferred_name: name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      audio: {
        data: `data:${mimeType};base64,${audioBase64}`,
      },
    },
  };

  // Optional: reference text and language improve cloning accuracy
  if (referenceText) {
    (body.input as Record<string, unknown>).text = referenceText;
    (body.input as Record<string, unknown>).language = "en";
  }

  const response = await fetch(
    `${DASHSCOPE_BASE_URL}/services/audio/tts/customization`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Voice enrollment failed (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as EnrollResponse;
  const voiceName = data.output.voice;

  // Cache the voice name
  setData(`${VOICE_ID_PREFIX}${name.toLowerCase()}`, voiceName);
  console.log(
    `*** TTS - Enrolled voice for "${name}" (voice: ${voiceName})`,
  );

  return voiceName;
};

// ── Synthesis ────────────────────────────────────────────────────────

interface SynthesisResponse {
  output: {
    audio: {
      url: string;
    };
  };
}

/**
 * Synthesizes speech using an enrolled voice.
 * Returns the audio as a Buffer.
 */
export const synthesizeSpeech = async (
  voiceName: string,
  text: string,
): Promise<Buffer> => {
  const apiKey = env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("DASHSCOPE_API_KEY is not set. Cannot synthesize speech.");
  }

  const body = {
    model: TTS_MODEL,
    input: {
      text,
      voice: voiceName,
    },
  };

  const response = await fetch(
    `${DASHSCOPE_BASE_URL}/services/aigc/multimodal-generation/generation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Speech synthesis failed (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as SynthesisResponse;

  // The API returns a URL to the audio file — download it
  const audioUrl = data.output?.audio?.url;
  if (audioUrl) {
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(
        `Failed to download synthesized audio (${audioResponse.status})`,
      );
    }
    const arrayBuffer = await audioResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Fallback: check if the response contains raw audio
  throw new Error("Unexpected synthesis response format — no audio URL found");
};

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Gets a cached voice name for a given profile name,
 * or returns null if not yet enrolled.
 */
export const getCachedVoiceId = (name: string): string | null => {
  return getData<string>(`${VOICE_ID_PREFIX}${name.toLowerCase()}`);
};
