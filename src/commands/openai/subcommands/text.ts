import { ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import OpenAIService from "../../../apis/openaiService";

const INPUT_REQUIRED = true;

export const textSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName("text")
    .setDescription("Responds to user input with generated text (the sky is the limit!)")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("input").setDescription("Input used to generate AI text response").setRequired(INPUT_REQUIRED)
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("suffix").setDescription("Suffix to add to the end of the generated text")
    );

export const handleTextSubcommand = async (interaction: ChatInputCommandInteraction) => {
  try {
    await interaction.deferReply();

    const input = interaction.options.getString("input", INPUT_REQUIRED);
    const suffix = interaction.options.getString("suffix") ?? undefined;

    const res = await new OpenAIService().createCompletion(input, suffix);

    console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

    if (res) {
      const reply = `**INPUT:**\n${input}\n\n${suffix ? `**SUFFIX:**\n${suffix}\n\n` : ""}**OPENAI RESPONSE:**${res}${
        suffix ? ` ${suffix}` : ""
      }`;

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