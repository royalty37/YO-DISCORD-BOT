import { ChatInputCommandInteraction, SlashCommandIntegerOption, SlashCommandSubcommandBuilder } from "discord.js";
import OpenAIService from "../../../apis/openaiService";
import { subcommands } from "../openai";
import randomWords from "../../../utils/randomWord";

// openai random-story subcommand - generates random story from randomly generated words
// Takes in optional number representing number of random words/ideas to include in story
export const randomStorySubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.RANDOM_STORY)
    .setDescription("Generates a random story involving random words from a list of approx. 300k words")
    .addIntegerOption((option: SlashCommandIntegerOption) =>
      option
        .setName("no-of-words")
        .setDescription("Number of random words/ideas to include in story (up to 20)")
        .setMinValue(1)
        .setMaxValue(20)
    );

// openai random-story subcommand execution
export const handleRandomStorySubcommand = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    // Get number of words from user input
    const noOfWords = interaction.options.getInteger("no-of-words");

    // Get random words from randomWords util
    const words = randomWords(noOfWords ?? undefined);
    const completionInput = "Write a random story involving the following words: " + words.join(", ");
    // Call OpenAI API createCompletion but build my own input
    const res = await new OpenAIService().createCompletion(completionInput);

    // Log response
    console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

    // If response is valid, prepare to send response
    if (res) {
      // Create reply with input and suffix (if provided)
      const reply = `**RANDOM WORDS:**\n${words.join(
        ", "
      )}\n\n**INSTRUCTION**:\n${completionInput}\n\n**OPENAI RESPONSE:**${res}`;

      // If reply is too long, send multiple messages
      if (reply.length > 2000) {
        for (let i = 0; i < reply.length; i += 2000) {
          const toSend = reply.substring(i, Math.min(reply.length, i + 2000));
          await interaction.followUp(toSend);
        }
      } else {
        // Else, send as is
        await interaction.editReply(reply);
      }
    } else {
      // If response is invalid (no res), send error message
      await interaction.editReply("Something went wrong. Please try again.");
    }
  } catch (e) {
    // If error, log error and send error message
    console.error("OPEN AI RANDOM STORY SUBCOMMAND EXECEPTION: " + e);
    await interaction.editReply("Something went wrong. Please try again.");
  }
};
