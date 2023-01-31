import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { pollSubcommand, handlePollSubcommand } from "./subcommands/poll";
import { clearSubcommand, handleClearSubcommand } from "./subcommands/clear";
import { isDevMode } from "../../index";
import { Command, Interaction } from "../../types/types";

// TODO: Fix remaining time bug - sometimes shows message after poll finishes

export enum subcommands {
  POLL = "poll",
  CLEAR = "clear",
}

// Feature to excite the boys - the YOZA BUMBOY feature

// Bumboy command SlashCommandBuilder
const data = new SlashCommandBuilder()
  .setName("bumboy")
  .setDescription("Vices cast their vote for who will be demoted to bumboy for the next 24 hours!")
  .addSubcommand(pollSubcommand)
  .addSubcommand(clearSubcommand);

// Bumboy command execute function
const execute = async (interaction: Interaction<ChatInputCommandInteraction>) => {
  if (isDevMode) {
    return void interaction.reply("This command is disabled in dev mode.");
  }

  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case subcommands.POLL:
      await handlePollSubcommand(interaction);
      break;
    case subcommands.CLEAR:
      await handleClearSubcommand(interaction);
      break;
    default:
      interaction.reply({ content: "Something went wrong. Please try again.", ephemeral: true });
      console.log(`*** BUMBOY - Subcommand doesn't exist: ${interaction.options.getSubcommand()}`);
  }
};

const bumboyCommand: Command = {
  data,
  execute,
};

module.exports = bumboyCommand;
