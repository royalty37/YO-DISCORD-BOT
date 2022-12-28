import { QueryType } from "discord-player";
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import YoClient from "../../../types/YoClient";
import { subcommands } from "../music";

const INPUT_REQUIRED = true;

export const playSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.PLAY)
    .setDescription("Search for and play a song!")
    .addStringOption((option) => option.setName("song").setDescription("Song to play!").setRequired(INPUT_REQUIRED));

export const shorthandPlaySubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.SHORTHAND_PLAY)
    .setDescription("Search for and play a song!")
    .addStringOption((option) => option.setName("song").setDescription("Song to play!").setRequired(INPUT_REQUIRED));

export const handlePlaySubcommand = async (interaction: ChatInputCommandInteraction) => {
  const client: YoClient = interaction.client as YoClient;

  await interaction.deferReply();

  const guild = client.guilds.cache.get(interaction.guildId ?? "");
  const channel = guild?.channels.cache.get(interaction.channelId ?? "");
  const song = interaction.options.getString("song", INPUT_REQUIRED);

  if (!guild || !channel) {
    return void interaction.followUp({ content: "There was an error while executing this command!" });
  }

  const searchResult = await client.player
    .search(song, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    })
    .catch(() => {});

  if (!searchResult || !searchResult.tracks.length) {
    return void interaction.followUp({ content: "No results were found!" });
  }

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
    return void interaction.followUp({ content: "You must be in a voice channel!" });
  }

  if (!interaction.guildId) {
    return void interaction.followUp({ content: "There was an error while executing this command!" });
  }

  try {
    if (!queue.connection) await queue.connect(member.voice.channel);
  } catch {
    void client.player.deleteQueue(interaction.guildId);
    return void interaction.followUp({ content: "Could not join your voice channel!" });
  }

  await interaction.followUp({ content: `⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...` });
  searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
  if (!queue.playing) {
    await queue.play();
  }
};
