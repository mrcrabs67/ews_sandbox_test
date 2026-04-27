import { describe, expect, it } from "vitest";
import {
  RECENT_TICKETS_STORAGE_KEY,
  readRecentTicketIds,
  rememberRecentTicketId,
} from "./recentTicketStorage";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

describe("recentTicketStorage", () => {
  it("keeps the latest 3 unique ticket ids", () => {
    const storage = createMemoryStorage();

    rememberRecentTicketId("TCK-1001", storage);
    rememberRecentTicketId("TCK-1002", storage);
    rememberRecentTicketId("TCK-1003", storage);
    rememberRecentTicketId("TCK-1004", storage);
    rememberRecentTicketId("TCK-1002", storage);

    expect(
      JSON.parse(storage.getItem(RECENT_TICKETS_STORAGE_KEY) ?? "[]"),
    ).toEqual(["TCK-1002", "TCK-1004", "TCK-1003"]);
    expect(readRecentTicketIds(storage)).toEqual([
      "TCK-1002",
      "TCK-1004",
      "TCK-1003",
    ]);
  });
});

describe("readRecentTicketIds edge cases", () => {
  it("returns empty array for corrupted JSON", () => {
    const storage = createMemoryStorage();
    storage.setItem(RECENT_TICKETS_STORAGE_KEY, "invalid json");
    expect(readRecentTicketIds(storage)).toEqual([]);
  });

  it("returns empty array for non-array JSON", () => {
    const storage = createMemoryStorage();
    storage.setItem(
        RECENT_TICKETS_STORAGE_KEY,
        JSON.stringify({ some: "object" }),
    );
    expect(readRecentTicketIds(storage)).toEqual([]);
  });

  it("returns empty array for null JSON", () => {
    const storage = createMemoryStorage();
    storage.setItem(RECENT_TICKETS_STORAGE_KEY, "null");
    expect(readRecentTicketIds(storage)).toEqual([]);
  });

  it("filters out empty and non-string items", () => {
    const storage = createMemoryStorage();
    storage.setItem(
        RECENT_TICKETS_STORAGE_KEY,
        JSON.stringify(["TCK-1001", "", 123, "TCK-1002"]),
    );
    expect(readRecentTicketIds(storage)).toEqual(["TCK-1001", "TCK-1002"]);
  });

  it("returns empty array when storage is missing", () => {
    expect(readRecentTicketIds(null)).toEqual([]);
  });
});
