import { Player, Queue, Track } from "discord-player";

// Register player events
export const registerPlayerEvents = (player: Player) => {
  // Player Error event
  player.on("error", (queue: Queue<any>, error: Error) => {
    // Log error
    console.log(`*** [${queue.guild.name}] Error emitted from the queue: ${error.message}`);
  });

  // Player ConnectionError event
  player.on("connectionError", (queue: Queue<any>, error: Error) => {
    // Log error
    console.log(`*** [${queue.guild.name}] Error emitted from the connection: ${error.message}`);
  });

  // Player TrackStart event
  player.on("trackStart", (queue: Queue<any>, track: Track) => {
    // Send track start message to text channel where command was executed
    queue.metadata.send(`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
  });

  // Player TrackAdd event
  player.on("trackAdd", (queue: Queue<any>, track: Track) => {
    // Send track add message to text channel where command was executed
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
  });

  // Player BotDisconnect event
  player.on("botDisconnect", (queue: Queue<any>) => {
    // Send bot disconnect message to text channel where command was executed
    queue.metadata.send("❌ | I was manually disconnected from the voice channel, clearing queue!");
  });

  // Player ChannelEmpty event
  player.on("channelEmpty", (queue: Queue<any>) => {
    // Send channel empty message to text channel where command was executed
    queue.metadata.send("❌ | Nobody is in the voice channel, leaving...");
  });

  // Player QueueEnd event
  player.on("queueEnd", (queue: Queue<any>) => {
    // Send queue end message to text channel where command was executed
    queue.metadata.send("✅ | Queue finished!");
  });
};
