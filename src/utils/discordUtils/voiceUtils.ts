import { joinVoiceChannel } from "@discordjs/voice";

import type { VoiceChannel } from "discord.js";
import type { VoiceConnectionState } from "@discordjs/voice";

/**
 * Joins a voice channel and applies the keep-alive interval workaround
 * to prevent Discord from disconnecting the bot.
 *
 * TODO: Remove this workaround when the underlying discord.js/voice issue is resolved.
 */
export const joinVoiceChannelWithWorkaround = (
    channelId: string,
    guildId: string,
    channel: VoiceChannel,
) => {
    const connection = joinVoiceChannel({
        channelId,
        guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(
        "stateChange",
        (oldState: VoiceConnectionState, newState: VoiceConnectionState) => {
            const oldNetworking = Reflect.get(oldState, "networking");
            const newNetworking = Reflect.get(newState, "networking");

            const networkStateChangeHandler = (
                _oldNetworkState: unknown,
                newNetworkState: Record<string, unknown>,
            ) => {
                const newUdp = Reflect.get(newNetworkState, "udp") as
                    | { keepAliveInterval?: ReturnType<typeof setInterval> }
                    | undefined;
                clearInterval(newUdp?.keepAliveInterval);
            };

            oldNetworking?.off("stateChange", networkStateChangeHandler);
            newNetworking?.on("stateChange", networkStateChangeHandler);
        },
    );

    return connection;
};
