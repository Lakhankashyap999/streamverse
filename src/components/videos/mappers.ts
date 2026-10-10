import type { Highlight, Stream, Video } from '../../types';
import type { MediaItem } from './VideoGrid';

/** `channel` is the creator's YouTube channel URL from the profile (used when no video ID exists yet). */
const tab = (channel: string | null | undefined, path: string) => (channel ? `${channel.replace(/\/$/, '')}/${path}` : null);

export const videoToMedia = (v: Video, channel?: string | null): MediaItem => ({
  id: v.id,
  title: v.title,
  youtubeId: v.youtube_video_id,
  thumbnail: v.thumbnail_url,
  fallbackUrl: tab(channel, 'streams'),
  category: v.category,
  date: v.published_at ?? v.created_at,
  duration: v.duration_label,
  description: v.description,
  isSample: v.is_sample,
  featured: v.is_featured,
});

export const highlightToMedia = (h: Highlight, channel?: string | null): MediaItem => ({
  id: h.id,
  title: h.title,
  youtubeId: h.youtube_video_id,
  thumbnail: h.thumbnail_url,
  fallbackUrl: tab(channel, 'shorts'),
  category: h.category,
  description: h.description,
  isSample: h.is_sample,
  featured: h.is_featured,
});

export const streamToMedia = (s: Stream, channel?: string | null): MediaItem => ({
  id: s.id,
  title: s.title,
  youtubeId: s.youtube_video_id,
  thumbnail: s.thumbnail_url,
  fallbackUrl: s.stream_url ?? tab(channel, 'streams'),
  category: 'Livestream',
  date: s.scheduled_at,
  duration: s.duration_label,
  description: s.description,
  isSample: s.is_sample,
  featured: s.is_featured,
});
