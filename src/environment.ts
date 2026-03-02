/**
 * Centralised, typed access to environment variables.
 *
 * Values are read lazily (via getters) so that `dotenv.config()` has
 * already run by the time any value is accessed — regardless of
 * static-import ordering.
 */

interface Environment {
  /** Discord bot token */
  DISCORD_TOKEN: string;
  /** Discord application / client ID */
  CLIENT_ID: string;
  /** Guild (server) ID the bot operates in */
  GUILD_ID: string;
  /** Text-channel ID for automated bot messages */
  BOT_CHANNEL_ID: string;
  /** "Vice Plus" role ID */
  VICE_PLUS_ROLE_ID: string;
  /** "Bumboy" demotion role ID */
  BUMBOY_ROLE_ID: string;
  /** Admin / president user ID */
  ADMIN_USER_ID: string;
  /** JSON array of banned words (optional) */
  BANNED_WORDS: string;
  /** Set to any truthy value to enable dev mode */
  IS_DEV: string;
  /** DashScope API key for Qwen3-TTS voice cloning */
  DASHSCOPE_API_KEY: string;
}

function lazy(key: keyof Environment): string {
  return process.env[key] ?? "";
}

/**
 * Use `env.SOME_KEY` anywhere in the codebase.
 *
 * Every property is a **getter** so the underlying `process.env` value
 * is read at call-time, not at import-time.
 */
export const env: Environment = Object.defineProperties(
  {} as Environment,
  Object.fromEntries(
    (
      [
        "DISCORD_TOKEN",
        "CLIENT_ID",
        "GUILD_ID",
        "BOT_CHANNEL_ID",
        "VICE_PLUS_ROLE_ID",
        "BUMBOY_ROLE_ID",
        "ADMIN_USER_ID",
        "BANNED_WORDS",
        "IS_DEV",
        "DASHSCOPE_API_KEY",
      ] as const
    ).map((key) => [key, { get: () => lazy(key), enumerable: true }]),
  ),
);
