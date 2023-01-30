import {
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Interaction } from "../../../types/types";
import { updateLatestQueueMessage } from "../actions/queueActions";
import { subcommands } from "../music";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Play and Shorthand Play subcommands play song that is searched for
export const playSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.PLAY)
    .setDescription("Search for and play a song (or add to the end of the queue)!")
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
// skip used to skip the song that is currently playing
// top used to play the song at the top of the queue
export const handlePlaySubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
  skip = false,
  top = false
) => {
  try {
    const member = interaction.member as GuildMember;

    // Select either the member's voice channel or the bot's voice channel
    const voiceChannel = member.voice.channel ?? interaction.client.distube.voices.collection.first()?.channel;

    // If member is not in a voice channel and bot is not in a voice channel, return
    if (!voiceChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - MEMBER NOT IN VOICE CHANNEL AND BOT NOT IN VOICE CHANNEL");
      return void interaction.followUp("You must be in a voice channel or the bot must be!");
    }

    if (!interaction.channel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO TEXT CHANNEL");
      return void interaction.followUp("Something went wrong. Please try again.");
    }

    // Get song from song option
    const song = interaction.options.getString(SONG_OPTION_NAME, INPUT_REQUIRED);

    await interaction.reply(`🔍 | **Searching for ${song}...**`);
    const message = await interaction.fetchReply();

    // If using playskip, follow up with skip message
    if (skip) {
      await interaction.followUp(`⏭ | **Skipping current song to play new song...**`);
    }

    // If using playtop, follow up with top message
    if (top) {
      await interaction.followUp(`⏫ | **Adding new song to the top of the queue...**`);
    }

    // Play song
    await interaction.client.distube.play(voiceChannel, song, {
      textChannel: interaction.channel as GuildTextBasedChannel,
      member: interaction.member as GuildMember,
      message,
      skip,
      position: top ? 1 : undefined,
    });

    // If no guild id, return without updating queue message
    if (!interaction.guildId) {
      return console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO GUILD ID - CANNOT UPDATE QUEUE MESSAGE");
    }

    // Get queue
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    // If no queue, return without updating queue message
    if (!queue) {
      return console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO QUEUE - CANNOT UPDATE QUEUE MESSAGE");
    }

    // Update latest queue message upon play
    updateLatestQueueMessage(queue);
  } catch (e) {
    console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND -", e);
    await interaction.reply("Something went wrong. Please try again.");
  }
};
