import { SlashCommandBuilder } from "discord.js";

type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: any) => Promise<void>;
};

export default Command;
