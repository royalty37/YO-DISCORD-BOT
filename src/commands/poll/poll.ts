import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  EmbedBuilder,
  Colors,
  MessageReaction,
  User,
} from "discord.js";
import Command from "../../types/Command";

const EMOJI_NUMBERS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

const QUESTION_OPTION_NAME = "question";
const QUESTION_REQUIRED = true;
const ALLOW_MULTIVOTE_OPTION_NAME = "allow-multiple-votes";
const MULTIVOTE_REQUIRED = true;
const NO_OF_OPTIONS = 10;
const OPTION_NAME_PREFIX = "option-";

// Poll command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Create a poll with up to 10 options!")
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName(QUESTION_OPTION_NAME)
      .setDescription("Question to ask on poll. Must have AT LEAST 2 options.")
      .setRequired(QUESTION_REQUIRED)
  )
  .addBooleanOption((option) =>
    option.setName(ALLOW_MULTIVOTE_OPTION_NAME).setDescription("Allow multiple votes").setRequired(MULTIVOTE_REQUIRED)
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
  const allowMultiVote = interaction.options.getBoolean(ALLOW_MULTIVOTE_OPTION_NAME, MULTIVOTE_REQUIRED);
  const options: string[] = [];

  for (let i = 1; i <= NO_OF_OPTIONS; i++) {
    const option = interaction.options.getString(OPTION_NAME_PREFIX + i);
    if (option) {
      options.push(option);
    }
  }

  const votes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let userVoted: string[] = [];

  const generateDescription = () => {
    const generatePercentage = (index: number): string => {
      const percentage = (votes[index] / votes.reduce((a, b) => a + b, 0)) * 100 || 0;

      if (percentage.toString().includes(".") && percentage.toString().split(".")[1].length > 2) {
        return percentage.toFixed(2);
      }

      return percentage.toString();
    };

    return options.map((o, i) => `${EMOJI_NUMBERS[i]} ${o} | ${votes[i]} (${generatePercentage(i)}%)`).join("\n");
  };

  const pollEmbed = new EmbedBuilder()
    .setTitle(question)
    .setDescription(generateDescription())
    .setColor(Colors.Red)
    .setThumbnail(interaction.user.avatarURL())
    .setFooter({
      text: `Poll created by ${interaction.user.username}`,
    });

  const message = await interaction.editReply({ embeds: [pollEmbed] });

  const filter = (reaction: MessageReaction, user: User) =>
    EMOJI_NUMBERS.includes(reaction.emoji.name ?? "") &&
    EMOJI_NUMBERS.indexOf(reaction.emoji.name ?? "") < options.length &&
    (!allowMultiVote ? !userVoted.includes(user.id) : true);

  const collector = message.createReactionCollector({
    filter,
    time: 60000 * 60 * 2,
    dispose: true,
  });

  collector.on("collect", (reaction: MessageReaction, user: User) => {
    const index = EMOJI_NUMBERS.indexOf(reaction.emoji.name ?? "");
    votes[index]++;

    if (!allowMultiVote) {
      userVoted.push(user.id);
    }

    pollEmbed.setDescription(generateDescription());
    message.edit({ embeds: [pollEmbed] });
  });

  collector.on("remove", (reaction: MessageReaction, user: User) => {
    const index = EMOJI_NUMBERS.indexOf(reaction.emoji.name ?? "");
    votes[index]--;

    if (!allowMultiVote) {
      userVoted = userVoted.filter((id) => id !== user.id);
    }

    pollEmbed.setDescription(generateDescription());
    message.edit({ embeds: [pollEmbed] });
  });
};

const pollCommand: Command = {
  data,
  execute,
};

module.exports = pollCommand;
