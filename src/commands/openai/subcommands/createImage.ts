import {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  Colors,
} from "discord.js";
import OpenAIService from "../../../apis/openaiService";

const INPUT_REQUIRED = true;

export const createImageSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName("create-image")
    .setDescription("Generate an image using provided input.")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("input").setDescription("Input used to generate image").setRequired(INPUT_REQUIRED)
    );

export const handleCreateImageSubcommand = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    const input = interaction.options.getString("input", INPUT_REQUIRED);

    const res = await new OpenAIService().createImage(input);

    console.log(`*** OPENAI RES:\n\n${res}\n\nEND OF RES ***`);

    if (res) {
      const embed = new EmbedBuilder()
        .setTitle("OpenAI Image")
        .setColor(Colors.Red)
        .setImage(res)
        .setDescription("**INPUT:** " + input)
        .setThumbnail(interaction.user.avatarURL());

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply("Something went wrong. Please try again.");
    }
  } catch (e) {
    console.error("OPEN AI COMMAND EXECEPTION: " + e);
    await interaction.editReply("Something went wrong. Please try again.");
  }
};
