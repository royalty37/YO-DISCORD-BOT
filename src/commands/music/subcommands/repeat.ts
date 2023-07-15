import { updateLatestQueueMessage } from "../actions/queueActions";
import { Subcommands } from "../music";
import { REPEAT_MODE_ARRAY } from "../constants/musicConstants";

import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import type { Interaction } from "../../../types/types";
import { useQueue } from "discord-player";

const MODE_OPTION_NAME = "mode";

// Music repeat subcommands play song that is searched for
export const repeatSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.REPEAT)
    .setDescription("Set repeat mode for queue!")
    .addStringOption((option) =>
      option
        .setName(MODE_OPTION_NAME)
        .setDescription("Repeat mode: song, queue or disabled.")
        .addChoices(
          { name: REPEAT_MODE_ARRAY[0], value: "0" },
          { name: REPEAT_MODE_ARRAY[1], value: "1" },
          { name: REPEAT_MODE_ARRAY[2], value: "2" },
          { name: REPEAT_MODE_ARRAY[3], value: "3" },
        ),
    );

// This is the function that handles the repeat subcommand
export const handleRepeatSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // If no guild ID, return
  if (!interaction.guildId) {
    console.log("*** ERROR IN MUSIC REPEAT SUBCOMMAND - NO GUILD ID");
    return void interaction.reply("Something went wrong. Please try again.");
  }

  // Get queue
  const queue = useQueue(interaction.guildId);

  // If no queue, return without updating queue message
  if (!queue) {
    console.log(
      "*** ERROR IN MUSIC PLAY SUBCOMMAND - NO QUEUE - CANNOT UPDATE QUEUE MESSAGE",
    );
    return void interaction.reply({
      content: "❌ | No music is being played!",
      ephemeral: true,
    });
  }

  // Get mode options or fallback to 0 (disabled) if none supplied
  const modeOption = interaction.options.getString(MODE_OPTION_NAME);
  const mode = modeOption ? parseInt(modeOption) : 0;

  // Set repeat mode
  queue.setRepeatMode(mode);

  // Reply with repeat mode
  interaction.reply(`🔁 | Repeat mode set to ${REPEAT_MODE_ARRAY[mode]}!`);

  // Update latest queue message upon play
  updateLatestQueueMessage(queue);
};
