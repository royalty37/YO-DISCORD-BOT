import { EmbedBuilder, Colors } from "discord.js";
import OpenAIService from "../../../apis/openaiService";
import { Subcommands } from "../openai";

import type { Interaction } from "../../../types/types";
import type {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

const INPUT_OPTION_NAME = "input";
const INPUT_REQUIRED = true;

// openai create-image subcommand - generates an image using provided input
export const createImageSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.CREATE_IMAGE)
    .setDescription("Generate an image using provided input.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(INPUT_OPTION_NAME)
        .setDescription("Input used to generate image")
        .setRequired(INPUT_REQUIRED),
    );

// openai create-image subcommand execution
export const handleCreateImageSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  try {
    await interaction.deferReply();

    // Get input from user
    const input = interaction.options.getString(
      INPUT_OPTION_NAME,
      INPUT_REQUIRED,
    );

    // Call OpenAI API createImage
    const res = await new OpenAIService().createImage(input);

    // Log response
    console.log(`*** OPEN AI CREATE-IMAGE INPUT: ${input}`);
    console.log(`*** OPENAI RESPONSE:\n\n${res}\n\nEND OF RES`);

    // If response is valid, send embed with image
    if (res) {
      // Build embed with image
      const embed = new EmbedBuilder()
        .setTitle("OpenAI Image")
        .setColor(Colors.Red)
        .setImage(res)
        .setDescription("**INPUT:** " + input)
        .setThumbnail(interaction.user.avatarURL());

      // Send embed
      await interaction.editReply({ embeds: [embed] });
    } else {
      // If response is invalid, send error message
      await interaction.editReply("Something went wrong. Please try again.");
      console.error("*** OPEN AI CREATE-IMAGE SUBCOMMAND - NO RESPONSE");
    }
  } catch (e) {
    // If error, log error and send error message
    await interaction.editReply(
      "Something went wrong. Please try again.\n\nOpenAI potentially interpreted your input as NSFW.",
    );
    console.error("*** OPEN AI CREATE-IMAGE SUBCOMMAND EXECEPTION: " + e);
  }
};
