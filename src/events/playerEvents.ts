import { Player, Queue, Track } from "discord-player";

export const registerPlayerEvents = (player: Player) => {
  player.on("error", (queue: Queue<any>, error: Error) => {
    console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
  });

  player.on("connectionError", (queue: Queue<any>, error: Error) => {
    console.log(`[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
  });

  player.on("trackStart", (queue: Queue<any>, track: Track) => {
    queue.metadata.send(`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
  });

  player.on("trackAdd", (queue: Queue<any>, track: Track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });

  player.on("botDisconnect", (queue: Queue<any>) => {
    queue.metadata.send("❌ | I was manually disconnected from the voice channel, clearing queue!");
  });

  player.on("channelEmpty", (queue: Queue<any>) => {
    queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
  });

  player.on("queueEnd", (queue: Queue<any>) => {
    queue.metadata.send("✅ | Queue finished!");
  });
};
