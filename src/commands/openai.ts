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
      const reply = await new OpenAIService().createCompletion(text);

      console.log(`*** REPLY:${reply}\n\nEND OF REPLY ***`);

      await interaction.editReply(
        reply ? `**INPUT:**\n${text}\n\n**OPENAI RESPONSE:**${reply}` : "Something went wrong. Please try again."
      );
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
