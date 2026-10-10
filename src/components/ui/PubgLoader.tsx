import { useEffect, useState } from 'react';
import { cn } from '../../utils/misc';

/**
 * Original SVG artwork: a stylised female squad player (level-3 style helmet,
 * vest, backpack) firing a rifle at a steel target. Pure CSS animation —
 * recoil, muzzle flash, tracers, ejected shells, smoke and target hits.
 * Under prefers-reduced-motion it renders as a static pose.
 */
export function SoldierFiring({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 200" className={cn('w-full', className)} role="img" aria-label="Animated soldier firing a rifle">
      <defs>
        <linearGradient id="sv-accent" x1="0" x2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="sv-tracer" x1="0" x2="1">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="sv-ground" x1="0" x2="1">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset=".5" stopColor="#c026d3" stopOpacity=".7" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sv-glow">
          <stop offset="0" stopColor="#fbbf24" stopOpacity=".55" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground */}
      <rect x="10" y="189" width="380" height="2" fill="url(#sv-ground)" />
      <g fill="#2b3156">
        <path d="M30 189 l3 -7 l2 7z M150 189 l2 -6 l3 6z M260 189 l3 -8 l2 8z M300 189 l2 -5 l2 5z" />
      </g>

      {/* target */}
      <g className="sv-target">
        <rect x="350" y="108" width="4" height="82" fill="#2b3156" />
        <rect x="336" y="186" width="32" height="4" rx="2" fill="#2b3156" />
        <circle cx="352" cy="92" r="20" fill="#1b2140" stroke="#8b5cf6" strokeWidth="2.5" />
        <circle cx="352" cy="92" r="12" fill="none" stroke="#c026d3" strokeWidth="2" />
        <circle cx="352" cy="92" r="4" fill="#f472b6" />
      </g>
      <g className="sv-hit" stroke="#fde68a" strokeWidth="2" strokeLinecap="round">
        <path d="M340 92 h-8 M352 80 v-8 M343 83 l-6 -6 M343 101 l-6 6 M352 104 v8" />
        <circle cx="348" cy="92" r="9" fill="url(#sv-glow)" stroke="none" />
      </g>

      {/* soldier body */}
      <g className="sv-breathe">
        {/* legs */}
        <path d="M84 126 L74 156 L70 184" stroke="#262c4d" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M97 126 L113 155 L119 184" stroke="#2f365c" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="60" y="182" width="20" height="8" rx="3" fill="#11131f" />
        <rect x="112" y="182" width="20" height="8" rx="3" fill="#11131f" />
        {/* backpack */}
        <rect x="62" y="82" width="16" height="38" rx="5" fill="#4a3a28" />
        <rect x="64" y="90" width="12" height="4" rx="1" fill="#5b4832" />
        {/* torso + vest */}
        <path d="M76 80 Q73 104 80 130 L103 130 Q107 104 102 80 Z" fill="#2f365c" />
        <rect x="78" y="86" width="25" height="32" rx="5" fill="#3d4330" />
        <rect x="81" y="104" width="8" height="10" rx="2" fill="#4b5238" />
        <rect x="92" y="104" width="8" height="10" rx="2" fill="#4b5238" />
        <rect x="78" y="118" width="25" height="4" rx="1" fill="url(#sv-accent)" />
        {/* hair (ponytail) */}
        <path d="M86 64 Q74 72 79 88" stroke="#1a1020" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* head */}
        <rect x="92" y="70" width="8" height="10" rx="3" fill="#e9b996" />
        <circle cx="97" cy="64" r="10" fill="#f1c6a8" />
        {/* level-3 style helmet */}
        <path d="M84 67 Q83 47 97.5 46 Q112 47 111 62 L111 66 L106 66 L105.5 59.5 L89 59.5 L89 69 Z" fill="#4d5530" />
        <path d="M89 56.5 h16" stroke="#2d3320" strokeWidth="3" strokeLinecap="round" />
        <circle cx="88" cy="64" r="3.4" fill="#1b1f33" stroke="#c026d3" strokeWidth="1" />
        <path d="M89 66 Q96 74 103 71" stroke="#1b1f33" strokeWidth="1.4" fill="none" />
      </g>

      {/* rifle + arms (recoil group) */}
      <g className="sv-recoil">
        <path d="M100 83 L112 100 L121 94" stroke="#2f365c" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M90 82 L105 79.5 L107 92 L93 96 Z" fill="#1b1f33" />
        <rect x="104" y="78" width="64" height="12" rx="2" fill="#232842" />
        <rect x="108" y="82" width="44" height="2" fill="url(#sv-accent)" />
        <rect x="168" y="80" width="27" height="8" rx="1.5" fill="#2d334f" />
        <rect x="194" y="82.5" width="12" height="3" fill="#11131f" />
        <path d="M132 90 L142 90 L147 109 L137 111 Z" fill="#1b1f33" />
        <path d="M117 90 L126 90 L122 103 L114 102 Z" fill="#1b1f33" />
        <rect x="124" y="70" width="27" height="7" rx="3" fill="#11131f" />
        <circle cx="151" cy="73.5" r="2.4" fill="#f472b6" />
        <path d="M101 82 L140 99 L176 88" stroke="#3a4170" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="121" cy="94" r="4" fill="#f1c6a8" />
        <circle cx="176" cy="88" r="4" fill="#f1c6a8" />
        {/* muzzle flash */}
        <g className="sv-flash">
          <path d="M206 86 L221 75 L217 83.5 L236 86 L217 88.5 L221 97 Z" fill="#fbbf24" />
          <path d="M206 86 L216 80 L214 85 L224 86 L214 87 L216 92 Z" fill="#fff7d6" />
          <circle cx="210" cy="86" r="14" fill="url(#sv-glow)" />
        </g>
      </g>

      {/* tracers */}
      <g>
        <rect className="sv-bullet" x="208" y="85" width="16" height="2" rx="1" fill="url(#sv-tracer)" />
        <rect className="sv-bullet" x="208" y="85" width="16" height="2" rx="1" fill="url(#sv-tracer)" />
        <rect className="sv-bullet" x="208" y="85" width="16" height="2" rx="1" fill="url(#sv-tracer)" />
      </g>
      {/* ejected shells */}
      <g>
        <rect className="sv-shell" x="136" y="74" width="2.6" height="6" rx="1" fill="#fbbf24" />
        <rect className="sv-shell" x="136" y="74" width="2.6" height="6" rx="1" fill="#fbbf24" />
        <rect className="sv-shell" x="136" y="74" width="2.6" height="6" rx="1" fill="#fbbf24" />
      </g>
      {/* smoke */}
      <g fill="#cbd5e1">
        <circle className="sv-smoke" cx="212" cy="82" r="4" />
        <circle className="sv-smoke" cx="212" cy="82" r="4" />
        <circle className="sv-smoke" cx="212" cy="82" r="4" />
      </g>
    </svg>
  );
}

