import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../types/Command";
import YoClient from "../../types/YoClient";
import { QueryType } from "discord-player";

const INPUT_REQUIRED = true;

const data = new SlashCommandBuilder()
  .setName("music")
  .setDescription("Play music!")
  .addStringOption((option) => option.setName("input").setDescription("Song to play!").setRequired(INPUT_REQUIRED));

const execute = async (interaction: ChatInputCommandInteraction) => {
  const client: YoClient = require("../..");

  await interaction.deferReply();

  const guild = client.guilds.cache.get(interaction.guildId ?? "");
  const channel = guild?.channels.cache.get(interaction.channelId ?? "");
  const input = interaction.options.getString("input", INPUT_REQUIRED);

  if (!guild || !channel) {
    return void interaction.followUp({ content: "There was an error while executing this command!" });
  }

  const searchResult = await client.player
    .search(input, {
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

const musicCommand: Command = {
  data,
  execute,
};

module.exports = musicCommand;
