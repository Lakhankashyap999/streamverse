import { useCallback, useEffect, useRef, useState } from 'react';
import { friendlyError } from '../utils/misc';

/** Loads async data with loading / error / reload handling. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fnRef.current());
    } catch (e) {
      setError(friendlyError(e, "We couldn't load this content right now."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error, reload: run };
}

/** Countdown to an ISO date; returns null once reached. */
export function useCountdown(target: string | null | undefined) {
  const calc = useCallback(() => {
    if (!target) return null;
    const diff = new Date(target).getTime() - Date.now();
    if (Number.isNaN(diff) || diff <= 0) return null;
    return {
      days: Math.floor(diff / 864e5),
      hours: Math.floor((diff / 36e5) % 24),
      minutes: Math.floor((diff / 6e4) % 60),
      seconds: Math.floor((diff / 1e3) % 60),
    };
  }, [target]);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);
  return left;
}

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · KhushiYT` : 'KhushiYT · StreamVerse';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

/** Locks body scroll while `locked` is true (drawers, modals). */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
