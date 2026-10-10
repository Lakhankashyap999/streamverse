import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Copy, Crosshair, Flame, Gamepad2, Heart, MapPin, Play, Sparkles, Trophy, Zap } from 'lucide-react';
import type { CommunityPost, Highlight, Poll, Profile, Stream, Video } from '../../types';
import { SITE, youtubeLiveUrl } from '../../config/site';
import { cn } from '../../utils/misc';
import { relativeTime } from '../../utils/date';
import { ButtonLink, ExternalButton } from '../ui/Button';
import { SafeImage, SectionHeading, Reveal } from '../ui/Display';
import { CompassStrip, ZoneRing } from '../ui/Hud';
import { EmptyState, ErrorState, LoadingState } from '../ui/States';
import { useToast } from '../ui/Toast';
import { getSocialLinks, SocialIconRow } from '../layout/SocialLinks';
import { LiveStreamCard, StreamCard, useLiveState, Countdown } from '../streams/StreamCard';
import { VideoGrid } from '../videos/VideoGrid';
import { highlightToMedia, videoToMedia } from '../videos/mappers';
import { PollCard } from '../community/PollCard';
import { CommunityPostCard } from '../community/CommunityPostCard';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { SakuraPetals } from '../ui/SakuraPetals';

/* ───────────────────────── helpers ───────────────────────── */

function useCopy() {
  const toast = useToast();
  return async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copied`, 'success');
    } catch {
      toast(`Couldn't copy — please copy it manually.`, 'error');
    }
  };
}

const PARTICLES = [
  [8, 72, 0], [18, 40, 1.2], [30, 85, 2.4], [44, 60, 0.6], [58, 78, 1.8],
  [66, 30, 3], [76, 66, 0.9], [86, 48, 2.1], [92, 82, 1.5], [52, 20, 2.7],
] as const;

/* ───────────────────────── Hero ───────────────────────── */

