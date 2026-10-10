import { DEFAULT_PROFILE } from '../config/site';
import {
  demoCommunityPosts,
  demoHighlights,
  demoPolls,
  demoStreams,
  demoSuggestions,
  demoVideos,
} from '../data/demoData';

/** localStorage-backed store used only in DEMO MODE (no Supabase configured). */

const PREFIX = 'sv-demo-v1:';

const seeds = {
  profiles: () => [DEFAULT_PROFILE],
  videos: () => demoVideos,
  streams: () => demoStreams,
  highlights: () => demoHighlights,
  polls: () => demoPolls,
  community_posts: () => demoCommunityPosts,
  suggestions: () => demoSuggestions,
  contact_messages: () => [],
  poll_votes: () => [],
} satisfies Record<string, () => unknown[]>;

export type DemoTable = keyof typeof seeds;

const canUseStorage = () => {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const memory = new Map<string, unknown[]>();

export const demoStore = {
  read<T>(table: DemoTable): T[] {
    if (memory.has(table)) return memory.get(table) as T[];
    let rows: unknown[] | null = null;
    if (canUseStorage()) {
      try {
        const raw = localStorage.getItem(PREFIX + table);
        if (raw) rows = JSON.parse(raw);
      } catch {
        rows = null;
      }
    }
    const value = (Array.isArray(rows) ? rows : seeds[table]()) as T[];
    memory.set(table, value);
    return value;
  },
  write<T>(table: DemoTable, rows: T[]): void {
    memory.set(table, rows);
    if (canUseStorage()) {
      try {
        localStorage.setItem(PREFIX + table, JSON.stringify(rows));
      } catch {
        /* quota exceeded — keep in memory */
      }
    }
  },
  reset(): void {
    memory.clear();
    if (!canUseStorage()) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

/** Small artificial latency so loading states are visible in the demo. */
export const demoDelay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
