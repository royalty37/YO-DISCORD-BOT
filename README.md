<p align="center">
  <img src="https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="discord.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Docker-Alpine-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<h1 align="center">🤖 YO Discord Bot</h1>

<p align="center">
  <strong>A feature-packed Discord bot built for the YOZA crew.</strong><br/>
  Music playback · voting polls · the legendary Bumboy system · auto-moderation — all in one bot.
</p>

---

## ✨ Features at a Glance

| Feature                  | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| 🎵 **Music Player**       | Full-featured music player with YouTube, Spotify & SoundCloud support       |
| 💩 **Bumboy System**      | The iconic YOZA demotion poll — vote someone into Bumboy for 24 hours       |
| 📊 **Polls**              | Create interactive polls with up to 10 options, timed expiry & live results |
| 🛡️ **Auto-Moderation**    | Automatically filters Discord invite links and configurable banned words    |
| 📋 **Server Info**        | Quick-access server and user information commands                           |
| 🧹 **Channel Management** | Bulk-delete messages from a channel                                         |
| 🐳 **Dockerised**         | Production-ready Docker image with automated CI/CD                          |

---

## 🎵 Music Commands

The music system is powered by [discord-player](https://github.com/Androz2091/discord-player) with YouTube (via `youtubei.js`) and Spotify/SoundCloud extractors.

| Command                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `/music play <query>`      | Play a song by name or URL                       |
| `/music p <query>`         | Shorthand for play                               |
| `/music pause`             | Pause the current track                          |
| `/music resume`            | Resume playback                                  |
| `/music skip`              | Skip to the next track                           |
| `/music previous`          | Play the previous track                          |
| `/music stop`              | Stop playback and clear the queue                |
| `/music queue`             | View the current queue                           |
| `/music nowplaying`        | Show what's currently playing                    |
| `/music shuffle`           | Shuffle the queue                                |
| `/music repeat <mode>`     | Set repeat mode (Off / Track / Queue / Autoplay) |
| `/music seek <time>`       | Seek to a position in the current track          |
| `/music skipto <position>` | Skip to a specific track in the queue            |
| `/music search <query>`    | Search and select from results                   |
| `/music lyrics`            | Fetch lyrics for the current track               |
| `/music playskip <query>`  | Play a song and skip the current one             |
| `/music playtop <query>`   | Add a song to the top of the queue               |
| `/music join`              | Join your voice channel                          |
| `/music leave`             | Leave the voice channel                          |
| `/music help`              | Show all music commands                          |

---

## 💩 Bumboy System

The crown jewel of YOZA. A democratic demotion system where Vice Plus members vote on who becomes the **Bumboy** for the day.

| Command         | Description                                               |
| --------------- | --------------------------------------------------------- |
| `/bumboy poll`  | Start a Bumboy vote (1-hour poll, Vice Plus members only) |
| `/bumboy clear` | Force-clear the current Bumboy (admin only)               |

**How it works:**
1. A Vice Plus member starts the poll with `/bumboy poll`
2. All Vice Plus members appear as vote options (up to 25)
3. Members cast a single vote over the 1-hour duration
4. The loser gets demoted to the **Bumboy** role, their nickname changed to 💩 THE BUMBOY 💩
5. After 12 hours, a scheduled job automatically restores their role and nickname
6. The poll can only run once every 12 hours

---

## 📊 Polls

Create custom interactive polls for any occasion.

| Command | Description                                                                |
| ------- | -------------------------------------------------------------------------- |
| `/poll` | Create a poll with 2–10 options, configurable duration & multi-vote toggle |

**Features:**
- Up to **10 options** with emoji-numbered buttons
- **Single or multi-vote** mode
- **Live results** — sorted by votes with percentage bars
- **Timed** — countdown shown in the footer, auto-ends when time is up
- **Winner announcement** with crown emoji on completion

---

## 🛡️ Auto-Moderation

Runs automatically on every message — no commands needed.

- **Invite Filter** — Deletes messages containing Discord invite links
- **Banned Words** — Deletes messages containing any word from a configurable banned word list (uses word-boundary matching to avoid false positives)

---

## 📋 Other Commands

| Command          | Description                                 |
| ---------------- | ------------------------------------------- |
| `/info server`   | Display server information                  |
| `/info user`     | Display your user information               |
| `/channel clean` | Bulk-delete messages in the current channel |
| `/ping`          | Check if the bot is alive                   |
| `/input <text>`  | Echo back your input                        |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v22+**
- A [Discord Bot Token](https://discord.com/developers/applications)
- npm (comes with Node.js)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/YO-DISCORD-BOT.git
cd YO-DISCORD-BOT
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable            | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `DISCORD_TOKEN`     | Bot token from the Discord Developer Portal                |
| `CLIENT_ID`         | Application / Client ID                                    |
| `GUILD_ID`          | Server ID the bot operates in                              |
| `BOT_CHANNEL_ID`    | Channel ID for automated bot messages                      |
| `VICE_PLUS_ROLE_ID` | Role ID for the "Vice Plus" members                        |
| `BUMBOY_ROLE_ID`    | Role ID for the BUMBOY demotion role                       |
| `ADMIN_USER_ID`     | User ID with admin privileges (force-clear bumboys)        |
| `BANNED_WORDS`      | JSON array of banned words, e.g. `["word1", "word2"]`      |
| `DEV`               | Set to `true` to enable dev mode (disables scheduled jobs) |

### 3. Deploy Slash Commands

Register your bot's slash commands with Discord:

```bash
npm run deploy-commands
```

### 4. Run

**Development** (with hot-reload via Nodemon):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

---

## 🐳 Docker

The bot ships with a multi-stage `Dockerfile` using **Node.js 22 Alpine** for minimal image size and zero CVEs.

### Build & Run Locally

```bash
docker build -t yo-discord-bot .
docker run -d --name yo-discord-bot \
  --restart unless-stopped \
  -e DISCORD_TOKEN=your_token \
  -e CLIENT_ID=your_client_id \
  -e GUILD_ID=your_guild_id \
  -e BOT_CHANNEL_ID=your_channel_id \
  -e VICE_PLUS_ROLE_ID=your_role_id \
  -e BUMBOY_ROLE_ID=your_role_id \
  -e ADMIN_USER_ID=your_user_id \
  -v ./data:/app/data \
  yo-discord-bot
```

### CI/CD Pipeline

A GitHub Actions workflow automatically builds and pushes the Docker image to **Docker Hub** on every push to `main`.

```
Push to main → GitHub Actions → Docker Hub → Watchtower → Unraid auto-update
```

Use [Watchtower](https://containrrr.dev/watchtower/) on your server for automatic container updates.

---

## 🧪 Testing

Tests are written with [Vitest](https://vitest.dev/).

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch
```

---

## 📁 Project Structure

```
src/
├── commands/
│   ├── bumboy/          # Bumboy poll & clear system
│   ├── channel/         # Channel management (clean)
│   ├── echo/            # Echo command
│   ├── info/            # Server & user info
│   ├── music/           # Full music player (19 subcommands)
│   ├── ping/            # Ping / pong
│   └── poll/            # Custom polls
├── events/
│   ├── clientEvents.ts  # Interaction handling, message filtering
│   ├── playerEvents.ts  # Music player event listeners
│   └── processEvents.ts # Process error handling
├── utils/
│   ├── discordUtils/    # Discord API helpers
│   ├── emojiUtils/      # Emoji formatting
│   ├── messageUtils/    # Message splitting, filtering, embeds
│   └── wordUtils/       # Word manipulation
├── environment.ts       # Typed, lazy env variable access
├── config.ts            # Dev mode flag
├── fileStore.ts         # JSON file persistence (bumboy state)
├── scheduleJobs.ts      # Scheduled job registration
└── index.ts             # Bot entry point
```

---

## 🛠️ Tech Stack

- **Runtime** — [Node.js 22](https://nodejs.org/)
- **Language** — [TypeScript 5.9](https://www.typescriptlang.org/)
- **Discord Library** — [discord.js v14](https://discord.js.org/)
- **Music** — [discord-player](https://github.com/Androz2091/discord-player) + [youtubei.js](https://github.com/LuanRT/YouTube.js)
- **Scheduling** — [node-schedule](https://github.com/node-schedule/node-schedule)
- **Testing** — [Vitest](https://vitest.dev/)
- **Containerisation** — [Docker](https://www.docker.com/) (Alpine)
- **CI/CD** — [GitHub Actions](https://github.com/features/actions)

---

<p align="center">
  Made with ❤️ for the YOZA boys
</p>
