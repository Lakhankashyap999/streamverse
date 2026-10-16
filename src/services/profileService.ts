import { DEFAULT_PROFILE } from '../config/site';
import type { Profile } from '../types';
import { FriendlyError } from '../utils/misc';
import { logDev } from './crud';
import { demoDelay, demoStore } from './demoStore';
import { supabase } from './supabaseClient';

export const profileService = {
  /** Single-creator v1: the first profile row is the public creator profile. */
  async get(): Promise<Profile> {
    if (!supabase) {
      const merged = { ...DEFAULT_PROFILE, ...(demoStore.read<Profile>('profiles')[0] ?? {}) };
      return normalizeBanner(merged);
    }
    const { data, error } = await supabase.from('profiles').select('*').order('created_at').limit(1).maybeSingle();
    if (error) {
      logDev(error);
      return DEFAULT_PROFILE; // graceful fallback keeps the public site usable
    }
    const merged = data ? { ...DEFAULT_PROFILE, ...stripNulls(data as Partial<Profile>) } : DEFAULT_PROFILE;
    return normalizeBanner(merged);
  },

  async save(patch: Partial<Profile>): Promise<Profile> {
    if (!supabase) {
      await demoDelay(200);
      const current = await profileService.get();
      const next = { ...current, ...patch, updated_at: new Date().toISOString() };
      demoStore.write('profiles', [next]);
      return next;
    }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new FriendlyError('Your session has expired. Please sign in again.');
    const { id: _ignored, created_at: _c, updated_at: _u, ...rest } = patch;
    void _ignored; void _c; void _u;
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...rest, id: auth.user.id }, { onConflict: 'id' })
      .select('*')
      .single();
    if (error) {
      logDev(error);
      throw new FriendlyError("Couldn't save your profile. Please try again.");
    }
    return { ...DEFAULT_PROFILE, ...stripNulls(data as Partial<Profile>) };
  },
};

/** Keep explicit empty strings, but let missing columns fall back to defaults. */
function stripNulls<T extends object>(row: T): Partial<T> {
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined)) as Partial<T>;
}

const LEGACY_BANNERS = new Set([
  '/images/creator/youtube-banner-hd.webp',
  '/images/creator/channel-banner.webp',
]);

function normalizeBanner(profile: Profile): Profile {
  if (!profile.banner_url || LEGACY_BANNERS.has(profile.banner_url)) {
    return { ...profile, banner_url: DEFAULT_PROFILE.banner_url };
  }
  return profile;
}
