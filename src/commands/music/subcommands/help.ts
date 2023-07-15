import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Subcommands } from "../music";
import { Interaction } from "../../../types/types";

const HELP_EMBED_DESCRIPTIONS = [
  "**Music Subcommands**\n\n" +
    "**1. play <song>** - Plays a song from YouTube or adds it to the end of the queue.\n\n" +
    '**2. p <song>** - Same as "play" subcommand.\n\n' +
    "**3. playskip <song>** - Plays a song from YouTube and skips the current song.\n\n" +
    "**4. playtop <song>** - Plays a song from YouTube and adds it to the top of the queue.\n\n" +
    "**5. search <song>** - Searches for a song, shows a list of 50 results and allows one to be selected and added to the queue.\n\n" +
    "**6. pause** - Pauses the current song/queue.\n\n" +
    "**7. resume** - Resumes the current song/queue.\n\n" +
    "**8. join <channel> (optional)** - Joins the supplied voice channel otherwise joins the voice channel you are in.\n\n" +
    "**9. leave** - Leaves the voice channel.\n\n" +
    "**10. skip** - Skips the current song.\n\n",
  "**Music Subcommands**\n\n" +
    "**11. skipto <position>** - Skips to the specified position in the queue.\n\n" +
    "**12. stop** - Stops the current song/queue.\n\n" +
    "**13. previous** - Plays the previous song in the queue.\n\n" +
    "**14. queue** - Shows the current queue.\n\n" +
    "**15. nowplaying** - Shows the current song.\n\n" +
    "**16. shuffle** - Shuffles the current queue.\n\n" +
    "**17. repeat <mode> (Disabled/Track/Queue)** - Sets the repeat mode.\n\n" +
    "**18. seek <minutes> <seconds>** - Seeks to the specified time in the current song.\n\n" +
    "**19. lyrics <song>** - Prints the lyrics searched for or the song currently playing.\n\n",
];

// Music help subcommand
export const helpSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.HELP)
    .setDescription("Shows subcommands and descriptions of /music command.");

// Music help subcommand execution
export const handleHelpSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  await interaction.deferReply({ ephemeral: true });

  // Page index
  let currentIndex = 0;

  // Create initial help reply
  const generateReplyObject = () => ({
    embeds: [
      new EmbedBuilder()
        .setColor("Random")
        .setTitle("ℹ️ | Music Help")
        .setDescription(HELP_EMBED_DESCRIPTIONS[currentIndex])
        .setFooter({
          text: `Page ${currentIndex + 1} of ${HELP_EMBED_DESCRIPTIONS.length}`,
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
          .setDisabled(currentIndex >= HELP_EMBED_DESCRIPTIONS.length - 1),
      ]),
    ],
  });

  // Send help message
  await interaction.editReply(generateReplyObject());

  // Fetch message to add button collector
  const message = await interaction.fetchReply();

  // Create button collector
  const buttonCollector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 1000 * 60 * 5, // 10 minutes to interact with help message
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

    // Listen for button collector end and delete reply
    buttonCollector.on("end", async () => {
      await interaction.deleteReply();
    });
  });
};
