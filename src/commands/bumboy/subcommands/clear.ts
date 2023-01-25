import { SlashCommandSubcommandBuilder } from "discord.js";
import { getBumboys } from "../actions/bumboyActions";
import { BUMBOY_ROLE_ID, VICE_PLUS_ROLE_ID } from "../../../utils/discordUtils/roleUtils";
import { subcommands } from "../bumboy";
import { performForceClear } from "../jobs/bumboyJobs";
import { Interaction } from "../../../types/types";

// TODO: Let the president use this command - only me at this point (and probably ever)

// My Discord ID - only I can use the clear subcommand
const MY_ID = "218945393579261954";

export const clearSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.CLEAR).setDescription("Resets all data related to the latest BUMBOY poll.");

export const handleClearSubcommand = async (interaction: Interaction) => {
  if (interaction.user.id !== MY_ID) {
    return void (await interaction.reply(
      "You do not have permission to use this command. Only the president can use this command."
    ));
  }

  await interaction.deferReply();

  await interaction.guild?.members.fetch();

  // Fetch BUMBOY role and Vice Plus role
  const bumboyRole = await interaction.guild?.roles.fetch(BUMBOY_ROLE_ID);
  const vicePlusRole = await interaction.guild?.roles.fetch(VICE_PLUS_ROLE_ID);

  if (!bumboyRole || !vicePlusRole) {
    console.log("*** ERROR: No BUMBOY or no Vice Plus role found.");
    return void interaction.editReply("Something went wrong. Please try again later.");
  }

  const currentBumboyRecord = await getBumboys();

  console.log("*** Calling BUMBOY performcClear from Clear subcommand.");

  performForceClear(interaction.client, currentBumboyRecord);

  interaction.editReply("The BUMBOY roles have been forcefully cleared by the president!");
};
