import { Player } from "discord-player";
import { Client, Collection } from "discord.js";

// YoClient type - stupid name but it servers a purpose
type YoClient = Client<boolean> & {
  commands: Collection<string, any>;
  player: Player;
};

export default YoClient;
