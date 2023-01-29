import {
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Interaction } from "../../../types/types";
import { subcommands } from "../music";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Play and Shorthand Play subcommands play song that is searched for
export const playSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.PLAY)
    .setDescription("Search for and play (or add to queue) a song!")
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
export const handlePlaySubcommand = async (interaction: Interaction<ChatInputCommandInteraction>, skip = false) => {
  try {
    const song = interaction.options.getString(SONG_OPTION_NAME, INPUT_REQUIRED);
    const member = interaction.member as GuildMember;

    await interaction.reply(`🔍 **Searching for ${song}...**`);
    const message = await interaction.fetchReply();

    // Select either the member's voice channel or the bot's voice channel
    const voiceChannel = member.voice.channel ?? interaction.client.distube.voices.collection.first()?.channel;

    if (!voiceChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - MEMBER NOT IN VOICE CHANNEL AND BOT NOT IN VOICE CHANNEL");
      return void interaction.followUp("You must be in a voice channel or the bot must be!");
    }

    if (!interaction.channel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO TEXT CHANNEL");
      return void interaction.followUp("Something went wrong. Please try again.");
    }

    interaction.client.distube.play(voiceChannel, song, {
      textChannel: interaction.channel as GuildTextBasedChannel,
      member: interaction.member as GuildMember,
      message,
      skip,
    });
  } catch (e) {
    console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND -", e);
    await interaction.reply("Something went wrong. Please try again.");
  }
};
