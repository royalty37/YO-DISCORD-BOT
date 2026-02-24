import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Subcommands } from "../bumboy";
import { getLeaderboard } from "../actions/bumboyActions";
import { Interaction } from "../../../types/types";

// Medal emojis for top 3
const MEDALS = ["🥇", "🥈", "🥉"];

export const leaderboardSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.LEADERBOARD)
    .setDescription(
      "View the BUMBOY Hall of Shame — who has been bumboy the most!",
    );

export const handleLeaderboardSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  await interaction.deferReply();

  const leaderboard = getLeaderboard();

  if (leaderboard.length === 0) {
    await interaction.editReply(
      "The BUMBOY leaderboard is empty! No one has been demoted yet... 👀",
    );
    return;
  }

  // Fetch guild members so we can resolve display names
  await interaction.guild?.members.fetch();

  const lines = leaderboard.map((entry, index) => {
    const member = interaction.guild?.members.cache.get(entry.id);
    const name = member
      ? (member.nickname ?? member.user.username)
      : `Unknown (${entry.id})`;
    const medal = index < MEDALS.length ? MEDALS[index] : `**${index + 1}.**`;
    const times = entry.wins === 1 ? "time" : "times";
    return `${medal} ${name} — **${entry.wins}** ${times}`;
  });

  const embed = new EmbedBuilder()
    .setTitle("💩 BUMBOY Hall of Shame 💩")
    .setDescription(lines.join("\n\n"))
    .setColor(Colors.DarkGold)
    .setFooter({
      text: `Total demotions recorded: ${leaderboard.reduce((sum, e) => sum + e.wins, 0)}`,
    });

  await interaction.editReply({ embeds: [embed] });
};
