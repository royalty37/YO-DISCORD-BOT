import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Client,
  Collection,
  BaseInteraction,
} from "discord.js";
import { DisTube } from "distube";

export type YoClient = Client<boolean> & {
  commands: Collection<string, any>;
  distube: DisTube;
};

export type Interaction<T extends BaseInteraction> = T & {
  client: YoClient;
};

export type Command = {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: (interaction: any) => Promise<void>;
};
