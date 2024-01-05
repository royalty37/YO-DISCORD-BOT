// import OpenAIService from "../../../apis/openaiService";
// import { Subcommands } from "../openai";
// import { splitMessage } from "../../../utils/messageUtils/messageUtils";

// import type {
//   ChatInputCommandInteraction,
//   SlashCommandStringOption,
//   SlashCommandSubcommandBuilder,
// } from "discord.js";
// import type { Interaction } from "../../../types/types";

// const INPUT_OPTION_NAME = "input";
// const INPUT_REQUIRED = true;
// const SUFFIX_OPTION_NAME = "suffix";

// // openai text subcommand - generates text using provided input like ChatGPT
// // Takes input and optional suffix
// export const textSubcommand = (sc: SlashCommandSubcommandBuilder) =>
//   sc
//     .setName(Subcommands.TEXT)
//     .setDescription(
//       "Responds to user input with generated text (the sky is the limit!)",
//     )
//     .addStringOption((option: SlashCommandStringOption) =>
//       option
//         .setName(INPUT_OPTION_NAME)
//         .setDescription("Input used to generate AI text response")
//         .setRequired(INPUT_REQUIRED),
//     )
//     .addStringOption((option: SlashCommandStringOption) =>
//       option
//         .setName(SUFFIX_OPTION_NAME)
//         .setDescription("Suffix to add to the end of the generated text"),
//     );

// // openai text subcommand execution
// export const handleTextSubcommand = async (
//   interaction: Interaction<ChatInputCommandInteraction>,
// ) => {
//   try {
//     await interaction.deferReply();

//     // Get input and suffix from user
//     const input = interaction.options.getString(
//       INPUT_OPTION_NAME,
//       INPUT_REQUIRED,
//     );
//     const suffix = interaction.options.getString(SUFFIX_OPTION_NAME);

//     // Call OpenAI API createCompletion
//     const res = await new OpenAIService().createCompletion(
//       input,
//       suffix ?? undefined,
//     );

//     // Log response
//     console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

//     // If response is valid, prepare to send response
//     if (res) {
//       // Create reply with input and suffix (if provided)
//       const reply = `**INPUT:**\n${input}\n\n${
//         suffix ? `**SUFFIX:**\n${suffix}\n\n` : ""
//       }**OPENAI RESPONSE:**${res}${suffix ? ` ${suffix}` : ""}`;

//       // Reply is sometimes > 2000 characters, so split into multiple messages
//       for (const message of splitMessage(reply)) {
//         await interaction.followUp(message);
//       }
//     } else {
//       // If response is invalid (no res), send error message
//       await interaction.editReply("Something went wrong. Please try again.");
//       console.error("OPEN AI TEXT SUBCOMMAND - NO RESPONSE");
//     }
//   } catch (e) {
//     // If error, log error and send error message
//     await interaction.editReply("Something went wrong. Please try again.");
//     console.error("*** OPEN AI TEXT SUBCOMMAND EXECEPTION: " + e);
//   }
// };
