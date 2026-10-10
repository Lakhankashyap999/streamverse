/** YouTube URL parsing + validation. Only official YouTube hosts are accepted. */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

export function isValidVideoId(id: string | null | undefined): id is string {
  return typeof id === 'string' && ID_RE.test(id);
}

export type YouTubeParseResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'empty' | 'invalid_url' | 'unsupported_host' | 'no_video_id' };

/**
 * Extracts a video ID from supported formats:
 * watch?v=, youtu.be/, /live/, /shorts/, /embed/, /v/ — or a bare 11-character ID.
 */
export function parseYouTubeUrl(raw: string | null | undefined): YouTubeParseResult {
  const input = (raw ?? '').trim();
  if (!input) return { ok: false, reason: 'empty' };
  if (isValidVideoId(input)) return { ok: true, id: input };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return { ok: false, reason: 'invalid_url' };
  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) return { ok: false, reason: 'unsupported_host' };

  let candidate: string | null = null;
  if (host.endsWith('youtu.be')) {
    candidate = url.pathname.split('/')[1] ?? null;
  } else if (url.pathname === '/watch') {
    candidate = url.searchParams.get('v');
  } else {
    const m = url.pathname.match(/^\/(?:live|shorts|embed|v)\/([^/?#]+)/);
    candidate = m?.[1] ?? null;
  }
  return isValidVideoId(candidate) ? { ok: true, id: candidate } : { ok: false, reason: 'no_video_id' };
}

export function youTubeErrorMessage(reason: Exclude<YouTubeParseResult, { ok: true }>['reason']): string {
  switch (reason) {
    case 'empty':
      return 'Please paste a YouTube link.';
    case 'invalid_url':
      return "That doesn't look like a valid link.";
    case 'unsupported_host':
      return 'Only youtube.com and youtu.be links are supported.';
    case 'no_video_id':
      return "We couldn't find a video in that link. Use a video, live or shorts URL.";
  }
}

export const ytThumb = (id: string, quality: 'hq' | 'mq' | 'maxres' = 'hq') =>
  `https://i.ytimg.com/vi/${id}/${quality === 'maxres' ? 'maxresdefault' : `${quality}default`}.jpg`;

export const ytWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Privacy-enhanced embed. Only loaded after an explicit user click. */
export const ytEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

/** ISO-8601 duration (PT1H2M3S) → 1:02:03 */
export function formatIsoDuration(iso?: string | null): string | null {
  if (!iso) return null;
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const h = Number(m[1] ?? 0) * 24 + Number(m[2] ?? 0);
  const min = Number(m[3] ?? 0);
  const s = Number(m[4] ?? 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}
