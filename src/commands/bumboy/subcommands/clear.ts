import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { getBumboys } from "../actions/bumboyActions";
import {
  BUMBOY_ROLE_ID,
  VICE_PLUS_ROLE_ID,
} from "../../../utils/discordUtils/roleUtils";
import { Subcommands } from "../bumboy";
import { performForceClear } from "../jobs/bumboyJobs";
import { Interaction } from "../../../types/types";

// TODO: Let the president use this command - only me at this point (and probably ever)

// My Discord ID - only I can use the clear subcommand
const ADMIN_ID = process.env.ADMIN_USER_ID;

export const clearSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc
    .setName(Subcommands.CLEAR)
    .setDescription("Resets all data related to the latest BUMBOY poll.");

export const handleClearSubcommand = async (
  interaction: Interaction<ChatInputCommandInteraction>,
) => {
  // Only I can use this command
  if (!ADMIN_ID || interaction.user.id !== ADMIN_ID) {
    await interaction.reply({
      content:
        "You do not have permission to use this command. Only the president can use this command.",
      ephemeral: true,
    });
    return console.log("*** BUMBOY CLEAR - User is not the president.");
  }

  // Fetch BUMBOY role and Vice Plus role
  const bumboyRole = await interaction.guild?.roles.fetch(BUMBOY_ROLE_ID);
  const vicePlusRole = await interaction.guild?.roles.fetch(VICE_PLUS_ROLE_ID);

  if (!bumboyRole || !vicePlusRole) {
    console.log("*** ERROR: No BUMBOY or no Vice Plus role found.");
    return void interaction.reply({
      content: "Something went wrong. Please try again later.",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  await interaction.guild?.members.fetch();

  const currentBumboyRecord = await getBumboys();

  console.log("*** Calling BUMBOY performClear from Clear subcommand.");

  await performForceClear(interaction.client, currentBumboyRecord);

  await interaction.editReply(
    "The BUMBOY roles have been forcefully cleared by the president!",
  );
};
