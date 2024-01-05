// import OpenAIService from "../../../apis/openaiService";
// import { Subcommands } from "../openai";
// import { getUniqueRandomWords } from "../../../utils/wordUtils/wordUtils";
// import { splitMessage } from "../../../utils/messageUtils/messageUtils";

// import type {
//   ChatInputCommandInteraction,
//   SlashCommandIntegerOption,
//   SlashCommandSubcommandBuilder,
// } from "discord.js";
// import type { Interaction } from "../../../types/types";

// // Max number of random words to generate - setting it much higher will sometimes break request
// const MAX_WORDS = 20;

// const NO_OF_WORDS_OPTION_NAME = "no-of-words";

// // openai random-story subcommand - generates random story from randomly generated words
// // Takes in optional number representing number of random words/ideas to include in story
// export const randomStorySubcommand = (sc: SlashCommandSubcommandBuilder) =>
//   sc
//     .setName(Subcommands.RANDOM_STORY)
//     .setDescription(
//       "Generates a random story involving random words from a list of approx. 300k words",
//     )
//     .addIntegerOption((option: SlashCommandIntegerOption) =>
//       option
//         .setName(NO_OF_WORDS_OPTION_NAME)
//         .setDescription(
//           `Number of random words/ideas to include in story (up to ${MAX_WORDS})`,
//         )
//         .setMinValue(1)
//         .setMaxValue(MAX_WORDS),
//     );

// // openai random-story subcommand execution
// export const handleRandomStorySubcommand = async (
//   interaction: Interaction<ChatInputCommandInteraction>,
// ) => {
//   try {
//     await interaction.deferReply();

//     // Get number of words from user input
//     const noOfWords = interaction.options.getInteger(NO_OF_WORDS_OPTION_NAME);

//     // Get random words from randomWords util, fallback to 10 if noOfWords isn't supplied
//     const words = getUniqueRandomWords(noOfWords ?? 10);
//     const completionInput =
//       "Write a random story involving the following words: " + words.join(", ");
//     // Call OpenAI API createCompletion but build my own input
//     const res = await new OpenAIService().createCompletion(completionInput);

//     // Log response
//     console.log(`*** OPENAI RANDOM-STORY WORDS: ${words}`);
//     console.log(`*** OPENAI RES:${res}\n\nEND OF RES`);

//     // If response is valid, prepare to send response
//     if (res) {
//       // Create reply with input and suffix (if provided)
//       const reply = `**RANDOM WORDS:**\n${words.join(
//         ", ",
//       )}\n\n**INSTRUCTION**:\n${completionInput}\n\n**OPENAI RESPONSE:**${res}`;

//       // Reply is sometimes > 2000 characters, so split into multiple messages
//       for (const message of splitMessage(reply)) {
//         await interaction.followUp(message);
//       }
//     } else {
//       // If response is invalid (no res), send error message
//       await interaction.editReply("Something went wrong. Please try again.");
//       console.error("*** OPENAI RANDOM STORY - NO RESPONSE");
//     }
//   } catch (e) {
//     // If error, log error and send error message
//     await interaction.editReply("Something went wrong. Please try again.");
//     console.error("*** OPEN AI RANDOM STORY SUBCOMMAND EXECEPTION: " + e);
//   }
// };
