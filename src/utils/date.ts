/** Date helpers. Times are stored as absolute instants (timestamptz) and shown in the visitor's local zone. */

export function formatDateTime(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!iso) return 'Date to be announced';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Date to be announced';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    ...opts,
  }).format(d);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

/** Shows the creator's intended zone, e.g. "2:00 PM IST (creator time)". */
export function formatInZone(iso: string | null | undefined, timeZone: string): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      timeZone,
      timeZoneName: 'short',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diff)) return '';
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536e6],
    ['month', 2592e6],
    ['week', 6048e5],
    ['day', 864e5],
    ['hour', 36e5],
    ['minute', 6e4],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}

export function isFuture(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

/** <input type="datetime-local"> helpers (value is in the browser's local zone). */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Google Calendar "add event" link — no account data is shared with us. */
export function googleCalendarUrl(title: string, startIso: string, hours = 3, details = ''): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + hours * 36e5);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${fmt(start)}/${fmt(end)}`, details });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Calculates the next occurrence of Khushi's daily 10:00 PM IST livestream.
 * Returns ISO timestamp string in UTC.
 */
export function getNextDailyStreamTime(): string {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  const parts = Object.fromEntries(istFormatter.formatToParts(now).map((p) => [p.type, parseInt(p.value, 10)]));
  // 22:00 is 10:00 PM IST. If current IST hour is >= 22, next stream is tomorrow at 22:00 IST.
  const isPast10PM = parts.hour >= 22;
  // In UTC, 22:00 IST is 16:30 UTC
  const targetDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + (isPast10PM ? 1 : 0), 16, 30, 0));
  return targetDate.toISOString();
}
