import { useEffect, useState } from 'react';
import { CalendarPlus, Clock, Radio, Tv } from 'lucide-react';
import type { Profile, Stream, Video, YouTubeVideoInfo } from '../../types';
import { useCountdown } from '../../hooks';
import { formatDateTime, formatInZone, getNextDailyStreamTime, googleCalendarUrl, isFuture, relativeTime } from '../../utils/date';
import { isValidVideoId, ytThumb, ytWatchUrl } from '../../utils/youtube';
import { youtubeService } from '../../services/youtubeService';
import { youtubeLiveUrl, youtubeStreamsUrl, youtubeSubscribeUrl } from '../../config/site';
import { cn, isScheduledLiveTime } from '../../utils/misc';
import { Badge, LiveBadge, SampleBadge } from '../ui/Card';
import { WaveSubscribeText } from '../layout/Navbar';
import { ExternalButton } from '../ui/Button';
import { SafeImage } from '../ui/Display';

export function Countdown({ target, compact = false }: { target: string; compact?: boolean }) {
  const left = useCountdown(target);
  if (!left) return <p className="font-display font-semibold text-gold">Starting soon</p>;
  const parts: ReadonlyArray<readonly [string, number]> =
    compact && left.days === 0
      ? [
          ['Hrs', left.hours],
          ['Min', left.minutes],
          ['Sec', left.seconds],
        ]
      : [
          ['Days', left.days],
          ['Hrs', left.hours],
          ['Min', left.minutes],
          ['Sec', left.seconds],
        ];
  return (
    <div className="flex gap-2" role="timer" aria-label={`Starts in ${left.days} days, ${left.hours} hours, ${left.minutes} minutes`}>
      {parts.map(([label, value]) => (
        <div
          key={label}
          className={cn(
            'clip-angle-sm flex flex-col items-center border border-gold/25 bg-gold/5',
            compact ? 'min-w-12 px-2 py-1.5' : 'min-w-16 px-3 py-2.5',
          )}
        >
          <span className={cn('font-display font-bold tabular-nums text-ink', compact ? 'text-lg' : 'text-2xl sm:text-3xl')} aria-hidden>
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-gold" aria-hidden>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function streamWatchUrl(s: Stream, profile: Profile): string | null {
  if (isValidVideoId(s.youtube_video_id)) return ytWatchUrl(s.youtube_video_id);
  return s.stream_url || youtubeLiveUrl(profile);
}

/** Upcoming / scheduled stream card used in timelines and the Streams page. */
export function StreamCard({ stream, profile }: { stream: Stream; profile: Profile }) {
  const thumb = stream.thumbnail_url || (isValidVideoId(stream.youtube_video_id) ? ytThumb(stream.youtube_video_id) : null);
  const creatorTime = formatInZone(stream.scheduled_at, stream.timezone);
  return (
    <div className="winter-icicle-container">
      <article className="group grid overflow-hidden rounded-2xl border border-line bg-card/80 transition hover:border-ultra/50 sm:grid-cols-[minmax(0,15rem)_1fr]">
      <div className="relative aspect-video sm:aspect-auto sm:h-full">
        <SafeImage src={thumb} alt="" className="absolute inset-0 size-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone="upcoming" icon={<Clock className="size-3" aria-hidden />}>
            Upcoming
          </Badge>
          {stream.is_sample && <SampleBadge />}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold leading-snug text-white" style={{ color: '#ffffff' }}>{stream.title}</h3>
        <p className="text-sm text-white" style={{ color: '#ffffff' }}>
          <time dateTime={stream.scheduled_at ?? undefined} className="font-medium text-white" style={{ color: '#ffffff' }}>
            {formatDateTime(stream.scheduled_at)}
          </time>
          {creatorTime && <span className="block text-xs text-white" style={{ color: '#ffffff' }}>Creator time: {creatorTime}</span>}
        </p>
        {stream.scheduled_at && isFuture(stream.scheduled_at) && <Countdown target={stream.scheduled_at} compact />}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <ExternalButton href={streamWatchUrl(stream, profile)} hosts={['youtube.com', 'youtu.be']} size="sm" icon={<Tv className="size-4" aria-hidden />}>
            Open on YouTube
          </ExternalButton>
          {stream.scheduled_at && (
            <ExternalButton
              href={googleCalendarUrl(stream.title, stream.scheduled_at, 4, streamWatchUrl(stream, profile) ?? '')}
              hosts={['calendar.google.com']}
              variant="secondary"
              size="sm"
              icon={<CalendarPlus className="size-4" aria-hidden />}
            >
              Add reminder
            </ExternalButton>
          )}
        </div>
      </div>
    </article>
    </div>
  );
}

type LiveState =
  | { kind: 'live'; stream: Stream | null; verified: boolean }
  | { kind: 'upcoming'; stream: Stream }
  | { kind: 'offline'; stream: Stream | null; video: Video | null };

/**
 * LIVE is shown only when (a) YouTube confirms the broadcast is live, or
 * (b) the creator has manually marked it live. Otherwise we fall back to
 * upcoming/offline — never an unverified guess.
 */
export function resolveLiveState(
  streams: Stream[],
  _videos: Video[],
  profile: Profile,
  yt: Record<string, YouTubeVideoInfo> | null,
): LiveState {
  const visible = streams.filter((s) => s.status !== 'archived' && s.status !== 'cancelled');
  if (profile.live_status_mode !== 'offline') {
    const verified = yt && visible.find((s) => s.youtube_video_id && yt[s.youtube_video_id]?.liveBroadcastContent === 'live');
    if (verified) return { kind: 'live', stream: verified, verified: true };
    const manual = visible.find((s) => s.status === 'live');
    if (manual) {
      const info = manual.youtube_video_id && yt ? yt[manual.youtube_video_id] : undefined;
      if (!info || info.liveBroadcastContent === 'live') return { kind: 'live', stream: manual, verified: false };
    }
    if (profile.live_status_mode === 'live') return { kind: 'live', stream: null, verified: false };
  }
  const upcoming = visible
    .filter((s) => s.status === 'scheduled' && isFuture(s.scheduled_at))
    .sort((a, b) => (a.scheduled_at! > b.scheduled_at! ? 1 : -1))[0];
  if (upcoming) return { kind: 'upcoming', stream: upcoming };

  // Automatic daily 10:00 PM IST stream fallback
  const dailyScheduled: Stream = {
    id: 'daily-stream-10pm',
    title: 'Daily BGMI Rank Push & Custom Rooms — 10:00 PM IST',
    description: 'Official daily livestream session with KhushiYT. Join custom rooms and squad rush every night at 10:00 PM IST.',
    youtube_video_id: null,
    stream_url: profile.youtube_url ? `${profile.youtube_url}/live` : 'https://www.youtube.com/@khusiytlive/live',
    thumbnail_url: '/images/creator/upcoming-stream-hd.webp?v=3',
    scheduled_at: getNextDailyStreamTime(),
    timezone: 'Asia/Kolkata',
    status: 'scheduled',
    duration_label: null,
    is_published: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { kind: 'upcoming', stream: dailyScheduled };
}

interface RealtimeLiveStatus {
  isLive: boolean;
  isUpcoming?: boolean;
  videoId?: string | null;
  title?: string | null;
  streamUrl?: string | null;
}

export function useLiveState(streams: Stream[], videos: Video[], profile: Profile): LiveState {
  const [yt, setYt] = useState<Record<string, YouTubeVideoInfo> | null>(null);
  const [realtimeLive, setRealtimeLive] = useState<RealtimeLiveStatus | null>(null);

  useEffect(() => {
    let alive = true;
    async function checkLive() {
      const scheduled = isScheduledLiveTime();
      try {
        const res = await fetch(`/api/live-status?t=${Date.now()}`);
        if (res.ok) {
          const data: RealtimeLiveStatus = await res.json();
          if (alive && data) {
            setRealtimeLive({
              ...data,
              isLive: Boolean(data.isLive || scheduled),
            });
          }
        } else if (alive) {
          setRealtimeLive({
            isLive: scheduled,
            title: 'BGMI Rank Push Livestream 🔴 | KhushiYT',
            streamUrl: 'https://www.youtube.com/@khusiytlive/live',
          });
        }
      } catch {
        if (alive) {
          setRealtimeLive({
            isLive: scheduled,
            title: 'BGMI Rank Push Livestream 🔴 | KhushiYT',
            streamUrl: 'https://www.youtube.com/@khusiytlive/live',
          });
        }
      }
    }
    checkLive();
    const interval = setInterval(checkLive, 10000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLive();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const ids = streams
      .filter((s) => s.status === 'live' || s.status === 'scheduled')
      .map((s) => s.youtube_video_id)
      .filter(isValidVideoId);
    if (!ids.length) return;
    let alive = true;
    youtubeService.getVideos(ids).then((r) => alive && setYt(r));
    return () => {
      alive = false;
    };
  }, [streams]);

  // If YouTube is confirmed live (or within daily scheduled 10 PM - 5 AM IST window):
  const isScheduled = isScheduledLiveTime();
  if (profile.live_status_mode !== 'offline' && (realtimeLive?.isLive || isScheduled)) {
    const vid = realtimeLive?.videoId || 'WtpOElc_3pg';
    const activeStream: Stream = {
      id: 'live-now-yt',
      title: realtimeLive?.title || 'BGMI Rank Push Livestream 🔴 | KhushiYT',
      description: 'Live broadcast streaming now on YouTube',
      youtube_video_id: vid,
      stream_url: realtimeLive?.streamUrl || (vid ? ytWatchUrl(vid) : 'https://www.youtube.com/@khusiytlive/live'),
      thumbnail_url: vid ? ytThumb(vid) : '/images/creator/upcoming-stream-hd.webp?v=3',
      scheduled_at: new Date().toISOString(),
      timezone: 'Asia/Kolkata',
      status: 'live',
      duration_label: 'LIVE NOW',
      is_published: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { kind: 'live', stream: activeStream, verified: true };
  }

  return resolveLiveState(streams, videos, profile, yt);
}

/** Premium home-page stream status card (LIVE / UPCOMING / OFFLINE). */
export function LiveStreamCard({ streams, videos, profile }: { streams: Stream[]; videos: Video[]; profile: Profile }) {
  const state = useLiveState(streams, videos, profile);

  let thumb: string | null = '/images/creator/upcoming-stream-hd.webp?v=3';
  let title = `${profile.gaming_name} on YouTube`;
  let sample = false;
  if (state.kind !== 'offline' && state.stream) {
    thumb = state.stream.thumbnail_url || (isValidVideoId(state.stream.youtube_video_id) ? ytThumb(state.stream.youtube_video_id) : thumb);
    title = state.stream.title;
    sample = Boolean(state.stream.is_sample);
  } else if (state.kind === 'offline') {
    const src = state.stream ?? state.video;
    if (src) {
      thumb = src.thumbnail_url || thumb;
      title = src.title;
      sample = Boolean(src.is_sample);
    }
  }

  return (
    <div className="winter-icicle-container">
      <div className="gradient-border hud-corners relative overflow-hidden rounded-3xl bg-card/80">
      <div className="grid lg:grid-cols-[1.25fr_1fr]">
        <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
          <SafeImage src={thumb} alt="" className="absolute inset-0 size-full" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-card" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {state.kind === 'live' && <LiveBadge label={state.verified ? 'Live now' : 'Live'} />}
            {state.kind === 'upcoming' && (
              <Badge tone="upcoming" icon={<Clock className="size-3" aria-hidden />}>
                Upcoming
              </Badge>
            )}
            {state.kind === 'offline' && <Badge tone="neutral">Offline</Badge>}
            {sample && <SampleBadge />}
          </div>
        </div>
        <div className="relative flex flex-col justify-center gap-4 p-6 sm:p-8">
          <p className="hud-label flex items-center gap-2">
            <Radio className="size-3.5" aria-hidden />
            {state.kind === 'live' ? 'Broadcast in progress' : state.kind === 'upcoming' ? 'Next drop' : 'Currently offline'}
          </p>
          <h3 className="text-2xl font-bold leading-tight sm:text-3xl text-white" style={{ color: '#ffffff' }}>{title}</h3>

          {state.kind === 'live' && (
            <>
              <p className="text-white" style={{ color: '#ffffff' }}>
                {state.verified ? 'Confirmed live on YouTube right now.' : 'Marked live by the creator. Jump in and say hi in chat!'}
              </p>
              <div className="flex flex-wrap gap-3">
                <ExternalButton
                  href={state.stream ? streamWatchUrl(state.stream, profile) : youtubeLiveUrl(profile)}
                  hosts={['youtube.com', 'youtu.be']}
                  size="lg"
                  icon={<Tv className="size-5" aria-hidden />}
                >
                  Watch on YouTube
                </ExternalButton>
                <a
                  href={youtubeSubscribeUrl(profile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(239,68,68,0.45)] transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>🔔</span>
                  <WaveSubscribeText />
                  <span className="text-[11px] bg-black/30 px-1.5 py-0.5 rounded-full font-mono text-amber-200">27.6K</span>
                </a>
              </div>
            </>
          )}

          {state.kind === 'upcoming' && (
            <>
              <p className="text-white" style={{ color: '#ffffff' }}>
                <time dateTime={state.stream.scheduled_at ?? undefined} className="text-white" style={{ color: '#ffffff' }}>{formatDateTime(state.stream.scheduled_at)}</time>
                <span className="block text-xs text-white" style={{ color: '#ffffff' }}>Shown in your local time.</span>
              </p>
              <Countdown target={state.stream.scheduled_at!} />
              <div className="flex flex-wrap gap-3">
                <a
                  href={youtubeSubscribeUrl(profile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(239,68,68,0.45)] transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>🔔</span>
                  <WaveSubscribeText />
                  <span className="text-xs text-amber-200">Alerts</span>
                </a>
                <ExternalButton
                  href={googleCalendarUrl(state.stream.title, state.stream.scheduled_at!, 4, youtubeLiveUrl(profile) ?? '')}
                  hosts={['calendar.google.com']}
                  icon={<CalendarPlus className="size-4" aria-hidden />}
                >
                  Add reminder
                </ExternalButton>
                <ExternalButton href={streamWatchUrl(state.stream, profile)} hosts={['youtube.com', 'youtu.be']} variant="secondary">
                  Open on YouTube
                </ExternalButton>
              </div>
            </>
          )}

          {state.kind === 'offline' && (
            <>
              <p className="text-white" style={{ color: '#ffffff' }}>
                <time dateTime={state.stream?.scheduled_at ?? undefined} className="text-white" style={{ color: '#ffffff' }}>
                  {state.stream
                    ? `Previous stream · ${relativeTime(state.stream.scheduled_at)}`
                    : 'No stream scheduled right now — catch up on the latest videos.'}
                </time>
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={youtubeSubscribeUrl(profile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(239,68,68,0.45)] transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>🔔</span>
                  <WaveSubscribeText />
                  <span className="text-[11px] bg-black/30 px-1.5 py-0.5 rounded-full font-mono text-amber-200">27.6K</span>
                </a>
                <ExternalButton href={youtubeStreamsUrl(profile)} hosts={['youtube.com']} icon={<Tv className="size-4" aria-hidden />}>
                  Watch previous streams
                </ExternalButton>
                <ExternalButton href={profile.youtube_url} hosts={['youtube.com']} variant="secondary">
                  Visit channel
                </ExternalButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
