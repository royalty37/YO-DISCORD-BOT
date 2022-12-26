import { Client, Events } from "discord.js";

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute: (client: Client<boolean>) => {
    console.log(`Ready! Logged in as ${client?.user?.tag}`);
  },
};
