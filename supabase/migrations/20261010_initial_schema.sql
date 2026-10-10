-- ============================================================================
-- STREAMVERSE: Production PostgreSQL Database Schema & Security Migrations
-- Designed for Supabase with Row Level Security (RLS) & Stored Procedures
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. CREATOR ACCOUNTS TABLE (Authorisation control)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.creator_accounts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.creator_accounts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_creator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.creator_accounts
    WHERE user_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gaming_name TEXT NOT NULL,
  display_name TEXT,
  handle TEXT,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  discord_url TEXT,
  whatsapp_url TEXT,
  membership_url TEXT,
  favourite_modes TEXT[] NOT NULL DEFAULT '{}',
  game_id TEXT,
  upi_id TEXT,
  show_upi BOOLEAN NOT NULL DEFAULT TRUE,
  country TEXT,
  journey TEXT,
  setup TEXT,
  achievements TEXT,
  community_message TEXT,
  live_status_mode TEXT NOT NULL DEFAULT 'auto' CHECK (live_status_mode IN ('auto', 'live', 'offline')),
  stats_snapshot JSONB,
  show_stats BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read the public creator profile
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Only verified creator account can edit the profile
CREATE POLICY "Creator can insert/update profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

-- ----------------------------------------------------------------------------
-- 3. VIDEOS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  duration_label TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_videos_published ON public.videos(is_published, published_at DESC);

CREATE POLICY "Public can view published videos"
  ON public.videos FOR SELECT
  USING (is_published = true);

CREATE POLICY "Creator has full access to videos"
  ON public.videos FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

-- ----------------------------------------------------------------------------
-- 4. STREAMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT,
  stream_url TEXT,
  thumbnail_url TEXT,
  scheduled_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'completed', 'archived', 'cancelled')),
  duration_label TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_streams_schedule ON public.streams(status, scheduled_at DESC);

CREATE POLICY "Public can view published non-archived streams"
  ON public.streams FOR SELECT
  USING (is_published = true AND status != 'archived');

CREATE POLICY "Creator has full access to streams"
  ON public.streams FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

-- ----------------------------------------------------------------------------
-- 5. HIGHLIGHTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_highlights_cat ON public.highlights(category, is_published);

CREATE POLICY "Public can view published highlights"
  ON public.highlights FOR SELECT
  USING (is_published = true);

CREATE POLICY "Creator has full access to highlights"
  ON public.highlights FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

