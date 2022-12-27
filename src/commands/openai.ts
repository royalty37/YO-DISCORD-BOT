import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import OpenAIService from "../apis/openaiService";
import Command from "../types/Command";

const INPUT_REQUIRED = true;

const textSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName("text")
    .setDescription("Responds to user input with generated text (the sky is the limit!)")
    .addStringOption((option) =>
      option.setName("input").setDescription("Input used to generate AI text response").setRequired(INPUT_REQUIRED)
    );

const data = new SlashCommandBuilder()
  .setName("openai")
  .setDescription("Various openAI subcommands.")
  .addSubcommand(textSubcommand);

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.options.getSubcommand() === "text") {
    try {
      await interaction.deferReply();

      const text = interaction.options.getString("input", INPUT_REQUIRED);
      const res = await new OpenAIService().createCompletion(text);

      console.log(`*** OPENAI RES:${res}\n\nEND OF RES ***`);

      if (res) {
        const reply = `**INPUT:**\n${text}\n\n**OPENAI RESPONSE:**${res}`;

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
  }
};

const infoCommand: Command = {
  data,
  execute,
};

module.exports = infoCommand;
