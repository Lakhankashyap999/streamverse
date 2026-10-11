import type { CommunityPost, Highlight, Poll, Stream, Suggestion, Video } from '../types';
import { getDailyStreamTime } from '../utils/date';

/**
 * DEMO DATA — shown only when Supabase is not configured.
 * Every record has `is_sample: true` and is labelled "Sample" in the UI.
 * Stream titles/durations/thumbnails come from the creator's channel screenshot,
 * but the real YouTube video IDs were not provided, so watch links point to the
 * channel's Live tab until real links are added from the dashboard.
 * No view counts, votes or engagement numbers are fabricated.
 */

const H = 36e5;
const now = Date.now();
const iso = (ms: number) => new Date(ms).toISOString();

const TITLE = 'TOP 100 RankPush With Rush Gameplay 🔴 | BGMI';
const durations = ['6:04:53', '7:06:50', '6:33:30', '7:52:09', '7:44:39'];
const ago = [16 * H, 26 * H, 50 * H, 74 * H, 98 * H];

const base = { created_at: iso(now - 120 * H), updated_at: iso(now - 120 * H), is_sample: true } as const;

export const demoStreams: Stream[] = [
  ...durations.map<Stream>((dur, i) => ({
    ...base,
    id: `demo-stream-past-${i + 1}`,
    title: TITLE,
    description: 'Marathon rank-push livestream with rush gameplay. (Sample — add the real YouTube link from the dashboard.)',
    youtube_video_id: null,
    stream_url: 'https://www.youtube.com/@khusiytlive/streams',
    thumbnail_url: i === 0 ? '/images/creator/pubg-stream-thumbnail-hd.webp' : `/images/creator/stream-thumb-${i + 1}.webp`,
    scheduled_at: iso(now - ago[i]),
    timezone: 'Asia/Kolkata',
    status: 'completed',
    duration_label: dur,
    is_published: true,
    is_featured: i === 0,
  })),
  {
    ...base,
    id: 'demo-stream-next-1',
    title: 'Daily BGMI Rank Push & Rush Gameplay — 10 PM IST',
    description: 'Every night at 10:00 PM IST — marathon rank pushes, viewer custom rooms, and squad clutches.',
    youtube_video_id: null,
    stream_url: 'https://www.youtube.com/@khusiytlive/live',
    thumbnail_url: '/images/creator/pubg-stream-thumbnail-hd.webp',
    scheduled_at: getDailyStreamTime(0),
    timezone: 'Asia/Kolkata',
    status: 'scheduled',
    duration_label: null,
    is_published: true,
    is_featured: true,
  },
  {
    ...base,
    id: 'demo-stream-next-2',
    title: 'Squad Rush & Custom Rooms Night — 10 PM IST',
    description: 'High-kill squad rush matches, viewer custom rooms, and Conqueror rank push.',
    youtube_video_id: null,
    stream_url: 'https://www.youtube.com/@khusiytlive/live',
    thumbnail_url: '/images/creator/stream-thumb-4.webp',
    scheduled_at: getDailyStreamTime(1),
    timezone: 'Asia/Kolkata',
    status: 'scheduled',
    duration_label: null,
    is_published: true,
    is_featured: false,
  },
];

export const demoVideos: Video[] = durations.map<Video>((dur, i) => ({
  ...base,
  id: `demo-video-${i + 1}`,
  title: TITLE,
  description: 'Full livestream replay. (Sample — the real video link has not been added yet.)',
  youtube_video_id: '',
  thumbnail_url: i === 0 ? '/images/creator/pubg-stream-thumbnail-hd.webp' : `/images/creator/stream-thumb-${i + 1}.webp`,
  category: 'Live Stream',
  duration_label: dur,
  published_at: iso(now - ago[i]),
  is_published: true,
  is_featured: i < 2,
}));

export const demoHighlights: Highlight[] = [
  { t: 'Sacred Trident Power Found! 🔱', c: 'Challenges', img: 'thumb-ocean-trident.jpg' },
  { t: '1v4 Clutch Inside Water Sphere 🔴', c: 'Best Clutches', img: 'thumb-ocean-clutch.jpg' },
  { t: 'Flying Stingray Flight Across Ocean Bay 🌊', c: 'Squad Gameplay', img: 'thumb-ocean-stingray.jpg' },
  { t: 'Colossal Ocean Dragon Boss Fight 🐉', c: 'Favourite Clips', img: 'thumb-ocean-dragon.jpg' },
  { t: 'AWM Glacier 8x Scope Water Leap Headshot 🎯', c: 'Best Clutches', img: 'thumb-ocean-sniper.jpg' },
  { t: 'Winner Winner Chicken Dinner - Ocean Conqueror 🏆', c: 'Challenges', img: 'thumb-ocean-victory.jpg' },
].map<Highlight>((h, i) => ({
  ...base,
  id: `demo-highlight-${i + 1}`,
  title: h.t,
  description: 'Ocean Odyssey water event highlight clip — watch marathon clutches and rank push gameplay.',
  youtube_video_id: '',
  thumbnail_url: `/images/thumbnails/${h.img}`,
  category: h.c as Highlight['category'],
  is_featured: i < 3,
  is_published: true,
}));

export const demoPolls: Poll[] = [
  {
    ...base,
    id: 'demo-poll-1',
    question: 'What should the next weekend stream be?',
    options: [
      { id: 'a', label: 'TOP 100 Rank Push marathon' },
      { id: 'b', label: 'Squad rush challenge' },
      { id: 'c', label: 'Chill classic matches' },
      { id: 'd', label: 'Custom rooms with viewers' },
    ],
    starts_at: iso(now - 24 * H),
    ends_at: iso(now + 6 * 24 * H),
    status: 'active',
    results_visibility: 'after_vote',
  },
];

export const demoCommunityPosts: CommunityPost[] = [
  {
    ...base,
    id: 'demo-post-1',
    kind: 'announcement',
    title: 'Welcome to the KhushiYT Family hub',
    body: 'This is a sample announcement. Stream news and updates from Khushi will appear here once published.',
    rules: null,
    closes_at: null,
    status: 'open',
    registration_open: false,
    registration_url: null,
    is_published: true,
  },
  {
    ...base,
    id: 'demo-post-2',
    kind: 'challenge',
    title: 'Pistol-Only Chicken Dinner',
    body: 'Sample challenge: can you win a classic match using only pistols? Share your clip on Discord.',
    rules: 'Classic mode only\nPistols and melee only after landing\nPost clips in the Discord challenge channel',
    closes_at: iso(now + 10 * 24 * H),
    status: 'open',
    registration_open: false,
    registration_url: null,
    is_published: true,
  },
  {
    ...base,
    id: 'demo-post-3',
    kind: 'match',
    title: 'Community Custom Room',
    body: 'Sample event card. Registration stays closed until Khushi officially announces a community match.',
    rules: null,
    closes_at: null,
    status: 'upcoming',
    registration_open: false,
    registration_url: null,
    is_published: true,
  },
];

export const demoSuggestions: Suggestion[] = [
  {
    id: 'demo-suggestion-1',
    type: 'stream_idea',
    message: 'Sample suggestion: a full squad rush stream where viewers vote on the drop location.',
    display_name: 'Sample visitor',
    status: 'pending',
    is_published: false,
    created_at: iso(now - 5 * H),
    reviewed_at: null,
    is_sample: true,
  },
];
