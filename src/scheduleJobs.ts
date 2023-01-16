import { clearBumboysJob } from "./commands/bumboy/jobs/bumboyJobs";
import YoClient from "./types/YoClient";

// This function is responsible for scheduling the jobs every time the bot is restarted
export const scheduleJobs = (client: YoClient) => {
  console.log("*** SCHEDULING JOBS ON STARTUP");

  // Schedule the clear bumboys job
  clearBumboysJob(client);
};
