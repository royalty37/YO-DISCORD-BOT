import { QueryType } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import YoClient from "../../../types/YoClient";
import { subcommands } from "../music";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Play and Shorthand Play subcommands play song that is searched for
export const playSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.PLAY)
    .setDescription("Search for and play a song!")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName(SONG_OPTION_NAME).setDescription("Song to play!").setRequired(INPUT_REQUIRED)
    );

// Shorthand play is just play but called with /music p instead of /music play
export const shorthandPlaySubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.SHORTHAND_PLAY)
    .setDescription("Search for and play a song!")
    .addStringOption((option) =>
      option.setName(SONG_OPTION_NAME).setDescription("Song to play!").setRequired(INPUT_REQUIRED)
    );

// This is the function that handles the play subcommand
export const handlePlaySubcommand = async (interaction: ChatInputCommandInteraction) => {
  // Get client off of interaction
  const client: YoClient = interaction.client as YoClient;

  await interaction.deferReply();

  const guild = client.guilds.cache.get(interaction.guildId ?? "");
  const channel = guild?.channels.cache.get(interaction.channelId ?? "");
  const song = interaction.options.getString(SONG_OPTION_NAME, INPUT_REQUIRED);

  if (!guild || !channel) {
    return void interaction.followUp({ content: "There was an error while executing this command!" });
  }

  // Search for song and get search result
  const searchResult = await client.player
    .search(song, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    })
    .catch(() => {
      console.error("*** Exception in Play Subcommand - Player.search***");
    });

  if (!searchResult || !searchResult.tracks.length) {
    return void interaction.followUp("No results were found!");
  }

  // Create a queue for the guild if one doesn't exist
  const queue = client.player.createQueue(guild, {
    ytdlOptions: {
      filter: "audioonly",
      highWaterMark: 1 << 30,
      dlChunkSize: 0,
    },
    metadata: channel,
  });

  const member = guild.members.cache.get(interaction.user.id) ?? (await guild.members.fetch(interaction.user.id));

  if (!member.voice.channel) {
    return void interaction.followUp("You must be in a voice channel!");
  }

  if (!interaction.guildId) {
    return void interaction.followUp("There was an error while executing this command!");
  }

  // Connect to the voice channel and add the track to the queue
  // If exception is thrown, delete the queue and return
  try {
    if (!queue.connection) {
      await queue.connect(member.voice.channel);
    }
  } catch {
    client.player.deleteQueue(interaction.guildId);
    return void interaction.followUp("Could not join your voice channel!");
  }

  // Add track to queue and play if not already playing
  await interaction.followUp(`⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...`);
  searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);

  // If the queue is not playing, play it
  if (!queue.playing) {
    await queue.play();
  }

  // If the queue is paused, unpause it
  if (queue.setPaused(false)) {
    interaction.followUp("▶ | Queued song - Resumed!");
  }
};
