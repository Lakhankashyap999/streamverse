import { useEffect, useState } from 'react';
import { cn } from '../../utils/misc';

export interface PubgLoaderProps {
  fullscreen?: boolean;
  onComplete?: () => void;
  className?: string;
  durationMs?: number;
}

const CIRCUMFERENCE = 125.66; // 2 * Math.PI * 20

/**
 * Minimal, ultra-smooth KhushiYT Profile Loader
 * Responsive across Mobile View, Tablet, and Desktop Webview.
 * Features:
 * - Brand cyberpunk dark navy atmosphere with breathing pink & cyan ambient glows
 * - Glowing avatar with rotating dual-layer neon border ring and online status
 * - Signature "KhushiYT 🌸" typography
 * - Compact circular progress bar (Sakura Pink ➔ Gold ➔ Cyan gradient) with live % count
 * - "Profile is loading..." animated label with staggered pulsating dots
 */
export function PubgLoader({
  fullscreen = false,
  onComplete,
  className,
  durationMs = 1800,
}: PubgLoaderProps) {
  const [progress, setProgress] = useState(fullscreen ? 0 : 75);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;

    let startTime = performance.now();
    let animFrame: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const current = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(current);

      if (current < 100) {
        animFrame = requestAnimationFrame(tick);
      } else {
        // Short smooth grace period at 100% before transition
        setTimeout(() => {
          onComplete?.();
        }, 220);
      }
    };

    animFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [fullscreen, durationMs, onComplete]);

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative flex flex-col items-center justify-center select-none text-center overflow-hidden',
        fullscreen
          ? 'fixed inset-0 z-[9999] bg-[#060814] w-screen h-[100dvh] px-4 touch-none overscroll-none'
          : 'py-12 px-4 w-full',
        className,
      )}
    >
      {fullscreen && (
        <>
          {/* Subtle Ambient Background Theme Grid & Glows */}
          <div
            className="pointer-events-none fixed inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(244, 114, 182, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none fixed top-1/4 left-1/6 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-pink-500/10 blur-3xl animate-pulse"
            aria-hidden
          />
          <div
            className="pointer-events-none fixed bottom-1/4 right-1/6 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-sky-500/10 blur-3xl"
            style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s' }}
            aria-hidden
          />

          {/* Top subtle HUD telemetry with safe-area spacing for mobile notch */}
          <div className="absolute top-3 sm:top-6 inset-x-3 sm:inset-x-8 flex items-center justify-between font-mono text-xs z-20">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse shrink-0" />
              <span className="font-display font-bold text-[10px] sm:text-xs tracking-wider text-slate-300 truncate">
                KHUSHIYT SYSTEM
              </span>
            </div>
            {onComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="flex items-center gap-1 border border-white/10 bg-white/5 active:scale-95 hover:bg-white/10 hover:border-pink-500/40 px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-medium text-slate-400 hover:text-white transition cursor-pointer backdrop-blur-md shrink-0"
              >
                Skip ➔
              </button>
            )}
          </div>
        </>
      )}

      {/* 🌸 Clean Minimal Profile Card (Perfect for Mobile & Web) 🌸 */}
      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 max-w-xs w-full px-2 animate-in fade-in duration-500">
        {/* 1. Avatar with dual-layer neon glow ring */}
        <div className="relative size-20 sm:size-24 shrink-0 flex items-center justify-center">
          {/* Rotating outer blur gradient ring */}
          <div
            className="absolute -inset-1 rounded-full blur-[6px] opacity-75"
            style={{
              background: 'conic-gradient(from 0deg, #f472b6, #fbbf24, #38bdf8, #f472b6)',
              animation: 'spin 6s linear infinite',
            }}
          />
          {/* Crisp border ring */}
          <div
            className="absolute inset-0 rounded-full p-[2px]"
            style={{
              background: 'linear-gradient(135deg, #f472b6, #fbbf24)',
              animation: 'spin 8s linear infinite reverse',
            }}
          />
          {/* Avatar image with fallback */}
          <img
            src={imgError ? '/icons/logo.svg' : '/images/creator/khushi-avatar-gamer.webp'}
            alt="KhushiYT"
            onError={() => setImgError(true)}
            className="relative size-[74px] sm:size-[90px] rounded-full object-cover bg-[#0d1124] border-2 border-[#060814] shadow-2xl z-10 shrink-0"
          />
          {/* Online green pulse indicator */}
          <span
            className="absolute bottom-1 right-1 size-3.5 sm:size-4 rounded-full bg-emerald-500 border-2 border-[#060814] shadow-[0_0_8px_#22c55e] z-20 shrink-0"
            title="Online"
          />
        </div>

        {/* 2. Brand Identity */}
        <div className="flex flex-col items-center gap-1 w-full">
          <h2 className="font-esports text-2xl sm:text-3xl font-extrabold tracking-wider flex items-center justify-center gap-1.5 flex-nowrap">
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
              Khushi
            </span>
            <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
              YT
            </span>
            <span className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_rgba(244,114,182,0.6)] shrink-0">
              🌸
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 font-gaming text-[11px] sm:text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
            <span>BGMI CONQUEROR</span>
            <span className="text-pink-400">•</span>
            <span>LIVE STREAMER</span>
          </div>
        </div>

        {/* 3. Chota sa Gol Progress Bar */}
        <div className="mt-1 sm:mt-2 flex flex-col items-center gap-2 sm:gap-2.5 w-full">
          <div className="relative size-12 sm:size-14 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="khushiProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              {/* Background track circle */}
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3.5"
              />
              {/* Glowing progress stroke */}
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#khushiProgressGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={fullscreen ? strokeDashoffset : 30}
                className={cn(
                  'transition-all duration-100 ease-linear',
                  !fullscreen && 'animate-[spin_1.2s_linear_infinite]',
                )}
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(244, 114, 182, 0.75))',
                }}
              />
            </svg>
            {/* Center percentage value */}
            <span className="absolute font-esports text-[10px] sm:text-[11px] font-extrabold text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
              {fullscreen ? `${Math.round(progress)}%` : '•••'}
            </span>
          </div>

          {/* 4. "Profile is loading..." Text */}
          <div className="flex items-center justify-center gap-0.5 font-gaming text-sm sm:text-base font-bold tracking-widest text-slate-200 uppercase">
            <span>Profile is </span>
            <span className="text-pink-400 font-extrabold ml-1">loading</span>
            <span className="text-amber-400 animate-[pulse_1.4s_infinite]">.</span>
            <span
              className="text-amber-400 animate-[pulse_1.4s_infinite]"
              style={{ animationDelay: '0.2s' }}
            >
              .
            </span>
            <span
              className="text-amber-400 animate-[pulse_1.4s_infinite]"
              style={{ animationDelay: '0.4s' }}
            >
              .
            </span>
          </div>

          {/* Telemetry Footer */}
          <span className="font-mono text-[9px] sm:text-[10px] text-slate-500 tracking-wider">
            SYNCING ASIA SERVER · 20ms PING
          </span>
        </div>
      </div>
    </div>
  );
}

export default PubgLoader;
