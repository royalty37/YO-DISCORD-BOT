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

// ─── Leaderboard ────────────────────────────────────────────────────────────

const LEADERBOARD_KEY = "bumboyLeaderboard";

export type LeaderboardEntry = {
  id: string;
  wins: number;
};

// Record bumboy wins — increments the win count for each given user ID
export const recordBumboyWins = (bumboyIds: string[]): void => {
  const leaderboard = getData<LeaderboardEntry[]>(LEADERBOARD_KEY) ?? [];

  for (const id of bumboyIds) {
    const entry = leaderboard.find((e) => e.id === id);
    if (entry) {
      entry.wins++;
    } else {
      leaderboard.push({ id, wins: 1 });
    }
  }

  setData(LEADERBOARD_KEY, leaderboard);
  console.log("*** Successfully recorded BUMBOY wins to leaderboard.");
};

// Return the leaderboard sorted by wins descending
export const getLeaderboard = (): LeaderboardEntry[] => {
  const leaderboard = getData<LeaderboardEntry[]>(LEADERBOARD_KEY) ?? [];
  return leaderboard.sort((a, b) => b.wins - a.wins);
};
