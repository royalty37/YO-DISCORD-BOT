import { Player } from "discord-player";
import { Client, Collection } from "discord.js";

type YoClient = Client<boolean> & {
  commands: Collection<string, any>;
  player: Player;
};

export default YoClient;
