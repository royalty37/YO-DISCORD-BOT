import { EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { DisTube, Queue, Song } from "distube";
import { updateLatestQueueMessage, finishLatestQueueMessage } from "../commands/music/actions/queueActions";

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

    // Update latest queue message
    updateLatestQueueMessage(queue);
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

    // Update latest queue message - empty queue
    finishLatestQueueMessage();
  });

  // DisTube disconnect event
  distube.on("disconnect", (queue: Queue) => {
    // Stop and delete queue on disconnect - this is to avoid an exception when forcefully disconnected
    queue.stop();

    console.log(`*** DisTube disconnect event - disconnecting`);
    queue.textChannel?.send("❌ | Disconnected from the voice channel!");
  });

  // DisTube empty event
  distube.on("empty", (queue: Queue) => {
    console.log(`*** DisTube empty event - nobody in the voice channel`);
    queue.textChannel?.send("❌ | Nobody is in the voice channel, leaving...");
  });
};
