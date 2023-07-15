import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Client,
  Collection,
  BaseInteraction,
} from "discord.js";
import type { Player } from "discord-player";

export type YoClient = Client<boolean> & {
  commands: Collection<string, any>;
  player: Player;
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
