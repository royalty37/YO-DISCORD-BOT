import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { pollSubcommand, handlePollSubcommand } from "./subcommands/poll";
import { clearSubcommand, handleClearSubcommand } from "./subcommands/clear";
import { leaderboardSubcommand, handleLeaderboardSubcommand } from "./subcommands/leaderboard";
import { Command, Interaction } from "../../types/types";

export enum Subcommands {
  POLL = "poll",
  CLEAR = "clear",
  LEADERBOARD = "leaderboard",
}

// Feature to excite the boys - the YOZA BUMBOY feature

// Bumboy command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("bumboy")
  .setDescription(
    "Vices cast their vote for who will be demoted to bumboy for the next 24 hours!",
  )
  .addSubcommand(pollSubcommand)
  .addSubcommand(clearSubcommand)
  .addSubcommand(leaderboardSubcommand);

const subcommandHandlers: Record<
  string,
  (interaction: Interaction<ChatInputCommandInteraction>) => Promise<void>
> = {
  [Subcommands.POLL]: handlePollSubcommand,
  [Subcommands.CLEAR]: handleClearSubcommand,
  [Subcommands.LEADERBOARD]: handleLeaderboardSubcommand,
};

const execute = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  const subcommand = interaction.options.getSubcommand();
  const handler = subcommandHandlers[subcommand];

  if (handler) {
    await handler(interaction);
  } else {
    interaction.reply({
      content: "Something went wrong. Please try again.",
      ephemeral: true,
    });
    console.log(
      `*** BUMBOY - Subcommand doesn't exist: ${subcommand}`,
    );
  }
};

const bumboyCommand: Command = {
  data,
  execute,
};

export default bumboyCommand;

