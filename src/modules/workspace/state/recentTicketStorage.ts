import {
  getBrowserStorage,
  type KeyValueStorage,
} from "@/shared/browser/safeStorage";

export const RECENT_TICKETS_STORAGE_KEY = "ticket-workspace:recent-ticket-ids";
export const RECENT_TICKETS_LIMIT = 3;

export const readRecentTicketIds = (
  storage: KeyValueStorage | null = getBrowserStorage(),
): string[] => {
  if(!storage) return [];
  const rawValue = storage?.getItem(RECENT_TICKETS_STORAGE_KEY);

  if(rawValue === null || rawValue === undefined) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  }
  catch {
    return [];
  }

  if(!Array.isArray(parsed)) return [];

  return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
};

export const rememberRecentTicketId = (
  ticketId: string,
  storage: KeyValueStorage | null = getBrowserStorage(),
) => {
  const recentIds = readRecentTicketIds(storage);
  const nextIds = [
    ticketId,
    ...recentIds.filter((recentId) => recentId !== ticketId),
  ].slice(0, RECENT_TICKETS_LIMIT);

  storage?.setItem(RECENT_TICKETS_STORAGE_KEY, JSON.stringify(nextIds));
};
