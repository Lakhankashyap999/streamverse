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

// Shared across all callers so nested locks (e.g. drawer + modal) don't fight each other.
let scrollLockCount = 0;
let savedScrollY = 0;
let savedPath = '';
let savedStyles: { htmlOverflow: string; body: Partial<CSSStyleDeclaration> } | null = null;

/**
 * Locks body scroll while `locked` is true (drawers, modals).
 * `overflow: hidden` alone is ignored by iOS Safari and many Android browsers for
 * touch scrolling, so the body is pinned with `position: fixed` at the current
 * offset and restored to the exact same spot on unlock.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const body = document.body;

    if (scrollLockCount === 0) {
      savedScrollY = window.scrollY;
      savedPath = window.location.pathname;
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      savedStyles = {
        htmlOverflow: html.style.overflow,
        body: {
          overflow: body.style.overflow,
          position: body.style.position,
          top: body.style.top,
          left: body.style.left,
          right: body.style.right,
          width: body.style.width,
          paddingRight: body.style.paddingRight,
        },
      };
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${savedScrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    }
    scrollLockCount += 1;

    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount > 0 || !savedStyles) return;
      html.style.overflow = savedStyles.htmlOverflow;
      Object.assign(body.style, savedStyles.body);
      savedStyles = null;
      // If the user navigated to another page from inside the overlay, start that page at the top.
      const target = window.location.pathname === savedPath ? savedScrollY : 0;
      // Bypass the global `scroll-behavior: smooth` so the restore is instant (no visible jump).
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, target);
      html.style.scrollBehavior = prevBehavior;
    };
  }, [locked]);
}
