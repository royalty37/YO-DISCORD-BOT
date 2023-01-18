import dayjs from "dayjs";
import { mongoClient } from "../../../mongoSetup";

const DB_NAME = "YOZA-BOT";

// Database operations for handling BUMBOY Guild Member IDs

// Return type from Database
export type CurrentBumboysRecord = {
  bumboys: bumboyData[];
  clearTime: Date;
};

// BUMBOY datatype - holds ID and old nickname
type bumboyData = {
  id: string;
  nickname: string | null;
};

// Delete record holding current BUMBOYs from database
export const clearBumboys = async () => {
  await mongoClient.db(DB_NAME).collection("bumboys").deleteOne({ name: "current" });
  console.log(`*** Successfully cleared BUMBOY IDs from MONGODB: ${DB_NAME}`);
};

// Save array of BUMBOY IDs and clear time (12 hours from now) to database
export const saveBumboys = async (bumboys: bumboyData[]) => {
  if (bumboys.length === 0) {
    return void console.error("*** ERROR: No BUMBOY IDs to save.");
  }

  await mongoClient
    .db(DB_NAME)
    .collection("bumboys")
    .insertOne({ name: "current", bumboys, clearTime: dayjs().add(12, "hours").toDate() });
  console.log(`*** Successfully saved BUMBOY IDs to MONGODB: ${DB_NAME}`);
};

// Return array of BUMBOY data from database
export const getBumboys = async (): Promise<CurrentBumboysRecord | null> => {
  const bumboys = await mongoClient
    .db(DB_NAME)
    .collection("bumboys")
    .findOne<CurrentBumboysRecord>({ name: "current" });
  console.log(`*** Successfully retrieved BUMBOY IDs from MONGODB: ${DB_NAME}`);

  return bumboys;
};
