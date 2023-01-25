import { clearBumboysJob } from "./commands/bumboy/jobs/bumboyJobs";
import { YoClient } from "./types/types";
import { isDevMode } from "./clientUtils";

// This function is responsible for scheduling the jobs every time the bot is restarted
export const scheduleJobs = (client: YoClient) => {
  if (isDevMode) {
    console.log("*** DEV MODE: NOT SCHEDULING JOBS");
    return;
  }

  console.log("*** SCHEDULING JOBS ON STARTUP");

  // Schedule the clear bumboys job
  clearBumboysJob(client);
};
