import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
  SelectMenuComponentOptionData,
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

    // Select either the bot's voice channel or the member's voice channel
    const voiceChannel = interaction.client.distube.voices.collection.first()?.channel ?? member.voice.channel;

    // If member is not in a voice channel and bot is not in a voice channel, return
    if (!voiceChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - MEMBER NOT IN VOICE CHANNEL AND BOT NOT IN VOICE CHANNEL");
      return void interaction.reply({
        content: "❌ | You must be in a voice channel or the bot must be!",
        ephemeral: true,
      });
    }

    const textChannel = interaction.channel as GuildTextBasedChannel;

    // If no text channel, return
    if (!textChannel) {
      console.log("*** ERROR IN MUSIC PLAY SUBCOMMAND - NO TEXT CHANNEL");
      return void interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
    }

    // Get song from song option
    const song = interaction.options.getString(SONG_OPTION_NAME, INPUT_REQUIRED);

    await interaction.deferReply({ ephemeral: true });

    // Search for song - limit to 50 results
    const results = await interaction.client.distube.search(song, {
      limit: 50,
    });

    // Current page index
    let currentIndex = 0;

    // Create array of embed descriptions - 10 results per page
    const embedDescriptions: string[] = [];
    let currentEmbedDescription = "";
    results.forEach((result, index) => {
      const resultToAppend = `${index + 1}. **${result.name}**\nDuration: ${result.formattedDuration}\nUploaded by: ${
        result.uploader.name
      }\n\n`;
      if (index !== 0 && index % 10 === 0) {
        embedDescriptions.push(currentEmbedDescription);
        currentEmbedDescription = resultToAppend;
      } else {
        currentEmbedDescription += resultToAppend;
        if (index === results.length - 1) {
          embedDescriptions.push(currentEmbedDescription);
        }
      }
    });

    // Create array of results for the select menu corresponding to the embed descriptions
    const resultsForSelectMenu: Array<SelectMenuComponentOptionData[]> = [];
    let currentResultsForSelectMenu: SelectMenuComponentOptionData[] = [];
    results.forEach((result, index) => {
      let label = `${index + 1}. ${result.name}`;
      // SelectOptions cannot have more than 100 characters in the label
      // If label is longer than 100 characters, truncate it to 97 characters plus "..." (100 total)
      if (label.length > 100) {
        label = label.substring(0, 97) + "...";
      }

      const resultToAppend = {
        label,
        value: `${index}`,
        description: `${result.formattedDuration} - ${result.uploader.name}`,
      };
      if (index !== 0 && index % 10 === 0) {
        resultsForSelectMenu.push(currentResultsForSelectMenu);
        currentResultsForSelectMenu = [resultToAppend];
      } else {
        currentResultsForSelectMenu.push(resultToAppend);
        if (index === results.length - 1) {
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
            .addOptions(resultsForSelectMenu[currentIndex])
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

    // Listen for select collector end and send timeout message
    selectCollector.on("end", async () => {
      await interaction.editReply("❌ | You took too long to select a song.");
    });
  } catch (e) {
    console.log(`*** ERROR IN MUSIC SEARCH SUBCOMMAND - ${e}`);
    await interaction.editReply({ content: "Something went wrong. Please try again.", embeds: [], components: [] });
  }
};
