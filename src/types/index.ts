/** Shared domain types. Field names mirror the Supabase (snake_case) schema. */

export interface Timestamps {
  created_at: string;
  updated_at?: string;
}

/** Marks demonstration records so the UI can label them clearly. */
export interface SampleFlag {
  is_sample?: boolean;
}

export interface StatsSnapshot {
  subscribers?: string;
  videos?: string;
  views?: string;
  instagram_followers?: string;
  as_of?: string;
}

export type LiveStatusMode = 'auto' | 'live' | 'offline';

export interface Profile extends Timestamps {
  id: string;
  gaming_name: string;
  display_name: string | null;
  handle: string | null;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  discord_url: string | null;
  whatsapp_url: string | null;
  membership_url: string | null;
  favourite_modes: string[];
  game_id: string | null;
  upi_id: string | null;
  show_upi: boolean;
  country: string | null;
  journey: string | null;
  setup: string | null;
  achievements: string | null;
  community_message: string | null;
  live_status_mode: LiveStatusMode;
  stats_snapshot: StatsSnapshot | null;
  show_stats: boolean;
}

export const VIDEO_CATEGORIES = ['Live Stream', 'Rank Push', 'Rush Gameplay', 'Squad', 'Funny', 'Tips', 'Other'] as const;

export interface Video extends Timestamps, SampleFlag {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  thumbnail_url: string | null;
  category: string | null;
  duration_label: string | null;
  published_at: string | null;
  is_published: boolean;
  is_featured: boolean;
}

export const STREAM_STATUSES = ['scheduled', 'live', 'completed', 'archived', 'cancelled'] as const;
export type StreamStatus = (typeof STREAM_STATUSES)[number];

export interface Stream extends Timestamps, SampleFlag {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  stream_url: string | null;
  thumbnail_url: string | null;
  scheduled_at: string | null;
  timezone: string;
  status: StreamStatus;
  duration_label: string | null;
  is_published: boolean;
  is_featured: boolean;
}

export const HIGHLIGHT_CATEGORIES = ['Funny Moments', 'Best Clutches', 'Squad Gameplay', 'Challenges', 'Favourite Clips'] as const;
export type HighlightCategory = (typeof HIGHLIGHT_CATEGORIES)[number];

export interface Highlight extends Timestamps, SampleFlag {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  thumbnail_url: string | null;
  category: HighlightCategory | null;
  is_featured: boolean;
  is_published: boolean;
}

export interface PollOption {
  id: string;
  label: string;
}

export const POLL_STATUSES = ['draft', 'active', 'closed', 'archived'] as const;
export type PollStatus = (typeof POLL_STATUSES)[number];
export type ResultsVisibility = 'always' | 'after_vote' | 'after_close';

export interface Poll extends Timestamps, SampleFlag {
  id: string;
  question: string;
  options: PollOption[];
  starts_at: string | null;
  ends_at: string | null;
  status: PollStatus;
  results_visibility: ResultsVisibility;
}

export interface PollResult {
  option_id: string;
  votes: number;
}

export const SUGGESTION_TYPES = [
  { value: 'stream_idea', label: 'Stream idea' },
  { value: 'challenge', label: 'Gaming challenge' },
  { value: 'video', label: 'Video suggestion' },
] as const;
export type SuggestionType = (typeof SUGGESTION_TYPES)[number]['value'];
export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface Suggestion extends SampleFlag {
  id: string;
  type: SuggestionType;
  message: string;
  display_name: string | null;
  status: SuggestionStatus;
  is_published: boolean;
  created_at: string;
  reviewed_at: string | null;
}

export type CommunityPostKind = 'announcement' | 'challenge' | 'match';
export type CommunityPostStatus = 'upcoming' | 'open' | 'closed';

export interface CommunityPost extends Timestamps, SampleFlag {
  id: string;
  kind: CommunityPostKind;
  title: string;
  body: string | null;
  rules: string | null;
  closes_at: string | null;
  status: CommunityPostStatus;
  registration_open: boolean;
  registration_url: string | null;
  is_published: boolean;
}

export const ENQUIRY_TYPES = ['Sponsorship', 'Collaboration', 'Event / Tournament', 'Media', 'Other'] as const;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  enquiry_type: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
}

export interface YouTubeVideoInfo {
  id: string;
  available: boolean;
  title?: string;
  publishedAt?: string;
  thumbnail?: string;
  liveBroadcastContent?: 'live' | 'upcoming' | 'none';
  scheduledStartTime?: string;
  duration?: string;
}
