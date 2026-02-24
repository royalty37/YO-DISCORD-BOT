import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveActivePoll,
  getActiveBumboyPoll,
  getActiveRegularPolls,
  clearActivePoll,
  PersistedPollState,
} from "./pollStore";

// Mock the fileStore module
vi.mock("../../fileStore", () => {
  const store: Record<string, unknown> = {};
  return {
    getData: vi.fn((key: string) => store[key] ?? null),
    setData: vi.fn((key: string, value: unknown) => {
      store[key] = value;
    }),
    deleteData: vi.fn((key: string) => {
      delete store[key];
    }),
    getKeysByPrefix: vi.fn((prefix: string) =>
      Object.keys(store).filter((key) => key.startsWith(prefix)),
    ),
    __store: store,
  };
});

const basePollState: PersistedPollState = {
  type: "bumboy",
  messageId: "msg123",
  channelId: "ch456",
  initiatorUsername: "testuser",
  endTime: new Date(Date.now() + 3600000).toISOString(),
  voteCounts: [0, 0, 0],
  singleVotes: {},
  multiVotes: {},
  includedMemberIds: ["a", "b", "c"],
};

describe("pollStore", () => {
  let mockStore: Record<string, unknown>;

  beforeEach(async () => {
    const fileStore = await import("../../fileStore");
    mockStore = (fileStore as any).__store;
    for (const key of Object.keys(mockStore)) {
      delete mockStore[key];
    }
  });

  describe("bumboy polls", () => {
    it("saves and retrieves a bumboy poll", () => {
      saveActivePoll(basePollState);
      const result = getActiveBumboyPoll();

      expect(result).not.toBeNull();
      expect(result!.type).toBe("bumboy");
      expect(result!.messageId).toBe("msg123");
    });

    it("returns null when no bumboy poll is saved", () => {
      expect(getActiveBumboyPoll()).toBeNull();
    });

    it("clears a bumboy poll", () => {
      saveActivePoll(basePollState);
      expect(getActiveBumboyPoll()).not.toBeNull();

      clearActivePoll("bumboy");
      expect(getActiveBumboyPoll()).toBeNull();
    });
  });

  describe("regular polls", () => {
    const regularPoll1: PersistedPollState = {
      ...basePollState,
      type: "regular",
      messageId: "regular1",
      question: "Cats or dogs?",
      options: ["Cats", "Dogs"],
      allowMultiVote: false,
    };

    const regularPoll2: PersistedPollState = {
      ...basePollState,
      type: "regular",
      messageId: "regular2",
      question: "Pizza or pasta?",
      options: ["Pizza", "Pasta"],
      allowMultiVote: true,
    };

    it("saves and retrieves multiple regular polls", () => {
      saveActivePoll(regularPoll1);
      saveActivePoll(regularPoll2);

      const results = getActiveRegularPolls();
      expect(results).toHaveLength(2);
      expect(results.map((p) => p.messageId)).toContain("regular1");
      expect(results.map((p) => p.messageId)).toContain("regular2");
    });

    it("returns empty array when no regular polls exist", () => {
      expect(getActiveRegularPolls()).toEqual([]);
    });

    it("clears a specific regular poll by messageId", () => {
      saveActivePoll(regularPoll1);
      saveActivePoll(regularPoll2);

      clearActivePoll("regular", "regular1");

      const results = getActiveRegularPolls();
      expect(results).toHaveLength(1);
      expect(results[0].messageId).toBe("regular2");
    });

    it("does not affect bumboy polls when clearing regular polls", () => {
      saveActivePoll(basePollState);
      saveActivePoll(regularPoll1);

      clearActivePoll("regular", "regular1");

      expect(getActiveBumboyPoll()).not.toBeNull();
      expect(getActiveRegularPolls()).toEqual([]);
    });
  });

  describe("vote state persistence", () => {
    it("preserves vote counts when saving", () => {
      const state: PersistedPollState = {
        ...basePollState,
        voteCounts: [5, 3, 1],
        singleVotes: { user1: 0, user2: 1, user3: 0 },
      };
      saveActivePoll(state);

      const result = getActiveBumboyPoll()!;
      expect(result.voteCounts).toEqual([5, 3, 1]);
      expect(result.singleVotes).toEqual({ user1: 0, user2: 1, user3: 0 });
    });
  });
});
