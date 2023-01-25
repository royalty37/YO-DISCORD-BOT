import { SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import OpenAIService from "../../../apis/openaiService";
import { splitMessage } from "../../../utils/messageUtils/messageUtils";
import { subcommands } from "../openai";
import { Interaction } from "../../../types/types";

const INPUT_OPTION_NAME = "input";
const INPUT_REQUIRED = true;
const INSTRUCTION_OPTION_NAME = "instruction";

// openai edit subcommand - edits input using provided instruction
export const editSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.EDIT)
    .setDescription("Edit input using provided instruction (for instance, correct spelling mistakes).")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName(INPUT_OPTION_NAME)
        .setDescription("Input to edit using provided instructions")
        .setRequired(INPUT_REQUIRED)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName(INSTRUCTION_OPTION_NAME).setDescription("Instruction to edit input").setRequired(INPUT_REQUIRED)
    );

// openai edit subcommand execution
export const handleEditSubcommand = async (interaction: Interaction) => {
  try {
    await interaction.deferReply();

    // Get input and instruction from user
    const input = interaction.options.getString(INPUT_OPTION_NAME, INPUT_REQUIRED);
    const instruction = interaction.options.getString(INSTRUCTION_OPTION_NAME, INPUT_REQUIRED);

    // Call OpenAI API createEdit
    const res = await new OpenAIService().createEdit(input, instruction);

    // Log response
    console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

    // If response is valid, prepare to send
    if (res) {
      // Format response message to also show user input and instruction
      const reply = `**INPUT:**\n${input}\n\n**INSTRUCTION:**\n${instruction}\n\n**OPENAI RESPONSE:**\n\n${res}`;

      // Reply is sometimes > 2000 characters, so split into multiple messages
      for (const message of splitMessage(reply)) {
        await interaction.followUp(message);
      }
    } else {
      // If no res, send error message
      await interaction.editReply("Something went wrong. Please try again.");
    }
  } catch (e) {
    // If error, log error and send error message
    await interaction.editReply("Something went wrong. Please try again.");
    console.error("OPEN AI EDIT SUBCOMMAND EXECEPTION: " + e);
  }
};