export function Hero({ profile, streams, videos }: { profile: Profile; streams: Stream[]; videos: Video[] }) {
  const reduce = useReducedMotion();
  const copy = useCopy();
  const live = useLiveState(streams, videos, profile);
  const item = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-24 sm:pt-28 lg:min-h-[100svh] lg:pb-20" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-10 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -left-40 top-20 -z-10 size-[34rem] rounded-full bg-neon/20 blur-[120px]" />
      <div className="absolute -right-40 bottom-0 -z-10 size-[30rem] rounded-full bg-ultra/20 blur-[120px]" />
      <div className="absolute right-1/3 top-1/3 -z-10 size-72 rounded-full bg-gold/10 blur-[100px]" />
      {!reduce && (
        <>
          <SakuraPetals count={14} />
          {PARTICLES.map(([x, y, d], i) => (
            <span
              key={i}
              aria-hidden
              className="absolute -z-10 size-1 rounded-full bg-blush/80"
              style={{ left: `${x}%`, top: `${y}%`, animation: `drift ${6 + (i % 4)}s ease-in ${d}s infinite`, ['--dx' as string]: `${(i % 2 ? 1 : -1) * 24}px` }}
            />
          ))}
        </>
      )}

      <CompassStrip className="absolute inset-x-0 top-20 hidden md:block lg:top-24" />

      <div className="container-x grid items-center gap-10 pt-4 sm:pt-6 lg:grid-cols-[1.02fr_1fr] lg:gap-14 lg:pt-14">
        {/* left - Creator Intro at Top on Mobile and Desktop */}
        <div className="order-1 lg:order-1">
          <motion.div {...item(0)} className="w-full">
            <div className="glass inline-flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 font-display text-[0.62rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.22em] text-mute max-w-full">
              <span className="text-pink-400 select-none text-[0.8rem]" aria-hidden>🌸</span>
              <span className="whitespace-nowrap">Gaming</span>
              <span className="text-blush select-none">•</span>
              <span className="whitespace-nowrap">Entertainment</span>
              <span className="text-blush select-none">•</span>
              <span className="whitespace-nowrap">Community</span>
              <span className="text-pink-400 select-none text-[0.8rem]" aria-hidden>🌸</span>
            </div>
          </motion.div>

          <motion.h1 {...item(1)} id="hero-title" className="mt-3 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] break-words">
            Welcome to
            <span className="mt-1 block font-script text-[1.15em] italic leading-[1.1] text-gradient pb-1 pr-2 inline-block max-w-full">
              My World
            </span>
          </motion.h1>

          <motion.p {...item(2)} className="mt-3 sm:mt-5 font-display text-base sm:text-xl md:text-2xl font-semibold break-words">
            I'm <span className="text-gradient-gold inline-block">{profile.gaming_name}</span>
            {profile.tagline && <span className="text-mute block sm:inline"> — {profile.tagline}</span>}
          </motion.p>

          <motion.p {...item(3)} className="mt-2.5 sm:mt-4 w-full max-w-xl text-xs sm:text-base md:text-lg leading-relaxed text-mute break-words">
            Marathon <span className="font-semibold text-gold">TOP 100 rank pushes</span>,{' '}
            <span className="font-semibold text-blush">rush gameplay</span>, clutch{' '}
            <span className="font-semibold text-violet-300">squad fights</span> and non-stop fun with the{' '}
            {SITE.communityName} ❤️
          </motion.p>

          <motion.div {...item(4)} className="mt-5 sm:mt-8 flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
            <ExternalButton href={youtubeLiveUrl(profile)} hosts={['youtube.com']} size="lg" icon={<Play className="size-5 fill-current" aria-hidden />} className="w-full sm:w-auto justify-center">
              Watch My Stream
            </ExternalButton>
            <ButtonLink to="/highlights" variant="secondary" size="lg" iconRight={<ArrowRight className="size-5" aria-hidden />} className="w-full sm:w-auto justify-center">
              Explore Highlights
            </ButtonLink>
          </motion.div>

          <motion.div {...item(5)} className="mt-5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <SocialIconRow profile={profile} />
            {profile.game_id && (
              <button
                type="button"
                onClick={() => copy(profile.game_id!, 'Game ID')}
                className="clip-angle-sm group flex items-center justify-between gap-3 border border-gold/30 bg-gold/5 px-4 py-2 text-left transition hover:bg-gold/10 max-w-full"
                aria-label={`Copy BGMI ID ${profile.game_id}`}
              >
                <div>
                  <span className="block font-display text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-gold">BGMI ID</span>
                  <span className="font-display text-sm sm:text-base font-bold tabular-nums tracking-wider">{profile.game_id}</span>
                </div>
                <Copy className="size-4 text-mute group-hover:text-gold shrink-0" aria-hidden />
              </button>
            )}
          </motion.div>
        </div>

        {/* right - Hero Artwork */}
        <motion.div
          className="relative order-2 mx-auto w-full max-w-xl lg:order-2 lg:max-w-none mt-4 lg:mt-0"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <ZoneRing className="-inset-10 hidden animate-[zone-spin_60s_linear_infinite] sm:block" />

          {/* Floating PUBG Airdrop Crate with rising Red Smoke */}
          <div className="absolute -top-12 -right-2 z-20 hidden sm:flex flex-col items-center pointer-events-none select-none">
            {/* Rising Red Smoke Particles */}
            <div className="relative h-14 w-12" aria-hidden="true">
              <span className="airdrop-smoke absolute bottom-0 left-2 size-6 rounded-full bg-red-500/80 blur-xs" />
              <span className="airdrop-smoke absolute bottom-1 left-4 size-7 rounded-full bg-rose-600/70 blur-sm" />
              <span className="airdrop-smoke absolute bottom-2 left-3 size-5 rounded-full bg-amber-500/60 blur-xs" />
            </div>
            {/* Crate Box */}
            <div className="relative w-14 h-12 rounded-sm border-2 border-red-500/80 bg-red-700 shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              <div className="h-3.5 w-full bg-sky-600 border-b border-sky-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[8px] font-black tracking-widest text-white drop-shadow">AIRDROP</span>
              </div>
            </div>
          </div>

          {/* Main Esports Frame */}
          <div className="gradient-border hud-corners clip-angle relative overflow-hidden rounded-[4px] bg-[#12162a] shadow-[0_40px_120px_-30px_rgba(192,38,211,0.5)]">
            {/* Laser scanning beam */}
            <div className="pointer-events-none absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-blush/60 to-transparent laser-scanner z-10" />

            <div className="scanlines relative aspect-[4/4.2] sm:aspect-[4/3.8] overflow-hidden bg-gradient-to-b from-[#1b2140] via-[#101426] to-[#090b16]">
              {/* Khushi's HD Creator Photo */}
              <img
                src="/images/creator/khushi-hero-front.jpg"
                alt="Khushi official creator photo"
                className="absolute inset-0 size-full object-cover object-[center_15%] filter brightness-105 contrast-105"
                width={800}
                height={800}
                fetchPriority="high"
                loading="eager"
                decoding="async"
              />

              {/* Cinematic Vignette & Neon Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-base via-base/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-base/30 via-transparent to-base/30" />

              {/* PUBG HUD Coordinates & Reticle */}
              <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex items-center gap-1.5 sm:gap-2 font-mono text-[0.62rem] sm:text-[0.68rem] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gold/90 bg-base/70 backdrop-blur-sm px-2 sm:px-2.5 py-1 rounded border border-gold/20">
                <Crosshair className="size-2.5 sm:size-3 text-gold animate-spin" style={{ animationDuration: '10s' }} />
                <span>POCHINKI ZONE</span>
              </div>

              {/* Live Match Telemetry Chip */}
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4 hidden sm:flex items-center gap-2 font-mono text-[0.65rem] text-mute bg-base/70 backdrop-blur-sm px-2.5 py-1 rounded border border-line">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>60 FPS</span>
                <span className="text-line">|</span>
                <span>20ms</span>
                <span className="text-line">|</span>
                <span className="text-violet-300">ASIA SERVER</span>
              </div>

              {/* Tactical Crosshair Watermark */}
              <svg className="absolute right-[12%] bottom-[24%] size-16 sm:size-20 text-white/20 pointer-events-none" viewBox="0 0 64 64" aria-hidden>
                <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="32" cy="32" r="14" fill="none" stroke="#f472b6" strokeWidth="1.5" />
                <path d="M32 2v12M32 50v12M2 32h12M50 32h12" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="32" cy="32" r="2.5" fill="#fbbf24" />
              </svg>

              {/* Dynamic Kill Feed Banner - Positioned at top just like authentic PUBG gameplay */}
              <div className="absolute inset-x-2 sm:inset-x-4 top-12 sm:top-14 glass rounded-xl p-2 sm:p-2.5 border border-blush/30 shadow-lg flex items-center justify-between gap-2 overflow-hidden z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <span className="shrink-0 size-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-ink truncate">
                    <span className="text-gold">KhushiYT</span> eliminated <span className="text-rose-400">Enemy</span> with <span className="text-amber-300">M416 [Headshot]</span>
                  </span>
                </div>
                <span className="shrink-0 font-mono text-[9px] sm:text-[10px] text-mute uppercase tracking-widest hidden md:inline">
                  LIVE KILL FEED
                </span>
              </div>
            </div>
          </div>

          {/* Creator Profile Chip */}
          <div className="glass absolute -top-4 left-2 sm:-left-5 sm:-top-5 flex items-center gap-2.5 sm:gap-3 rounded-2xl p-2 sm:p-2.5 pr-3 sm:pr-4 shadow-xl z-20 border border-blush/40 lg:animate-float max-w-[85vw] sm:max-w-none">
            <SafeImage
              src={profile.avatar_url}
              alt={`${profile.gaming_name} profile photo`}
              className="size-9 sm:size-11 rounded-xl border-2 border-blush/80 object-cover shrink-0"
              width={44}
              height={44}
              loading="eager"
            />
            <div className="min-w-0">
              <p className="font-display text-xs sm:text-sm font-bold flex items-center gap-1.5 truncate">
                {profile.gaming_name}
                <span className="inline-block size-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
              </p>
              <p className="text-[11px] sm:text-xs text-mute font-mono truncate">{profile.handle}</p>
            </div>
          </div>

          {/* Stream Status Chip - Clear of any overlapping elements */}
          <div className="glass absolute -bottom-5 left-2 sm:-left-6 sm:-bottom-6 max-w-[88vw] sm:max-w-[19rem] rounded-2xl p-3 sm:p-4 shadow-xl z-20 border border-ultra/40">
            {live.kind === 'live' ? (
              <a
                href={live.stream?.youtube_video_id ? `https://www.youtube.com/watch?v=${live.stream.youtube_video_id}` : (profile.youtube_url ? `${profile.youtube_url}/live` : 'https://www.youtube.com/@khusiytlive/live')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-xs sm:text-sm font-bold text-red-400 group-hover:text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                    LIVE ON YOUTUBE
                    <span className="rounded bg-red-600/30 px-1.5 py-0.5 text-[9px] font-mono text-red-300 border border-red-500/40">WATCH NOW ➔</span>
                  </p>
                  <p className="text-[11px] text-mute font-mono truncate max-w-[15rem]">
                    {live.stream?.title || 'BGMI Rank Push Livestream'}
                  </p>
                </div>
              </a>
            ) : live.kind === 'upcoming' ? (
              <>
                <p className="hud-label text-[0.65rem] sm:text-[0.7rem]">Next Stream{live.stream.is_sample ? ' · Scheduled' : ''}</p>
                <div className="mt-1.5 sm:mt-2">
                  <Countdown target={live.stream.scheduled_at!} compact />
                </div>
              </>
            ) : (
              <>
                <p className="hud-label text-[0.65rem] sm:text-[0.7rem]">Broadcast Status</p>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-mute">
                  Offline{live.stream ? ` · Last stream ${relativeTime(live.stream.scheduled_at)}` : ''}
                </p>
              </>
            )}
          </div>

          {/* Cute Pink Gamer Teddy Mascot Badge - Mobile Responsive */}
          <div className="glass absolute top-20 -right-2 sm:top-24 sm:-right-6 flex items-center gap-2 rounded-2xl p-1.5 sm:p-2 pr-3 sm:pr-3.5 shadow-xl z-20 border border-pink-400/50 bg-[#12162a]/90 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-pink-400">
            <div className="relative size-9 sm:size-11 rounded-xl overflow-hidden bg-base border border-pink-400/40 shrink-0">
              <img
                src="/images/art/pink-gamer-teddy.jpg"
                alt="Khushi's Pink Gamer Teddy Mascot"
                className="size-full object-cover"
                width={44}
                height={44}
              />
              <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-pink-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-[10px] sm:text-xs font-bold text-white flex items-center gap-1 uppercase truncate">
                Teddy <span>🧸</span>
              </p>
              <p className="text-[9px] sm:text-[10px] text-pink-300 font-mono truncate">Mascot 🌸</p>
            </div>
          </div>

          {/* Top 100 Rank Push Badge */}
          <div className="clip-angle-sm absolute -right-2 sm:-right-4 -bottom-3 sm:-bottom-4 hidden items-center gap-2 bg-[linear-gradient(110deg,#fde68a,#fbbf24,#fb923c)] px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-base shadow-lg z-20 sm:flex">
            <Trophy className="size-4" aria-hidden /> TOP 100 CONQUEROR
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── Creator intro ───────────────────────── */

const modeColours = ['from-amber-400 to-orange-500', 'from-pink-500 to-fuchsia-600', 'from-violet-500 to-indigo-500', 'from-cyan-400 to-violet-500'];
const modeIcons = [Trophy, Zap, Flame, Gamepad2];

export function CreatorIntro({ profile }: { profile: Profile }) {
  const stats = profile.show_stats ? profile.stats_snapshot : null;
  const statList: Array<[string, string]> = stats
    ? ([
        ['Subscribers', stats.subscribers],
        ['Videos', stats.videos],
        ['Channel views', stats.views],
        ['Instagram', stats.instagram_followers],
      ] as Array<[string, string | undefined]>).filter((item): item is [string, string] => Boolean(item[1]))
    : [];

  return (
    <section className="container-x py-20 sm:py-24" aria-labelledby="intro-title">
      <SectionHeading eyebrow="Player profile" title="Meet the" highlight="Player" id="intro-title" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <div className="panel overflow-hidden">
            <div className="relative aspect-[1024/166] w-full bg-surface overflow-hidden">
              <SafeImage src={profile.banner_url} alt={`${profile.gaming_name} channel banner`} className="size-full object-cover" />
            </div>
            <div className="relative px-6 pb-6">
              <SafeImage
                src={profile.avatar_url}
                alt={`${profile.gaming_name} profile photo`}
                className="-mt-12 size-24 rounded-2xl border-4 border-card shadow-xl"
                width={96}
                height={96}
              />
              <h3 className="mt-3 text-2xl font-bold">{profile.gaming_name}</h3>
              <p className="text-mute">
                {profile.handle} {profile.country && <span className="inline-flex items-center gap-1">· <MapPin className="size-3.5" aria-hidden /> {profile.country}</span>}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.tagline && (
                  <span className="rounded-full border border-blush/30 bg-neon/10 px-3 py-1 text-sm text-fuchsia-200">🎮 {profile.tagline}</span>
                )}
                <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-sm text-pink-200 flex items-center gap-1">
                  <span>🌸</span>
                  {SITE.communityName}
                </span>
                <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-sm text-pink-200 flex items-center gap-1">
                  <span>🧸</span>
                  Teddy Squad
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex h-full flex-col gap-6">
            <p className="text-lg leading-relaxed text-ink/90">{profile.bio}</p>
            {profile.favourite_modes.length > 0 && (
              <div>
                <h3 className="hud-label mb-3">Favourite modes</h3>
                <ul className="flex flex-wrap gap-3">
                  {profile.favourite_modes.map((m, i) => {
                    const Icon = modeIcons[i % modeIcons.length];
                    return (
                      <li key={m} className="clip-angle-sm flex items-center gap-2 border border-line bg-card px-4 py-2.5 font-display font-semibold">
                        <span className={cn('grid size-7 place-items-center rounded-md bg-gradient-to-br text-white', modeColours[i % modeColours.length])}>
                          <Icon className="size-4" aria-hidden />
                        </span>
                        {m}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {statList.length > 0 && (
              <div>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {statList.map(([label, value], i) => {
                    const matchK = value.match(/^([\d.]+)\s*K$/i);
                    const matchM = value.match(/^([\d.]+)\s*M$/i);
                    const cleanNum = value.replace(/,/g, '');
                    const isPureNumber = !isNaN(Number(cleanNum)) && cleanNum.trim() !== '';

                    return (
                      <div key={label} className="panel p-4">
                        <dt className="text-xs text-mute font-medium">{label}</dt>
                        <dd className={cn('mt-1 font-display text-2xl font-bold', ['text-gradient-gold', 'text-gradient', 'text-gradient-zone', 'text-gradient'][i])}>
                          {matchK ? (
                            <AnimatedCounter
                              to={parseFloat(matchK[1])}
                              decimals={matchK[1].includes('.') ? 1 : 0}
                              suffix="K"
                              duration={1600}
                            />
                          ) : matchM ? (
                            <AnimatedCounter
                              to={parseFloat(matchM[1])}
                              decimals={matchM[1].includes('.') ? 1 : 0}
                              suffix="M"
                              duration={1600}
                            />
                          ) : isPureNumber ? (
                            <AnimatedCounter to={parseFloat(cleanNum)} duration={1800} />
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                <p className="mt-2 text-xs text-mute">
                  Public channel snapshot entered manually{stats?.as_of ? ` (as of ${stats.as_of})` : ''} — not live analytics.
                </p>
              </div>
            )}
            <div className="mt-auto">
              <ButtonLink to="/about" variant="secondary" iconRight={<ArrowRight className="size-4" aria-hidden />}>
                About Me
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── Live stream section ───────────────────────── */

export function LiveSection({ profile, streams, videos }: { profile: Profile; streams: Stream[]; videos: Video[] }) {
  return (
    <section className="container-x py-16" aria-labelledby="live-title">
      <SectionHeading eyebrow="Stream status" title="Catch the" highlight="Action" id="live-title" />
      <Reveal>
        <LiveStreamCard profile={profile} streams={streams} videos={videos} />
      </Reveal>
    </section>
  );
}

/* ───────────────────────── Latest videos ───────────────────────── */

export function LatestVideos({
  videos,
  loading,
  error,
  onRetry,
  channel,
}: {
  videos: Video[];
  loading: boolean;
  error: string | null;
  onRetry(): void;
  channel: string | null;
}) {
  const items = useMemo(
    () => [...videos].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, 6).map((v) => videoToMedia(v, channel)),
    [videos, channel],
  );
  return (
    <section className="container-x py-16" aria-labelledby="videos-title">
      <SectionHeading
        eyebrow="Latest drops"
        title="Latest"
        highlight="Videos"
        id="videos-title"
        description="Full livestream replays and gameplay straight from YouTube."
        action={
          <ButtonLink to="/streams" variant="ghost" iconRight={<ArrowRight className="size-4" aria-hidden />}>
            All streams
          </ButtonLink>
        }
      />
      {loading ? (
        <LoadingState count={3} label="Loading videos" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Play className="size-6" />} title="No videos yet" message="New videos will appear here soon." />
      ) : (
        <VideoGrid items={items} columns={3} />
      )}
    </section>
  );
}

/* ───────────────────────── Highlights ───────────────────────── */

export function HighlightFilters({ categories, value, onChange }: { categories: string[]; value: string; onChange(v: string): void }) {
  return (
    <div role="group" aria-label="Filter highlights by category" className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {['All', ...categories].map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={value === c}
          onClick={() => onChange(c)}
          className={cn(
            'clip-angle-sm shrink-0 border px-4 py-2 font-display text-sm font-semibold transition',
            value === c ? 'border-transparent bg-[linear-gradient(110deg,#fbbf24,#f472b6,#8b5cf6)] text-base' : 'border-line bg-card text-mute hover:text-ink',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function FeaturedHighlights({ highlights, loading, error, onRetry, channel }: { highlights: Highlight[]; loading: boolean; error: string | null; onRetry(): void; channel: string | null }) {
  const [cat, setCat] = useState('All');
  const categories = useMemo(() => [...new Set(highlights.map((h) => h.category).filter(Boolean) as string[])], [highlights]);
  const items = highlights
    .filter((h) => cat === 'All' || h.category === cat)
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .slice(0, 6)
    .map((h) => highlightToMedia(h, channel));

  return (
    <section className="relative py-16" aria-labelledby="hl-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Kill feed"
          title="Featured"
          highlight="Highlights"
          id="hl-title"
          description="Funny moments, clutch plays, squad chaos and favourite clips."
          action={
            <ButtonLink to="/highlights" variant="ghost" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              View all
            </ButtonLink>
          }
        />
        {loading ? (
          <LoadingState count={3} label="Loading highlights" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : highlights.length === 0 ? (
          <EmptyState icon={<Sparkles className="size-6" />} title="Highlights coming soon" message="Clips from recent streams will land here." />
        ) : (
          <>
            <HighlightFilters categories={categories} value={cat} onChange={setCat} />
            {items.length ? (
              <VideoGrid items={items} columns={3} />
            ) : (
              <EmptyState title="Nothing in this category yet" message="Try another category." />
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ───────────────────────── Upcoming ───────────────────────── */

export function UpcomingStreams({ streams, profile }: { streams: Stream[]; profile: Profile }) {
  const upcoming = streams
    .filter((s) => s.status === 'scheduled' && s.scheduled_at && new Date(s.scheduled_at).getTime() > Date.now())
    .sort((a, b) => (a.scheduled_at! > b.scheduled_at! ? 1 : -1))
    .slice(0, 3);
  if (!upcoming.length) return null; // hidden when nothing is scheduled
  return (
    <section className="container-x py-16" aria-labelledby="up-title">
      <SectionHeading eyebrow="Airdrop incoming" title="Upcoming" highlight="Streams" id="up-title" description="Times are shown in your local timezone." />
      <ol className="relative space-y-5 border-l border-dashed border-ultra/40 pl-6 sm:pl-8">
        {upcoming.map((s, i) => (
          <li key={s.id} className="relative">
            <span className="absolute -left-[33px] top-6 grid size-4 place-items-center rounded-full bg-base ring-2 ring-gold sm:-left-[41px]" aria-hidden>
              <span className="size-1.5 rounded-full bg-gold" />
            </span>
            <Reveal delay={i * 0.08}>
              <StreamCard stream={s} profile={profile} />
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────────────────── Community preview ───────────────────────── */

export function CommunityPreview({ polls, posts, loading }: { polls: Poll[]; posts: CommunityPost[]; loading: boolean }) {
  const poll = polls.find((p) => p.status === 'active');
  const announcement = posts.find((p) => p.kind === 'announcement');
  const challenge = posts.find((p) => p.kind === 'challenge' && p.status !== 'closed');
  const hasAny = poll || announcement || challenge;

  return (
    <section className="relative overflow-hidden py-20" aria-labelledby="comm-title">
      <img
        src="/images/art/battleground-map.jpg"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 -z-10 size-full object-cover opacity-55 filter brightness-110 contrast-120 saturate-110"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#090b16_0%,rgba(9,11,22,0.45)_30%,rgba(9,11,22,0.45)_70%,#090b16_100%)]" />
      <div className="container-x">
        <SectionHeading
          eyebrow="Squad up"
          title="Join the"
          highlight={SITE.communityName}
          id="comm-title"
          description="Vote in polls, take on challenges and share your stream ideas."
          action={<ButtonLink to="/community" iconRight={<ArrowRight className="size-4" aria-hidden />}>Visit Community</ButtonLink>}
        />
        {loading ? (
          <LoadingState count={3} />
        ) : !hasAny ? (
          <EmptyState title="Community hub warming up" message="Polls and challenges will appear here when published." />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {poll && (
              <Reveal>
                <PollCard poll={poll} compact />
              </Reveal>
            )}
            {announcement && (
              <Reveal delay={0.08}>
                <CommunityPostCard post={announcement} />
              </Reveal>
            )}
            {challenge && (
              <Reveal delay={0.16}>
                <CommunityPostCard post={challenge} />
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────────────────── Socials ───────────────────────── */

export function SocialSection({ profile }: { profile: Profile }) {
  const links = getSocialLinks(profile);
  const copy = useCopy();
  if (!links.length && !(profile.show_upi && profile.upi_id)) return null;
  return (
    <section className="container-x py-16" aria-labelledby="social-title">
      <SectionHeading eyebrow="Comms channel" title="Follow the" highlight="Squad" id="social-title" align="center" description="Official profiles only — links are verified before they're shown." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ key, label, href, Icon, colour, blurb }, i) => (
          <li key={key}>
            <Reveal delay={i * 0.05}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group panel flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-white/25"
              >
                <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg', colour)}>
                  <Icon className="size-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">{label}</span>
                  <span className="block truncate text-sm text-mute">{blurb}</span>
                </span>
                <ArrowRight className="size-5 text-mute transition group-hover:translate-x-1 group-hover:text-ink" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Reveal>
          </li>
        ))}
        {profile.show_upi && profile.upi_id && (
          <li>
            <Reveal delay={0.25}>
              <div className="panel flex items-center gap-4 border-gold/30 p-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-base">
                  <Heart className="size-7" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">Support (UPI)</span>
                  <span className="block truncate font-mono text-sm text-gold">{profile.upi_id}</span>
                </span>
                <button
                  type="button"
                  onClick={() => copy(profile.upi_id!, 'UPI ID')}
                  className="glass grid size-11 place-items-center rounded-xl text-mute hover:text-ink"
                  aria-label="Copy UPI ID"
                >
                  <Copy className="size-5" />
                </button>
              </div>
            </Reveal>
          </li>
        )}
      </ul>
    </section>
  );
}
