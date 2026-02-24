import { clearBumboysJob } from "./commands/bumboy/jobs/bumboyJobs";
import { resumeActivePolls } from "./commands/poll/resumePolls";
import { YoClient } from "./types/types";
import { isDevMode } from "./config";

// This function is responsible for scheduling the jobs every time the bot is restarted
export const scheduleJobs = async (client: YoClient) => {
  if (isDevMode) {
    console.log("*** DEV MODE: NOT SCHEDULING JOBS");
    return;
  }

  console.log("*** SCHEDULING JOBS ON STARTUP");

  // Schedule the clear bumboys job
  clearBumboysJob(client);

  // Resume any active polls that were running before the restart
  await resumeActivePolls(client);
};
