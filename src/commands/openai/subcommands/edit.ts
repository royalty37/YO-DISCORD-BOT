import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import OpenAIService from "../../../apis/openaiService";
import { subcommands } from "../openai";

const INPUT_REQUIRED = true;

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

export const handleEditSubcommand = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    const input = interaction.options.getString("input", INPUT_REQUIRED);
    const instruction = interaction.options.getString("instruction", INPUT_REQUIRED);

    const res = await new OpenAIService().createEdit(input, instruction);

    console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

    if (res) {
      const reply = `**INPUT:**\n${input}\n\n**INSTRUCTION:**\n${instruction}\n\n**OPENAI RESPONSE:**\n\n${res}`;

      if (reply.length > 2000) {
        for (let i = 0; i < reply.length; i += 2000) {
          const toSend = reply.substring(i, Math.min(reply.length, i + 2000));

          if (i === 0) {
            await interaction.editReply(toSend);
          } else {
            await interaction.followUp(toSend);
          }
        }
      } else {
        await interaction.editReply(reply);
      }
    } else {
      await interaction.editReply("Something went wrong. Please try again.");
    }
  } catch (e) {
    console.error("OPEN AI COMMAND EXECEPTION: " + e);
    await interaction.editReply("Something went wrong. Please try again.");
  }
};
