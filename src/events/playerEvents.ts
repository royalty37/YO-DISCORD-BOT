import { GuildTextBasedChannel, TextChannel } from "discord.js";
import { DisTube, Queue, Song } from "distube";

// Register player events
export const registerPlayerEvents = (distube: DisTube) => {
  // DisTube Error event
  distube.on("error", (textChannel: GuildTextBasedChannel | undefined, error: Error) => {
    console.error(`*** DisTube error: ${error}`);
    if (textChannel) {
      textChannel.send(`Something went wrong!`);
    }
  });

  // DisTube playSong event
  distube.on("playSong", (queue: Queue, song: Song) => {
    console.log(`*** DisTube playSong event - playing ${song.name}`);
    queue.textChannel?.send(`🎶 | Started playing: **${song.name}**! Requested by: **${song.user}!**`);
  });

  // DisTube addSong event
  distube.on("addSong", (queue: Queue, song: Song) => {
    console.log(`*** DisTube addSong event - adding ${song.name}`);
    queue.textChannel?.send(`🎶 | Added **${song.name}** to the queue! Requested by: **${song.user}!**`);
  });

  // DisTube finish event
  distube.on("finish", (queue: Queue) => {
    console.log(`*** DisTube finish event - finishing ${queue.songs[0].name}`);
    queue.textChannel?.send("🎶 | Queue finished!");
  });

  // DisTube disconnect event
  distube.on("disconnect", (queue: Queue) => {
    console.log(`*** DisTube disconnect event - disconnecting ${queue.songs[0].name}`);
    queue.textChannel?.send("❌ | Disconnected from the voice channel!");
  });

  // DisTube empty event
  distube.on("empty", (queue: Queue) => {
    console.log(`*** DisTube empty event - emptying ${queue.songs[0].name}`);
    queue.textChannel?.send("❌ | Nobody is in the voice channel, leaving...");
  });
};
