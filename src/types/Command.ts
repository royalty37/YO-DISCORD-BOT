import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

// Janky command type - kinda useless ngl
type Command = {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: (interaction: any) => Promise<void>;
};

export default Command;
