import { EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { DisTube, Queue, Song } from "distube";

// Register player events
export const registerDistubeEvents = (distube: DisTube) => {
  // DisTube Error event
  distube.on("error", (textChannel: GuildTextBasedChannel | undefined, error: Error) => {
    console.error(`*** DisTube error: ${error}`);
    textChannel?.send(`Something went wrong!`);
  });

  // DisTube playSong event
  distube.on("playSong", (queue: Queue, song: Song) => {
    console.log(`*** DisTube playSong event - playing ${song.name}`);
    queue.textChannel?.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Random")
          .setTitle("🎶 | Started playing:")
          .setDescription(`**${song.name}!**`)
          .setThumbnail(song.thumbnail ?? null)
          .addFields([
            {
              name: "**Duration:**",
              value: song.formattedDuration ?? "Unknown",
              inline: true,
            },
            {
              name: "**Views**",
              value: song.views.toString(),
              inline: true,
            },
            {
              name: "**Likes**",
              value: song.likes.toString(),
              inline: true,
            },
          ])
          .setFooter({ text: `Requested by: ${song.user?.username}`, iconURL: song.user?.displayAvatarURL() })
          .setTimestamp(),
      ],
    });
  });

  // DisTube addSong event
  distube.on("addSong", (queue: Queue, song: Song) => {
    console.log(`*** DisTube addSong event - adding ${song.name}`);
    queue.textChannel?.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Random")
          .setTitle("🎶 | Added song to the queue:")
          .setDescription(`**${song.name}!**`)
          .setThumbnail(song.thumbnail ?? null)
          .addFields([
            {
              name: "**Duration:**",
              value: song.formattedDuration ?? "Unknown",
              inline: true,
            },
            {
              name: "**Views**",
              value: song.views.toString(),
              inline: true,
            },
            {
              name: "**Likes**",
              value: song.likes.toString(),
              inline: true,
            },
          ])
          .setFooter({ text: `Requested by: ${song.user?.username}`, iconURL: song.user?.displayAvatarURL() })
          .setTimestamp(),
      ],
    });
  });

  // DisTube finish event
  distube.on("finish", (queue: Queue) => {
    console.log(`*** DisTube finish event - Queue finished`);
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
