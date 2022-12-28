import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import OpenAIService from "../../../apis/openaiService";
import { subcommands } from "../openai";

const INPUT_REQUIRED = true;

// openai text subcommand - generates text using provided input like ChatGPT
// Takes input and optional suffix
export const textSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.TEXT)
    .setDescription("Responds to user input with generated text (the sky is the limit!)")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("input").setDescription("Input used to generate AI text response").setRequired(INPUT_REQUIRED)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("suffix").setDescription("Suffix to add to the end of the generated text")
    );

// openai text subcommand execution
export const handleTextSubcommand = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    // Get input and suffix from user
    const input = interaction.options.getString("input", INPUT_REQUIRED);
    const suffix = interaction.options.getString("suffix") ?? undefined;

    // Call OpenAI API createCompletion
    const res = await new OpenAIService().createCompletion(input, suffix);

    // Log response
    console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

    // If response is valid, prepare to send response
    if (res) {
      // Create reply with input and suffix (if provided)
      const reply = `**INPUT:**\n${input}\n\n${suffix ? `**SUFFIX:**\n${suffix}\n\n` : ""}**OPENAI RESPONSE:**${res}${
        suffix ? ` ${suffix}` : ""
      }`;

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
    console.error("OPEN AI TEXT SUBCOMMAND EXECEPTION: " + e);
    await interaction.editReply("Something went wrong. Please try again.");
  }
};
