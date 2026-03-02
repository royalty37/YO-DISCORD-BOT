import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the fileStore module
vi.mock("../fileStore", () => ({
  getData: vi.fn(),
  setData: vi.fn(),
}));

// Mock fs module
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

import fs from "fs";
import { getData, setData } from "../fileStore";
import { enrollVoice, synthesizeSpeech, getCachedVoiceId } from "./ttsService";

describe("ttsService", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Set a test API key — env.ts reads process.env lazily
    process.env.DASHSCOPE_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("enrollVoice", () => {
    it("throws if DASHSCOPE_API_KEY is not set", async () => {
      delete process.env.DASHSCOPE_API_KEY;

      await expect(enrollVoice("Test", "test.wav")).rejects.toThrow(
        "DASHSCOPE_API_KEY is not set",
      );
    });

    it("throws if reference audio file does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(enrollVoice("Test", "missing.wav")).rejects.toThrow(
        "Reference audio file not found",
      );
    });

    it("sends correct enrollment request and caches voice name", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fake-audio"));

      const mockResponse = {
        ok: true,
        json: async () => ({
          output: { voice: "qwen-tts-vc-liam-voice-20250812" },
        }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      const voiceName = await enrollVoice("Liam", "liam.wav", "Hello there");

      expect(voiceName).toBe("qwen-tts-vc-liam-voice-20250812");
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Verify the URL is the correct customization endpoint
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[0]).toContain("/services/audio/tts/customization");

      // Verify the body has the correct format
      const body = JSON.parse((fetchCall[1] as RequestInit).body as string);
      expect(body.model).toBe("qwen-voice-enrollment");
      expect(body.input.action).toBe("create");
      expect(body.input.audio.data).toContain("data:audio/wav;base64,");
      expect(body.input.preferred_name).toBe("liam");

      expect(setData).toHaveBeenCalledWith(
        "tts_voice_id_liam",
        "qwen-tts-vc-liam-voice-20250812",
      );
    });

    it("throws on non-ok response", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from("fake-audio"));

      const mockResponse = {
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      await expect(enrollVoice("Test", "test.wav")).rejects.toThrow(
        "Voice enrollment failed (401)",
      );
    });
  });

  describe("synthesizeSpeech", () => {
    it("downloads audio from returned URL", async () => {
      const fakeAudio = new Uint8Array([1, 2, 3, 4]);

      // First call: synthesis API returns audio URL
      const synthResponse = {
        ok: true,
        json: async () => ({
          output: { audio: { url: "https://example.com/audio.mp3" } },
        }),
      };
      // Second call: downloading the audio
      const audioResponse = {
        ok: true,
        arrayBuffer: async () => fakeAudio.buffer,
      };

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(synthResponse as Response)
        .mockResolvedValueOnce(audioResponse as Response);

      const result = await synthesizeSpeech("voice-name", "Hello world");

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(4);

      // Verify correct synthesis endpoint
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[0]).toContain(
        "/services/aigc/multimodal-generation/generation",
      );

      // Verify correct body format
      const body = JSON.parse((fetchCall[1] as RequestInit).body as string);
      expect(body.input.text).toBe("Hello world");
      expect(body.input.voice).toBe("voice-name");
    });

    it("throws on non-ok synthesis response", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      await expect(
        synthesizeSpeech("voice-name", "Hello world"),
      ).rejects.toThrow("Speech synthesis failed (500)");
    });
  });

  describe("getCachedVoiceId", () => {
    it("returns cached voice name when present", () => {
      vi.mocked(getData).mockReturnValue("cached-voice-name");

      const result = getCachedVoiceId("Liam");
      expect(result).toBe("cached-voice-name");
      expect(getData).toHaveBeenCalledWith("tts_voice_id_liam");
    });

    it("returns null when not enrolled", () => {
      vi.mocked(getData).mockReturnValue(null);

      const result = getCachedVoiceId("Unknown");
      expect(result).toBeNull();
    });
  });
});
