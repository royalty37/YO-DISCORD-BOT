import { PlayerEvent, GuildQueueEvent } from "discord-player";
import {
  updateLatestQueueMessage,
  finishLatestQueueMessage,
} from "../commands/music/actions/queueActions";
import { createTrackEmbed } from "../utils/messageUtils/messageUtils";

import type { ChatInputCommandInteraction } from "discord.js";
import type { Player, GuildQueue, Track } from "discord-player";
import type { Interaction } from "../types/types";

// Register player events
export const registerPlayerEvents = (player: Player) => {
  // Discord Player error event
  player.events.on(PlayerEvent.error, (queue: GuildQueue, error: Error) => {
    console.error(`*** Player error: ${error}`);
    // queue.textChannel?.send(`Something went wrong!`);
    updateLatestQueueMessage(queue);
  });

  // Discord player audioTrackAdd event
  player.events.on(
    GuildQueueEvent.AudioTrackAdd,
    (queue: GuildQueue, track: Track) => {
      const q = queue as GuildQueue<Interaction<ChatInputCommandInteraction>>;
      console.log(`*** audioTrackAdd event - adding ${track.title}`);
      if (q.metadata.channel?.isSendable()) {
        q.metadata.channel.send({
          embeds: [createTrackEmbed(track)],
        });
      }

      // Update latest queue message
      updateLatestQueueMessage(queue);
    },
  );

  // Discord player audioTracksAdd event
  player.events.on(
    GuildQueueEvent.AudioTracksAdd,
    (queue: GuildQueue, tracks: Track[]) => {
      const q = queue as GuildQueue<Interaction<ChatInputCommandInteraction>>;
      console.log(
        `*** audioTracksAdd event - adding multiple tracks ${tracks
          .map((t) => t.title)
          .join(", ")}`,
      );
      if (q.metadata.channel?.isSendable()) {
        q.metadata.channel.send({
          embeds: tracks.map(createTrackEmbed),
        });
      }

      // Update latest queue message
      updateLatestQueueMessage(queue);
    },
  );

  // Discord player playerSkip event
  player.events.on(
    GuildQueueEvent.PlayerSkip,
    (queue: GuildQueue, track: Track) => {
      const q = queue as GuildQueue<Interaction<ChatInputCommandInteraction>>;
      console.log(
        `*** playerSkip event - skipping song ${track.title}`,
      );
      if (q.metadata.channel?.isSendable()) {
        q.metadata.channel.send("Something went wrong!");
      }

      // Update latest queue message
      updateLatestQueueMessage(queue);
    },
  );

  // Discord player disconnect event
  player.events.on(GuildQueueEvent.Disconnect, (queue: GuildQueue) => {
    const q = queue as GuildQueue<Interaction<ChatInputCommandInteraction>>;
    console.log("*** disconnect event - disconnecting");
    if (q.metadata.channel?.isSendable()) {
      q.metadata.channel.send("Disconnected from the voice channel!");
    }

    // Update latest queue message
    updateLatestQueueMessage(queue);
  });

  // Discord player emptyChannel event
  player.events.on(GuildQueueEvent.EmptyChannel, (queue: GuildQueue) => {
    const q = queue as GuildQueue<Interaction<ChatInputCommandInteraction>>;
    console.log("*** emptyChannel event - nobody in the voice channel");
    if (q.metadata.channel?.isSendable()) {
      q.metadata.channel.send("Nobody is in the voice channel, leaving...");
    }

    // Update latest queue message
    updateLatestQueueMessage(queue);
  });

  // Discord player emptyQueue event
  player.events.on(GuildQueueEvent.EmptyQueue, (queue: GuildQueue) => {
    const q = queue as GuildQueue<Interaction<ChatInputCommandInteraction>>;
    console.log("*** emptyQueue event - queue finished");
    if (q.metadata.channel?.isSendable()) {
      q.metadata.channel.send("Queue finished !");
    }

    // Update latest queue message
    finishLatestQueueMessage();
  });

  player.on(PlayerEvent.debug, async (message: string) => {
    console.log(`*** General player debug event: ${message} ***`);
  });

  player.events.on(
    PlayerEvent.debug,
    async (_: GuildQueue, message: string) => {
      console.log(`Player debug event: ${message}`);
    },
  );
};
