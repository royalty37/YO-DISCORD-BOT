import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { clearBumboys, getBumboys } from "../actions/bumboyActions";
import { BUMBOY_ROLE_ID, VICE_PLUS_ROLE_ID } from "../../../utils/discordUtils/roleUtils";
import { subcommands } from "../bumboy";

// TODO: Let the president use this command - only me at this point (and probably ever)

// My Discord ID - only I can use the clear subcommand
const MY_ID = "218945393579261954";

export const clearSubcommand = (sc: SlashCommandSubcommandBuilder) =>
  sc.setName(subcommands.CLEAR).setDescription("Resets all data related to the latest BUMBOY poll.");

export const handleClearSubcommand = async (interaction: ChatInputCommandInteraction) => {
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

  // Get current BUMBOY record saved in database
  const currentBumboysRecord = await getBumboys();
  const bumboyNames: string[] = [];

  if (!currentBumboysRecord) {
    console.log("*** No BUMBOY record found in database.");
  } else {
    // Get array of BUMBOY IDs
    const bumboyIDs = currentBumboysRecord.bumboys.map((bumboy) => bumboy.id);

    // Get array of BUMBOY members
    const bumboyMembers = bumboyIDs.map((id) => interaction.guild?.members.cache.get(id)).filter((m) => m);

    // Reset role for each BUMBOY member
    for (const bumboy of bumboyMembers) {
      if (!bumboy) {
        console.log("*** ERROR: No BUMBOY member found.");
        continue;
      }

      // Add BUMBOY name to array
      bumboyNames.push(bumboy.user.username);

      // Wait 3 seconds before resetting role because Discord API hates role updates
      setTimeout(async () => {
        console.log(`*** RESETTING ROLE AND NICKNAME FOR: ${bumboy?.user.username}`);
        await bumboy?.roles.set([vicePlusRole!]);
        await bumboy?.setNickname(currentBumboysRecord.bumboys.find((b) => b.id === bumboy?.id)?.nickname ?? null);
      }, 3000);
    }
  }

  // Delete BUMBOY record from database
  await clearBumboys();

  console.log("*** BUMBOY data cleared.");
  interaction.editReply(
    `The BUMBOY roles have been forcefully cleared by the president.\n\nThe following members have had their roles reset:\n\n${bumboyNames
      .map((b) => `💩 **${b}** 💩`)
      .join("\n\n")}\n\nThe BUMBOY poll can be run again!`
  );
};
