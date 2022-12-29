import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  EmbedBuilder,
  Colors,
} from "discord.js";
import Command from "../../types/Command";

const EMOJI_NUMBERS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

const QUESTION_REQUIRED = true;
const NO_OF_OPTIONS = 10;
const QUESTION_OPTION_NAME = "question";
const OPTION_NAME_PREFIX = "option";

// Poll command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Create a poll with up to 10 options!")
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName(QUESTION_OPTION_NAME)
      .setDescription("Question to ask on poll. Must have AT LEAST 2 options.")
      .setRequired(QUESTION_REQUIRED)
  );

// Add options to poll command
for (let i = 1; i <= NO_OF_OPTIONS; i++) {
  data.addStringOption((option: SlashCommandStringOption) =>
    option
      .setName(OPTION_NAME_PREFIX + i)
      .setDescription(`Option ${i} for poll`)
      .setRequired(i <= 2)
  );
}

// Poll command execute function
const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const question = interaction.options.getString(QUESTION_OPTION_NAME, QUESTION_REQUIRED);
  const options: string[] = [];

  for (let i = 1; i <= NO_OF_OPTIONS; i++) {
    const option = interaction.options.getString(OPTION_NAME_PREFIX + i);
    if (option) {
      options.push(option);
    }
  }

  const pollEmbedDescription = options.map((o, i) => EMOJI_NUMBERS[i] + " - " + o).join("\n");

  const pollEmbed = new EmbedBuilder()
    .setTitle(question)
    .setDescription(options.join("\n"))
    .setColor(Colors.Red)
    .setThumbnail(interaction.user.avatarURL())
    .setFooter({
      text: `Poll created by ${interaction.user.username}`,
    });

  await interaction.editReply({ embeds: [pollEmbed] });
};

const pollCommand: Command = {
  data,
  execute,
};

module.exports = pollCommand;
