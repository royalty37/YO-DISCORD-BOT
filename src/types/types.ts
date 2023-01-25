import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Client,
  Collection,
} from "discord.js";
import { DisTube } from "distube";

export type YoClient = Client<boolean> & {
  commands: Collection<string, any>;
  distube: DisTube;
};

export type Interaction = ChatInputCommandInteraction & {
  client: YoClient;
};

export type Command = {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: (interaction: any) => Promise<void>;
};
