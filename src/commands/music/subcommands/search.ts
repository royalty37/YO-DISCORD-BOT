import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType,
} from "discord.js";
import { updateLatestQueueMessage } from "../actions/queueActions";
import { Subcommands } from "../music";

import type {
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SelectMenuComponentOptionData,
} from "discord.js";
import type { Interaction } from "../../../types/types";
import { useQueue } from "discord-player";

const INPUT_REQUIRED = true;
const SONG_OPTION_NAME = "song";

// Search subcommands play song that is searched for
export const searchSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.SEARCH)
    .setDescription(
      "Search for and allows selection of a song from a list of results!",
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(SONG_OPTION_NAME)
        .setDescription("Song to play!")
        .setRequired(INPUT_REQUIRED),
    );

// This is the function that handles the search subcommand
export const handleSearchSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    const member = interaction.member as GuildMember;

    // If member is not in a voice channel and bot is not in a voice channel, return
    if (!member.voice.channel) {
      console.log(
        "*** ERROR IN MUSIC PLAY SUBCOMMAND - MEMBER NOT IN VOICE CHANNEL AND BOT NOT IN VOICE CHANNEL",
      );
      return void interaction.editReply(
        "❌ | You must be in a voice channel or the bot must be!",
      );
    }

    const textChannel = interaction.channel as GuildTextBasedChannel;

    // If no text channel, return
    if (!textChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO TEXT CHANNEL");
      return void interaction.editReply(
        "Something went wrong. Please try again.",
      );
    }

    // Get song from song option
    const song = interaction.options.getString(
      SONG_OPTION_NAME,
      INPUT_REQUIRED,
    );

    // Search for song - limit to 50 results
    const results = await interaction.client.player.search(song);
    const tracks = results.tracks.slice(0, 50);

    // Current page index
    let currentIndex = 0;

    // Create array of embed descriptions - 10 results per page
    const embedDescriptions: string[] = [];
    // Create array of results for the select menu corresponding to the embed descriptions
    const resultsForSelectMenu: Array<SelectMenuComponentOptionData[]> = [];
    let currentResultsForSelectMenu: SelectMenuComponentOptionData[] = [];
    let currentEmbedDescription = "";

    tracks.forEach((track, index) => {
      const embedDescriptionResultToAppend = `${index + 1}. **${
        track.title
      }**\nDuration: ${track.duration}\nUploaded by: ${track.author}\n\n`;
      if (index !== 0 && index % 10 === 0) {
        embedDescriptions.push(currentEmbedDescription);
        currentEmbedDescription = embedDescriptionResultToAppend;
      } else {
        currentEmbedDescription += embedDescriptionResultToAppend;
        if (index === tracks.length - 1) {
          embedDescriptions.push(currentEmbedDescription);
        }
      }

      let label = `${index + 1}. ${track.title}`;
      // SelectOptions cannot have more than 100 characters in the label
      // If label is longer than 100 characters, truncate it to 97 characters plus "..." (100 total)
      if (label.length > 100) {
        label = label.substring(0, 97) + "...";
      }

      const selectMenuResultToAppend = {
        label,
        value: `${index}`,
        description: `${track.duration} - ${track.author}`,
      };
      if (index !== 0 && index % 10 === 0) {
        resultsForSelectMenu.push(currentResultsForSelectMenu);
        currentResultsForSelectMenu = [selectMenuResultToAppend];
      } else {
        currentResultsForSelectMenu.push(selectMenuResultToAppend);
        if (index === tracks.length - 1) {
          resultsForSelectMenu.push(currentResultsForSelectMenu);
        }
      }
    });

    // Function to generate reply object between button clicks
    const generateReplyObject = () => ({
      embeds: [
        new EmbedBuilder()
          .setColor("Random")
          .setTitle("🎶 | Select from options below:")
          .setDescription(embedDescriptions[currentIndex])
          .setFooter({
            text: `Search initiated by ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL() ?? undefined,
          }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId("queue-prev-page")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentIndex <= 0),
          new ButtonBuilder()
            .setCustomId("queue-next-page")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentIndex >= embedDescriptions.length - 1),
        ]),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("select-song")
            .setPlaceholder("Select a song")
            .addOptions(resultsForSelectMenu[currentIndex]),
        ),
      ],
    });

    // Send initial reply
    interaction.editReply(generateReplyObject());

    const message = await interaction.fetchReply();

    // Create button collector
    const buttonCollector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 1000 * 60 * 5, // 5 minutes to select a song
    });

    // Listen for button clicks and update reply object
    buttonCollector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "queue-prev-page") {
        console.log("*** MUSIC SEARCH SUBCOMMAND - PREV PAGE");
        currentIndex--;
      } else if (buttonInteraction.customId === "queue-next-page") {
        console.log("*** MUSIC SEARCH SUBCOMMAND - NEXT PAGE");
        currentIndex++;
      }

      await buttonInteraction.update(generateReplyObject());
    });

    // Create select collector
    const selectCollector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 1000 * 60 * 5, // 5 minutes to select a song
    });

    // Listen for selection and play song
    selectCollector.once("collect", async (selectInteraction) => {
      if (selectInteraction.customId === "select-song") {
        console.log("*** MUSIC SEARCH - SELECTED SONG");
        await interaction.client.player.play(
          member.voice.channel!,
          tracks[parseInt(selectInteraction.values[0])],
          {
            nodeOptions: {
              metadata: interaction,
            },
          },
        );

        await interaction.deleteReply();

        // If no guild id, return without updating queue message
        if (!interaction.guildId) {
          return console.log(
            "*** ERROR IN MUSIC PLAY SUBCOMMAND - NO GUILD ID - CANNOT UPDATE QUEUE MESSAGE",
          );
        }

        // Get queue
        const queue = useQueue(interaction.guildId);

        // If no queue, return without updating queue message
        if (!queue) {
          return console.log(
            "*** ERROR IN MUSIC PLAY SUBCOMMAND - NO QUEUE - CANNOT UPDATE QUEUE MESSAGE",
          );
        }

        // Update latest queue message upon play
        updateLatestQueueMessage(queue);
      }
    });

    // Listen for select collector end and send timeout message
    selectCollector.on("end", async () => {
      if (interaction.isRepliable()) {
        await interaction.editReply("❌ | You took too long to select a song.");
      }
    });
  } catch (e) {
    console.log(`*** ERROR IN MUSIC SEARCH SUBCOMMAND - ${e}`);
    await interaction.editReply({
      content: "Something went wrong. Please try again.",
      embeds: [],
      components: [],
    });
  }
};
