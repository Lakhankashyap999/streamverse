export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Converts unknown errors into friendly text without leaking internals. */
export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof Error && err.name === 'FriendlyError') return err.message;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return "You're offline. Check your connection and try again.";
  return fallback;
}

export class FriendlyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FriendlyError';
  }
}

/**
 * Checks if the current time in Indian Standard Time (IST) falls within
 * KhushiYT's daily scheduled livestream hours: 10:00 PM (22:00) to 5:00 AM (05:00) IST.
 */
export function isScheduledLiveTime(date: Date = new Date()): boolean {
  try {
    const istParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(date);

    const h = parseInt(istParts.find((p) => p.type === 'hour')?.value ?? '0', 10);
    const m = parseInt(istParts.find((p) => p.type === 'minute')?.value ?? '0', 10);
    const totalMinutes = h * 60 + m;

    // 10:00 PM (22:00 = 1320 min) to 5:00 AM (05:00 = 300 min)
    return totalMinutes >= 1320 || totalMinutes < 300;
  } catch {
    // Fallback using raw UTC+5:30 math
    const utcMs = date.getTime();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcMs + istOffsetMs);
    const h = istDate.getUTCHours();
    const m = istDate.getUTCMinutes();
    const totalMinutes = h * 60 + m;
    return totalMinutes >= 1320 || totalMinutes < 300;
  }
}
