// import { EmbedBuilder } from "discord.js";
// import { Subcommands } from "../openai";

// import type {
//   ChatInputCommandInteraction,
//   SlashCommandSubcommandBuilder,
// } from "discord.js";
// import type { Interaction } from "../../../types/types";

// const HELP_EMBED_DESCRIPTION =
//   "**OpenAI Subcommands**\n\n" +
//   "**1. text <input>** - Send a query for OpenAI to interpret. Cam be literally anything... Ask it to write a story, ask it for instructions, recipes, or just general conversation.\n\n" +
//   "**2. createimage <input>** - Send a query for OpenAI to interpret and generate an image from.\n\n" +
//   "**3. edit <input> <instruction>** - Send OpenAI a body of text and instructions for what it needs to do with it.\n\n" +
//   "**4. randomstory <no-of-words>** - Sends OpenAI a random set of words and instructs it to generate a story from that set of words.\n\n";

// // Openai help subcommand
// export const helpSubcommand = (sc: SlashCommandSubcommandBuilder) =>
//   sc
//     .setName(Subcommands.HELP)
//     .setDescription("Shows subcommands and descriptions of /openai command.");

// // Openai help subcommand execution
// export const handleHelpSubcommand = async (
//   interaction: Interaction<ChatInputCommandInteraction>,
// ) => {
//   // Send help message
//   await interaction.reply({
//     embeds: [
//       new EmbedBuilder()
//         .setColor("Random")
//         .setTitle("ℹ️ | OpenAI Help")
//         .setDescription(HELP_EMBED_DESCRIPTION)
//         .setFooter({ text: "Page 1 of 1" }),
//     ],
//     ephemeral: true,
//   });
// };