-- ----------------------------------------------------------------------------
-- 6. POLLS & VOTES TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  results_visibility TEXT NOT NULL DEFAULT 'after_vote' CHECK (results_visibility IN ('always', 'after_vote', 'after_close')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active or closed polls"
  ON public.polls FOR SELECT
  USING (status IN ('active', 'closed'));

CREATE POLICY "Creator has full access to polls"
  ON public.polls FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  voter_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(poll_id, voter_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Voters can never read arbitrary votes directly
CREATE POLICY "Voters can read only their own vote"
  ON public.poll_votes FOR SELECT
  TO authenticated
  USING (voter_id = auth.uid());

CREATE POLICY "Creator can inspect vote records"
  ON public.poll_votes FOR SELECT
  TO authenticated
  USING (public.is_creator());

-- Stored procedure to vote securely
CREATE OR REPLACE FUNCTION public.cast_vote(p_poll_id UUID, p_option_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_voter UUID := auth.uid();
  v_poll RECORD;
  v_opt_exists BOOLEAN;
BEGIN
  IF v_voter IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO v_poll FROM public.polls WHERE id = p_poll_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'poll_not_found';
  END IF;

  IF v_poll.status != 'active' OR (v_poll.ends_at IS NOT NULL AND v_poll.ends_at <= NOW()) THEN
    RAISE EXCEPTION 'poll_closed';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_poll.options) AS opt
    WHERE opt->>'id' = p_option_id
  ) INTO v_opt_exists;

  IF NOT v_opt_exists THEN
    RAISE EXCEPTION 'invalid_option';
  END IF;

  IF EXISTS (SELECT 1 FROM public.poll_votes WHERE poll_id = p_poll_id AND voter_id = v_voter) THEN
    RAISE EXCEPTION 'already_voted';
  END IF;

  INSERT INTO public.poll_votes(poll_id, option_id, voter_id)
  VALUES (p_poll_id, p_option_id, v_voter);
END;
$$;

-- Stored procedure to get poll results according to poll visibility rules
CREATE OR REPLACE FUNCTION public.get_poll_results(p_poll_id UUID)
RETURNS TABLE(option_id TEXT, votes BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_poll RECORD;
  v_voter UUID := auth.uid();
  v_has_voted BOOLEAN;
BEGIN
  SELECT * INTO v_poll FROM public.polls WHERE id = p_poll_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF public.is_creator() THEN
    -- Creator can always view results
    RETURN QUERY
    SELECT pv.option_id, COUNT(*) FROM public.poll_votes pv
    WHERE pv.poll_id = p_poll_id GROUP BY pv.option_id;
    RETURN;
  END IF;

  IF v_poll.results_visibility = 'always' THEN
    RETURN QUERY
    SELECT pv.option_id, COUNT(*) FROM public.poll_votes pv
    WHERE pv.poll_id = p_poll_id GROUP BY pv.option_id;
    RETURN;
  END IF;

  IF v_poll.results_visibility = 'after_close' AND (v_poll.status = 'closed' OR (v_poll.ends_at IS NOT NULL AND v_poll.ends_at <= NOW())) THEN
    RETURN QUERY
    SELECT pv.option_id, COUNT(*) FROM public.poll_votes pv
    WHERE pv.poll_id = p_poll_id GROUP BY pv.option_id;
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.poll_votes WHERE poll_id = p_poll_id AND voter_id = v_voter
  ) INTO v_has_voted;

  IF v_poll.results_visibility = 'after_vote' AND v_has_voted THEN
    RETURN QUERY
    SELECT pv.option_id, COUNT(*) FROM public.poll_votes pv
    WHERE pv.poll_id = p_poll_id GROUP BY pv.option_id;
    RETURN;
  END IF;

  -- Results hidden according to configured rules
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.my_poll_vote(p_poll_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT option_id FROM public.poll_votes
  WHERE poll_id = p_poll_id AND voter_id = auth.uid()
  LIMIT 1;
$$;

-- ----------------------------------------------------------------------------
-- 7. FAN SUGGESTIONS TABLE (Private until approved)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'stream_idea' CHECK (type IN ('stream_idea', 'challenge', 'video')),
  message TEXT NOT NULL,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved and published suggestions"
  ON public.suggestions FOR SELECT
  USING (status = 'approved' AND is_published = true);

CREATE POLICY "Creator has full access to suggestions"
  ON public.suggestions FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

CREATE OR REPLACE FUNCTION public.submit_suggestion(p_type TEXT, p_message TEXT, p_display_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF LENGTH(TRIM(p_message)) < 10 OR LENGTH(TRIM(p_message)) > 600 THEN
    RAISE EXCEPTION 'invalid_message_length';
  END IF;

  INSERT INTO public.suggestions(type, message, display_name, status, is_published)
  VALUES (p_type, TRIM(p_message), NULLIF(TRIM(p_display_name), ''), 'pending', false);
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. COMMUNITY POSTS (Challenges, Announcements, Matches)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('announcement', 'challenge', 'match')),
  title TEXT NOT NULL,
  body TEXT,
  rules TEXT,
  closes_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('upcoming', 'open', 'closed')),
  registration_open BOOLEAN NOT NULL DEFAULT FALSE,
  registration_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published community posts"
  ON public.community_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Creator has full access to community posts"
  ON public.community_posts FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

-- ----------------------------------------------------------------------------
-- 9. CONTACT MESSAGES (Business inquiries)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  enquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creator can view and manage contact messages"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (public.is_creator())
  WITH CHECK (public.is_creator());

CREATE OR REPLACE FUNCTION public.submit_contact(p_name TEXT, p_email TEXT, p_enquiry_type TEXT, p_message TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_message)) < 20 THEN
    RAISE EXCEPTION 'invalid_input';
  END IF;

  INSERT INTO public.contact_messages(name, email, enquiry_type, message, status)
  VALUES (TRIM(p_name), TRIM(p_email), p_enquiry_type, TRIM(p_message), 'new');
END;
$$;
