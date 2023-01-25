import { DisTube } from "distube";
import { Client, Collection } from "discord.js";

// YoClient type - stupid name but it servers a purpose
type YoClient = Client<boolean> & {
  commands: Collection<string, any>;
  distube: DisTube;
};

export default YoClient;
