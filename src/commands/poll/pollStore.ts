import { getData, setData, deleteData, getKeysByPrefix } from "../../fileStore";

// ─── Types ──────────────────────────────────────────────────────────────────

export type PollType = "bumboy" | "regular";

/** Serializable poll state that survives bot restarts */
export type PersistedPollState = {
  type: PollType;

  /** Discord message ID of the poll embed */
  messageId: string;
  /** Discord channel ID where the poll was posted */
  channelId: string;
  /** Username of the person who initiated the poll */
  initiatorUsername: string;

  /** Absolute timestamp (ISO string) when the poll should end */
  endTime: string;

  /** Per-option vote counts */
  voteCounts: number[];

  /** Single-vote tracking: userId -> optionIndex */
  singleVotes: Record<string, number>;

  /** Multi-vote tracking: userId -> optionIndex[] (regular polls only) */
  multiVotes: Record<string, number[]>;

  // ─── Regular poll fields ─────────────────────────────────────────────────

  /** The poll question (regular polls) */
  question?: string;
  /** The poll option labels (regular polls) */
  options?: string[];
  /** Whether multi-vote is allowed (regular polls) */
  allowMultiVote?: boolean;

  // ─── Bumboy poll fields ──────────────────────────────────────────────────

  /** Member IDs included as poll options (bumboy polls) */
  includedMemberIds?: string[];
  /** Member IDs excluded from the poll due to button limit (bumboy polls) */
  nonIncludedMemberIds?: string[];
};

// ─── Store Keys ─────────────────────────────────────────────────────────────

const BUMBOY_POLL_KEY = "activePoll_bumboy";
const REGULAR_POLL_PREFIX = "activePoll_regular_";

const getStoreKey = (state: PersistedPollState): string => state.type === "bumboy"
  ? BUMBOY_POLL_KEY
  : `${REGULAR_POLL_PREFIX}${state.messageId}`;

// ─── API ────────────────────────────────────────────────────────────────────

/** Save an active poll's state to the store */
export const saveActivePoll = (state: PersistedPollState): void => setData(getStoreKey(state), state);

/** Get the active bumboy poll (only one can exist at a time) */
export const getActiveBumboyPoll = (): PersistedPollState | null => getData<PersistedPollState>(BUMBOY_POLL_KEY);

/** Get all active regular polls */
export const getActiveRegularPolls = (): PersistedPollState[] => getKeysByPrefix(REGULAR_POLL_PREFIX)
  .map((key) => getData<PersistedPollState>(key))
  .filter((state): state is PersistedPollState => state !== null);

/** Clear a specific active poll from the store */
export const clearActivePoll = (
  type: PollType,
  messageId?: string,
): void => {
  if (type === "bumboy") deleteData(BUMBOY_POLL_KEY);
  else if (messageId) deleteData(`${REGULAR_POLL_PREFIX}${messageId}`);
};
