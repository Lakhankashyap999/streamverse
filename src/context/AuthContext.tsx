import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { isDemoMode, supabase } from '../services/supabaseClient';
import { logDev } from '../services/crud';
import { FriendlyError } from '../utils/misc';

type Status = 'loading' | 'signedOut' | 'creator';

interface AuthContextValue {
  status: Status;
  email: string | null;
  demo: boolean;
  sessionExpired: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  enterDemo(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = 'sv-demo-auth';

/** Server-side authorisation check (creator_accounts table via SECURITY DEFINER fn). */
async function checkCreator(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_creator');
  if (error) {
    logDev(error);
    return false;
  }
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const manualSignOut = useRef(false);
  const wasCreator = useRef(false);

  useEffect(() => {
    if (isDemoMode || !supabase) {
      setStatus(sessionStorage.getItem(DEMO_KEY) === '1' ? 'creator' : 'signedOut');
      setEmail('demo@local');
      return;
    }
    let active = true;

    const evaluate = async () => {
      const { data } = await supabase!.auth.getSession();
      const user = data.session?.user;
      if (!user || user.is_anonymous) {
        if (active) setStatus('signedOut');
        return;
      }
      const ok = await checkCreator();
      if (!active) return;
      wasCreator.current = ok;
      setEmail(user.email ?? null);
      setStatus(ok ? 'creator' : 'signedOut');
    };
    void evaluate();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (wasCreator.current && !manualSignOut.current) setSessionExpired(true);
        manualSignOut.current = false;
        wasCreator.current = false;
        setStatus('signedOut');
        setEmail(null);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Defer to avoid calling Supabase inside the auth callback.
        setTimeout(() => void evaluate(), 0);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (mail: string, password: string) => {
    if (!supabase) throw new FriendlyError('Sign-in is not configured in demo mode.');
    const { data, error } = await supabase.auth.signInWithPassword({ email: mail.trim(), password });
    if (error || !data.user) throw new FriendlyError('Incorrect email or password.');
    const ok = await checkCreator();
    if (!ok) {
      manualSignOut.current = true;
      await supabase.auth.signOut();
      throw new FriendlyError('This account is not authorised to manage this website.');
    }
    wasCreator.current = true;
    setSessionExpired(false);
    setEmail(data.user.email ?? null);
    setStatus('creator');
  }, []);

  const signOut = useCallback(async () => {
    manualSignOut.current = true;
    if (!supabase) {
      sessionStorage.removeItem(DEMO_KEY);
      setStatus('signedOut');
      return;
    }
    await supabase.auth.signOut();
    setStatus('signedOut');
  }, []);

  const enterDemo = useCallback(() => {
    if (!isDemoMode) return;
    sessionStorage.setItem(DEMO_KEY, '1');
    setStatus('creator');
  }, []);

  const value = useMemo(
    () => ({ status, email, demo: isDemoMode, sessionExpired, signIn, signOut, enterDemo }),
    [status, email, sessionExpired, signIn, signOut, enterDemo],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