const TIPS = [
  'Landing in the hot drop… Pochinki secure.',
  'Looting the airdrop… Groza & Level-3 Helmet equipped.',
  'Checking the safe zone… Zone 3 shrinking.',
  'Squad ready — loading the KhushiYT Family hub…',
];

/** Full-screen splash (first visit) or compact inline loader (route changes). */
export function PubgLoader({
  fullscreen = false,
  onComplete,
}: {
  fullscreen?: boolean;
  onComplete?: () => void;
}) {
  const [tipIndex, setTipIndex] = useState(0);
  const [ammoCount, setAmmoCount] = useState(30);
  const [tipFade, setTipFade] = useState(true);

  useEffect(() => {
    // Smooth, leisurely tip progression without frantic re-renders
    const tipTimer = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % TIPS.length);
        setTipFade(true);
      }, 200);
    }, 1800);

    // Optimized ammo countdown ticking every 350ms instead of 100ms
    const ammoTimer = setInterval(() => {
      setAmmoCount((prev) => (prev > 5 ? prev - 3 : 30));
    }, 350);

    return () => {
      clearInterval(tipTimer);
      clearInterval(ammoTimer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 text-center select-none overflow-x-hidden',
        fullscreen
          ? 'fixed inset-0 z-[999] bg-[#090b16] transition-opacity duration-500'
          : 'min-h-[50vh] py-12',
      )}
    >
      {fullscreen && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[30rem] sm:size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ultra/20"
            style={{ boxShadow: 'inset 0 0 100px rgb(139 92 246 / 0.2), 0 0 80px rgb(192 38 211 / 0.15)' }}
            aria-hidden
          />
          {/* Tactical HUD Header - Fully mobile friendly */}
          <div className="absolute top-4 sm:top-6 inset-x-3 sm:inset-x-8 flex items-center justify-between font-mono text-xs text-mute/80 z-20">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-display tracking-wider sm:tracking-widest text-gold font-bold text-[11px] sm:text-xs truncate">
                BGMI PROTOCOL
              </span>
              <span className="hidden md:inline border border-line px-2 py-0.5 rounded text-[10px] text-mute whitespace-nowrap">
                ASIA SERVER · 20ms
              </span>
            </div>
            {onComplete && (
              <button
                type="button"
                onClick={onComplete}
                className="clip-angle-sm shrink-0 flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 sm:px-4 py-1.5 font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-base transition cursor-pointer"
              >
                Skip Intro ➔
              </button>
            )}
          </div>
        </>
      )}

      {/* Soldier Shooting Art - Scaled nicely across mobile and desktop */}
      <div className={cn(
        'relative drop-shadow-[0_0_35px_rgba(192,38,211,0.35)] will-change-transform',
        fullscreen ? 'w-full max-w-[320px] sm:max-w-md md:max-w-xl' : 'w-full max-w-xs sm:max-w-sm'
      )}>
        <SoldierFiring />
      </div>

      {/* Tactical Ammo & Status Bar - Never clips text */}
      <div className="relative w-full max-w-[290px] sm:max-w-xs px-2">
        <div className="mb-2 flex items-center justify-between font-display text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.3em]">
          <span className="text-gold flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
            Firing Simulation
          </span>
          <span className="text-pink-400 font-mono font-bold">{ammoCount} / 30 AMMO</span>
        </div>
        <div className="flex h-2 sm:h-2.5 gap-1" aria-hidden>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="relative flex-1 overflow-hidden rounded-sm bg-white/10">
              <span
                className="sv-ammo absolute inset-0 bg-[linear-gradient(90deg,#fbbf24,#f472b6)]"
                style={{ animationDelay: `${i * -0.18}s` }}
              />
            </span>
          ))}
        </div>

        {/* Tip Container: Flexbox with generous height prevents cutoff on mobile wrap */}
        <div className="mt-3 min-h-[3.25rem] sm:min-h-[2.5rem] flex items-center justify-center text-center">
          <p className={cn(
            'text-xs sm:text-sm text-mute font-medium leading-relaxed max-w-xs transition-opacity duration-200',
            tipFade ? 'opacity-100' : 'opacity-0'
          )}>
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {fullscreen && (
        <div className="relative mt-1 sm:mt-2 flex flex-col items-center gap-1">
          <p className="font-display text-xl sm:text-2xl font-black tracking-widest">
            <span className="text-gradient-gold">KHUSHI</span>
            <span className="text-gradient ml-1">YT</span>
          </p>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] uppercase text-mute/70">
            OFFICIAL BATTLEGROUNDS HUB
          </span>
        </div>
      )}
    </div>
  );
}
