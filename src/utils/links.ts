/** External-link safety helpers. */

export function safeExternalUrl(raw: string | null | undefined, allowedHosts?: string[]): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (allowedHosts && allowedHosts.length) {
    const host = url.hostname.toLowerCase();
    const ok = allowedHosts.some((h) => host === h || host.endsWith(`.${h}`));
    if (!ok) return null;
  }
  return url.toString();
}

export const SOCIAL_HOSTS = {
  youtube: ['youtube.com', 'youtu.be'],
  instagram: ['instagram.com'],
  discord: ['discord.gg', 'discord.com'],
  whatsapp: ['whatsapp.com', 'wa.me'],
} as const;

export function isSafeHttpsUrl(raw: string | null | undefined, hosts?: readonly string[]): boolean {
  return safeExternalUrl(raw, hosts ? [...hosts] : undefined) !== null;
}

/** Allows local /images paths, https URLs and data: images produced by our own uploader. */
export function safeImageSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith('/')) return raw.startsWith('//') ? null : raw;
  if (raw.startsWith('data:image/')) return raw;
  return safeExternalUrl(raw);
}
