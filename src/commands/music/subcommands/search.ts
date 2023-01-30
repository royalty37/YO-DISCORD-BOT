import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { Interaction } from "../../../types/types";
import { updateLatestQueueMessage } from "../actions/queueActions";
import { subcommands } from "../music";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Search subcommands play song that is searched for
export const searchSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.SEARCH)
    .setDescription("Search for and allows selection of a song from a list of results!")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName(SONG_OPTION_NAME).setDescription("Song to play!").setRequired(INPUT_REQUIRED)
    );

// This is the function that handles the search subcommand
export const handleSearchSubcommand = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  try {
    const member = interaction.member as GuildMember;

    // Select either the member's voice channel or the bot's voice channel
    const voiceChannel = member.voice.channel ?? interaction.client.distube.voices.collection.first()?.channel;

    // If member is not in a voice channel and bot is not in a voice channel, return
    if (!voiceChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - MEMBER NOT IN VOICE CHANNEL AND BOT NOT IN VOICE CHANNEL");
      return void interaction.followUp("You must be in a voice channel or the bot must be!");
    }

    const textChannel = interaction.channel as GuildTextBasedChannel;

    if (!textChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO TEXT CHANNEL");
      return void interaction.followUp("Something went wrong. Please try again.");
    }

    // Get song from song option
    const song = interaction.options.getString(SONG_OPTION_NAME, INPUT_REQUIRED);

    await interaction.deferReply({ ephemeral: true });

    const results = await interaction.client.distube.search(song, {
      limit: 10,
    });

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("Random")
          .setTitle("🎶 | Select from options below:")
          .setDescription(
            results
              .map(
                (r, index) =>
                  `${index + 1}. **${r.name}**\nDuration: ${r.formattedDuration}\nUploaded by: ${r.uploader.name}`
              )
              .join("\n\n")
          )
          .setFooter({
            text: `Search initiated by ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL() ?? undefined,
          }),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select-song")
            .setPlaceholder("Select a song")
            .addOptions(
              results.map((r, index) => ({
                label: `${r.name}`,
                value: `${index}`,
                description: `${r.formattedDuration} - ${r.uploader.name}`,
              }))
            )
        ),
      ],
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 1000 * 60 * 2, // 2 minutes to select a song
    });

    collector.once("collect", async (selectInteraction) => {
      if (selectInteraction.customId === "select-song") {
        console.log("*** MUSIC SEARCH - SELECTED SONG");
        await interaction.client.distube.play(voiceChannel, results[parseInt(selectInteraction.values[0])], {
          textChannel,
          member,
          message,
        });

        await interaction.deleteReply();

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
      }
    });
  } catch (e) {
    console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND -", e);
    await interaction.reply("Something went wrong. Please try again.");
  }
};
