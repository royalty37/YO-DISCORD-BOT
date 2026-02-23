import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("environment", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		// Clear relevant env vars before each test
		delete process.env.DISCORD_TOKEN;
		delete process.env.CLIENT_ID;
		delete process.env.GUILD_ID;
		delete process.env.BOT_CHANNEL_ID;
		delete process.env.VICE_PLUS_ROLE_ID;
		delete process.env.BUMBOY_ROLE_ID;
		delete process.env.ADMIN_USER_ID;
		delete process.env.BANNED_WORDS;
		delete process.env.DEV;
	});

	afterEach(() => {
		// Restore original env
		process.env = { ...originalEnv };
	});

	it("env object has all expected keys", async () => {
		const { env } = await import("./environment");
		const expectedKeys = [
			"DISCORD_TOKEN",
			"CLIENT_ID",
			"GUILD_ID",
			"BOT_CHANNEL_ID",
			"VICE_PLUS_ROLE_ID",
			"BUMBOY_ROLE_ID",
			"ADMIN_USER_ID",
			"BANNED_WORDS",
			"DEV",
		];

		for (const key of expectedKeys) {
			expect(key in env).toBe(true);
		}
	});

	it("returns empty string for missing env vars", async () => {
		const { env } = await import("./environment");
		expect(env.DISCORD_TOKEN).toBe("");
		expect(env.CLIENT_ID).toBe("");
		expect(env.GUILD_ID).toBe("");
	});

	it("lazily reads from process.env at access time", async () => {
		const { env } = await import("./environment");

		// Initially empty
		expect(env.DISCORD_TOKEN).toBe("");

		// Set env var after import
		process.env.DISCORD_TOKEN = "test-token-123";
		expect(env.DISCORD_TOKEN).toBe("test-token-123");

		// Change it again
		process.env.DISCORD_TOKEN = "another-token";
		expect(env.DISCORD_TOKEN).toBe("another-token");
	});

	it("each key is enumerable", async () => {
		const { env } = await import("./environment");
		const keys = Object.keys(env);
		expect(keys).toContain("DISCORD_TOKEN");
		expect(keys).toContain("GUILD_ID");
		expect(keys).toContain("DEV");
	});
});
