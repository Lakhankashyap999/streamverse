import type { YouTubeVideoInfo } from '../types';
import { isValidVideoId } from '../utils/youtube';
import { logDev } from './crud';
import { supabase } from './supabaseClient';

/**
 * Talks to the `youtube` Supabase Edge Function, which holds the API key
 * server-side. Results are cached in sessionStorage to respect API quotas.
 * Every method resolves to `null` on failure so the UI can fall back gracefully.
 */

const TTL = 10 * 60 * 1000;
const KEY = 'sv-yt-cache:';

function cacheGet<T>(k: string): T | null {
  try {
    const raw = sessionStorage.getItem(KEY + k);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw) as { t: number; v: T };
    return Date.now() - t < TTL ? v : null;
  } catch {
    return null;
  }
}
function cacheSet(k: string, v: unknown) {
  try {
    sessionStorage.setItem(KEY + k, JSON.stringify({ t: Date.now(), v }));
  } catch {
    /* ignore */
  }
}

export interface LatestUpload {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

export const youtubeService = {
  isAvailable: () => Boolean(supabase),

  async getVideos(ids: string[]): Promise<Record<string, YouTubeVideoInfo> | null> {
    const clean = [...new Set(ids.filter(isValidVideoId))].slice(0, 50);
    if (!supabase || clean.length === 0) return null;
    const cacheKey = `v:${clean.sort().join(',')}`;
    const cached = cacheGet<Record<string, YouTubeVideoInfo>>(cacheKey);
    if (cached) return cached;
    try {
      const { data, error } = await supabase.functions.invoke('youtube', { body: { action: 'videos', ids: clean } });
      if (error || !data?.items) throw error ?? new Error('bad response');
      const map: Record<string, YouTubeVideoInfo> = {};
      (data.items as YouTubeVideoInfo[]).forEach((i) => (map[i.id] = i));
      cacheSet(cacheKey, map);
      return map;
    } catch (e) {
      logDev(e);
      return null;
    }
  },

  async getLatestUploads(): Promise<LatestUpload[] | null> {
    if (!supabase) return null;
    const cached = cacheGet<LatestUpload[]>('latest');
    if (cached) return cached;
    try {
      const { data, error } = await supabase.functions.invoke('youtube', { body: { action: 'latest' } });
      if (error || !Array.isArray(data?.items)) throw error ?? new Error('bad response');
      cacheSet('latest', data.items);
      return data.items as LatestUpload[];
    } catch (e) {
      logDev(e);
      return null;
    }
  },
};
