import { updateLatestQueueMessage } from "../actions/queueActions";
import { Subcommands } from "../music";
import { useQueue } from "discord-player";

import type {
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Play and Shorthand Play subcommands play song that is searched for
export const playSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.PLAY)
    .setDescription(
      "Search for and play a song (or add to the end of the queue)!",
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(SONG_OPTION_NAME)
        .setDescription("Song to play!")
        .setRequired(INPUT_REQUIRED),
    );

// Shorthand play is just play but called with /music p instead of /music play
export const shorthandPlaySubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.SHORTHAND_PLAY)
    .setDescription("Search for and play a song!")
    .addStringOption((option) =>
      option
        .setName(SONG_OPTION_NAME)
        .setDescription("Song to play!")
        .setRequired(INPUT_REQUIRED),
    );

// This is the function that handles the play subcommand
// skip used to skip the song that is currently playing
// top used to play the song at the top of the queue
export const handlePlaySubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
  skip = false,
  top = false,
) => {
  try {
    const member = interaction.member as GuildMember;

    // Select member's voice channel
    // TODO: Try to get voice channel bot is in instead of member's voice channel
    const voiceChannel = member.voice.channel;

    // If no voice channel, early return
    if (!voiceChannel) {
      console.log(
        "*** ERROR IN MUSIC PLAY SUBCOMMAND - MEMBER NOT IN VOICE CHANNEL AND BOT NOT IN VOICE CHANNEL",
      );
      return void interaction.reply({
        content: "You must be in a voice channel or the bot must be!",
        ephemeral: true,
      });
    }

    const textChannel = interaction.channel as GuildTextBasedChannel;

    // If no text channel, return
    if (!textChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO TEXT CHANNEL");
      return void interaction.reply({
        content: "Something went wrong. Please try again.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Get song from song option
    const song = interaction.options.getString(
      SONG_OPTION_NAME,
      INPUT_REQUIRED,
    );

    await interaction.editReply(`🔍 | **Searching for ${song}...**`);

    // If no guild id, return without updating queue message
    if (!interaction.guildId) {
      return console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO GUILD ID");
    }

    const queue = useQueue(interaction.guildId);

    // If using playskip, follow up with skip message
    if (skip) {
      await interaction.followUp({
        content: `⏭ | **Skipping current song to play new song...**`,
        ephemeral: true,
      });

      if (!queue) {
        console.log(
          "*** ERROR IN MUSIC PLAY SUBCOMMAND - NO QUEUE - CANNOT SKIP",
        );
      } else {
        const searchResult = await interaction.client.player.search(song);
        queue.insertTrack(searchResult.tracks[0], 1);
        queue.node.skip();
      }
    }
    // If using playtop, follow up with top message
    else if (top) {
      await interaction.followUp({
        content: `⏫ | **Adding new song to the top of the queue...**`,
        ephemeral: true,
      });

      if (!queue) {
        console.log(
          "*** ERROR IN MUSIC PLAY SUBCOMMAND - NO QUEUE - CANNOT ADD TO TOP",
        );
      } else {
        const searchResult = await interaction.client.player.search(song);
        queue.insertTrack(searchResult.tracks[0], 1);
      }
    }
    // If not using playskip or playtop, just play normally
    else {
      await interaction.client.player.play(voiceChannel, song, {
        nodeOptions: {
          metadata: interaction,
        },
      });
    }

    // If no queue, return without updating queue message
    if (!queue) {
      return console.log(
        "*** ERROR IN MUSIC PLAY SUBCOMMAND - NO QUEUE - CANNOT UPDATE QUEUE MESSAGE",
      );
    }

    // Update latest queue message upon play
    updateLatestQueueMessage(queue);
  } catch (e) {
    console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND -", e);
    await interaction.editReply("Something went wrong. Please try again.");
  }
};
