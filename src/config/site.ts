import type { Profile } from '../types';

/**
 * Default creator profile.
 *
 * Every value below was taken from the creator's public YouTube / Instagram
 * screenshots supplied for this concept. It is used until a profile row exists
 * in Supabase, and everything is editable from Dashboard → Profile.
 *
 * Intentionally left blank (truncated in the screenshots, so not guessed):
 *  - WhatsApp channel URL
 */
export const DEFAULT_PROFILE: Profile = {
  id: 'default-profile',
  gaming_name: 'KhushiYT',
  display_name: 'Khushi',
  handle: '@khusiytlive',
  tagline: 'Girl Gamer · BGMI Livestreamer',
  bio: 'Hello guys, welcome to my channel KhushiYT! I go live with long TOP 100 rank-push sessions and rush gameplay in Battlegrounds Mobile India. If you enjoy the streams, leave a like, subscribe and support the KhushiYT Family ❤️',
  avatar_url: '/images/creator/khushi-avatar-gamer.webp',
  banner_url: '/images/creator/khushi-banner-v2.jpg',
  youtube_url: 'https://www.youtube.com/@khusiytlive',
  instagram_url: 'https://www.instagram.com/igkhusi',
  discord_url: 'https://discord.gg/YrhMyQMsMX',
  whatsapp_url: null,
  membership_url: 'https://www.youtube.com/@khusiytlive/join',
  favourite_modes: ['TOP 100 Rank Push', 'Rush Gameplay', 'Squad Matches'],
  game_id: '5112658248',
  upi_id: '95997292@ybl',
  show_upi: true,
  country: 'India',
  journey:
    'Creating on YouTube since 22 March 2017. Today the channel is home to marathon BGMI livestreams — six-to-eight hour rank-push sessions full of rush gameplay, squad fights and fun with viewers.',
  setup: '',
  achievements: '',
  community_message: 'Thank you for being part of the KhushiYT Family ❤️ See you in the next stream!',
  live_status_mode: 'auto',
  stats_snapshot: {
    subscribers: '27.6K',
    videos: '1.1K',
    views: '1,964,194',
    instagram_followers: '9,416',
    as_of: '2026-10-10',
  },
  show_stats: true,
  created_at: '2026-10-10T00:00:00.000Z',
  updated_at: '2026-10-10T00:00:00.000Z',
};

export const SITE = {
  name: 'StreamVerse',
  communityName: 'KhushiYT Family',
  disclaimer:
    'Unofficial fan-made concept. Not affiliated with, endorsed or sponsored by KRAFTON, PUBG, Battlegrounds Mobile India (BGMI), YouTube or Google.',
  creatorTimezone: 'Asia/Kolkata',
} as const;

export const youtubeLiveUrl = (p: Profile) => (p.youtube_url ? `${p.youtube_url.replace(/\/$/, '')}/live` : null);
export const youtubeStreamsUrl = (p: Profile) => (p.youtube_url ? `${p.youtube_url.replace(/\/$/, '')}/streams` : null);
export const youtubeSubscribeUrl = (p?: Profile | null) => `${(p?.youtube_url ?? 'https://www.youtube.com/@khusiytlive').replace(/\/$/, '')}?sub_confirmation=1`;
