import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_PROFILE } from '../config/site';
import { profileService } from '../services/profileService';
import type { Profile } from '../types';

interface ProfileContextValue {
  profile: Profile;
  ready: boolean;
  setProfile(p: Profile): void;
  reload(): Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const p = await profileService.get();
    setProfile(p);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return <ProfileContext.Provider value={{ profile, ready, setProfile, reload }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
