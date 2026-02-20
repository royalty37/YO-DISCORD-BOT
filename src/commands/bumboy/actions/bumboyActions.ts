import dayjs from "dayjs";
import { getData, setData, deleteData } from "../../../fileStore";

const STORE_KEY = "currentBumboys";

// Database operations for handling BUMBOY Guild Member IDs

// Return type from store
export type CurrentBumboysRecord = {
  bumboys: BumboyData[];
  clearTime: string;
};

// BUMBOY datatype - holds ID and old nickname
type BumboyData = {
  id: string;
  nickname: string | null;
};

// Delete record holding current BUMBOYs from store
export const clearBumboys = async () => {
  deleteData(STORE_KEY);
  console.log("*** Successfully cleared BUMBOY IDs from store.");
};

// Save array of BUMBOY IDs and clear time (12 hours from now) to store
export const saveBumboys = async (bumboys: BumboyData[]) => {
  if (bumboys.length === 0) {
    return void console.error("*** ERROR: No BUMBOY IDs to save.");
  }

  const record: CurrentBumboysRecord = {
    bumboys,
    clearTime: dayjs().add(12, "hours").toISOString(),
  };

  setData(STORE_KEY, record);
  console.log("*** Successfully saved BUMBOY IDs to store.");
};

// Return array of BUMBOY data from store
export const getBumboys = async (): Promise<CurrentBumboysRecord | null> => {
  const bumboys = getData<CurrentBumboysRecord>(STORE_KEY);
  console.log("*** Successfully retrieved BUMBOY IDs from store.");
  return bumboys;
};
