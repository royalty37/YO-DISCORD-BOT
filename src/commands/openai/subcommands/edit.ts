import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import OpenAIService from "../../../apis/openaiService";
import { splitMessage } from "../../../utils/messageUtils";
import { subcommands } from "../openai";

const INPUT_REQUIRED = true;

// openai edit subcommand - edits input using provided instruction
export const editSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(subcommands.EDIT)
    .setDescription("Edit input using provided instruction (for instance, correct spelling mistakes).")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("input").setDescription("Input to edit using provided instructions").setRequired(INPUT_REQUIRED)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("instruction").setDescription("Instruction to edit input").setRequired(INPUT_REQUIRED)
    );

// openai edit subcommand execution
export const handleEditSubcommand = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    // Get input and instruction from user
    const input = interaction.options.getString("input", INPUT_REQUIRED);
    const instruction = interaction.options.getString("instruction", INPUT_REQUIRED);

    // Call OpenAI API createEdit
    const res = await new OpenAIService().createEdit(input, instruction);

    // Log response
    console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

    // If response is valid, prepare to send
    if (res) {
      // Format response message to also show user input and instruction
      const reply = `**INPUT:**\n${input}\n\n**INSTRUCTION:**\n${instruction}\n\n**OPENAI RESPONSE:**\n\n${res}`;

      // Reply is sometimes > 2000 characters, so split into multiple messages
      splitMessage(reply).forEach(async (message) => {
        await interaction.followUp(message);
      });
    } else {
      // If no res, send error message
      await interaction.editReply("Something went wrong. Please try again.");
    }
  } catch (e) {
    // If error, log error and send error message
    console.error("OPEN AI EDIT SUBCOMMAND EXECEPTION: " + e);
    await interaction.editReply("Something went wrong. Please try again.");
  }
};
