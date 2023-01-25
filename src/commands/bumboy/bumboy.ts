import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import Command from "../../types/Command";
import { pollSubcommand, handlePollSubcommand } from "./subcommands/poll";
import { clearSubcommand, handleClearSubcommand } from "./subcommands/clear";
import { isDevMode } from "../../clientUtils";

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
const execute = async (interaction: ChatInputCommandInteraction) => {
  if (isDevMode) {
    return void interaction.reply("This command is disabled in dev mode.");
  }

  switch (interaction.options.getSubcommand()) {
    case subcommands.POLL:
      await handlePollSubcommand(interaction);
      break;
    case subcommands.CLEAR:
      await handleClearSubcommand(interaction);
      break;
    default:
      console.log("*** ERROR: No subcommand found.");
  }
};

const bumboyCommand: Command = {
  data,
  execute,
};

module.exports = bumboyCommand;
