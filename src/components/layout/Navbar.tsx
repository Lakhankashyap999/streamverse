import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, Radio, X } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { youtubeLiveUrl, youtubeSubscribeUrl } from '../../config/site';
import { useScrollLock } from '../../hooks';
import { cn } from '../../utils/misc';
import { ExternalButton } from '../ui/Button';
import { SocialIconRow } from './SocialLinks';

export const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/streams', label: 'Streams' },
  { to: '/highlights', label: 'Highlights' },
  { to: '/community', label: 'Community' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const WAVE_LETTERS = ['S', 'u', 'b', 's', 'c', 'r', 'i', 'b', 'e'];

export function WaveSubscribeText({ uppercase = false }: { uppercase?: boolean }) {
  const letters = uppercase
    ? ['S', 'U', 'B', 'S', 'C', 'R', 'I', 'B', 'E']
    : WAVE_LETTERS;

  return (
    <span className="inline-flex items-center tracking-wider font-extrabold select-none py-0.5" aria-label="Subscribe">
      {letters.map((char, idx) => (
        <span
          key={idx}
          className="wave-char"
          style={{ '--char-i': idx } as React.CSSProperties}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export function Logo({
  compact = false,
  showStatus = false,
  isLive = false,
}: {
  compact?: boolean;
  showStatus?: boolean;
  isLive?: boolean;
}) {
  const { profile } = useProfile();
  return (
    <Link to="/" className="group flex items-center gap-1.5 sm:gap-2 rounded-lg shrink-0 min-w-0" aria-label={`${profile.gaming_name} — home`}>
      <img src="/icons/logo.svg" alt="" width={32} height={32} className="size-7 sm:size-9 transition-transform group-hover:rotate-6 shrink-0" />
      {!compact && (
        <div className="flex flex-col justify-center leading-none">
          <span className="font-display text-sm sm:text-lg font-bold leading-none tracking-wide flex items-center gap-1 whitespace-nowrap shrink-0">
            <span className="text-gradient-gold">{profile.gaming_name.slice(0, -2) || profile.gaming_name}</span>
            <span className="text-gradient">{profile.gaming_name.length > 2 ? profile.gaming_name.slice(-2) : ''}</span>
            <span className="text-[11px] sm:text-xs text-pink-400 select-none">🌸</span>
          </span>
          {showStatus && (
            <span className="flex items-center gap-1 mt-1 select-none font-mono text-[9px] sm:text-[10px] tracking-wider leading-none">
              {isLive ? (
                <span className="inline-flex items-center gap-1 font-bold text-red-400">
                  <span className="relative flex size-1.5 shrink-0">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                  </span>
                  <span>LIVE NOW</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                  <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>OFFLINE</span>
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function Navbar() {
  const { profile } = useProfile();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const reduce = useReducedMotion();
  const menuBtn = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const node = drawer.current;
    setTimeout(() => node?.querySelector<HTMLElement>('a,button')?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
      if (e.key === 'Tab' && node) {
        const els = Array.from(node.querySelectorAll<HTMLElement>('a[href],button'));
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const [isLive, setIsLive] = useState(profile.live_status_mode === 'live');

  useEffect(() => {
    if (profile.live_status_mode === 'live') {
      setIsLive(true);
      return;
    }
    if (profile.live_status_mode === 'offline') {
      setIsLive(false);
      return;
    }
    let alive = true;
    const checkStatus = () => {
      fetch(`/api/live-status?t=${Date.now()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (alive && data) {
            setIsLive(Boolean(data.isLive));
          }
        })
        .catch(() => {
          if (alive) setIsLive(false);
        });
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [profile.live_status_mode]);

  const liveUrl = youtubeLiveUrl(profile);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 bg-[#090b16]/95 backdrop-blur-md border-b transition-colors duration-200',
          scrolled || open ? 'border-line/70 shadow-lg shadow-black/30' : 'border-line/30',
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-neon focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <nav className="container-x flex h-16 items-center justify-between gap-4 lg:h-18" aria-label="Main">
          <Logo showStatus isLive={isLive} />
          <ul className="hidden items-center gap-1 lg:flex" role="menubar">
            {NAV_ITEMS.map((item, idx) => (
              <li key={item.to} className="flex items-center">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative px-3 py-1.5 font-display text-[0.85rem] lg:text-[0.90rem] font-bold tracking-[0.16em] uppercase transition-all duration-200 flex items-center gap-1.5',
                      isActive
                        ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.75)]'
                        : 'text-slate-300/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="text-[#fbbf24] text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse select-none inline-flex items-center"
                          aria-hidden="true"
                        >
                          ✦
                        </span>
                      )}
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-2 -bottom-1 h-[2.5px] rounded-full bg-gradient-to-r from-[#ff007f] via-[#ec4899] to-[#fbbf24] shadow-[0_0_12px_rgba(255,0,127,0.95),0_0_24px_rgba(251,191,36,0.7)]"
                          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 32 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
                {idx < NAV_ITEMS.length - 1 && (
                  <span className="text-slate-600/70 select-none text-[8px] mx-1" aria-hidden="true">
                    •
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Official YouTube Subscribe Button with Smooth Wave Animation */}
            <a
              href={youtubeSubscribeUrl(profile)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold transition shadow-[0_0_14px_rgba(239,68,68,0.5)] cursor-pointer hover:scale-105 active:scale-95 border border-red-400/40 shrink-0"
              aria-label="Subscribe to KhushiYT on YouTube"
            >
              <span className="bell-shake text-xs shrink-0 select-none" aria-hidden="true">
                🔔
              </span>
              <WaveSubscribeText />
              <span className="hidden md:inline text-[9px] bg-black/35 px-1.5 py-0.5 rounded-full font-mono font-bold text-amber-200 ml-0.5">
                27.6K
              </span>
            </a>

            <button
              ref={menuBtn}
              type="button"
              className="glass grid size-9 sm:size-10 place-items-center rounded-xl lg:hidden shrink-0 text-slate-200 hover:text-white"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Side Drawer (Mounted directly to body via portal for 100% reliable visibility) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="lg:hidden">
                {/* Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm touch-none"
                  aria-hidden="true"
                />

                {/* Side Drawer Panel */}
                <motion.div
                  id="mobile-nav"
                  ref={drawer}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Site navigation"
                  initial={reduce ? { opacity: 0 } : { x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { x: '100%' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                  className="fixed top-0 right-0 bottom-0 z-[9999] w-[85vw] max-w-[340px] bg-[#090b16] border-l border-white/10 shadow-[-16px_0_40px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto overscroll-contain p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                      <Logo showStatus isLive={isLive} />
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="glass grid size-9 place-items-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="size-5" />
                      </button>
                    </div>

                    {/* Navigation Section Title */}
                    <div className="flex items-center justify-between px-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        // Navigation Menu
                      </span>
                      <span className="text-[10px] text-pink-400 font-mono tracking-wider font-bold">
                        KHUSHIYT
                      </span>
                    </div>

                    {/* Option 5 Mobile Nav Items */}
                    <ul className="flex flex-col gap-2">
                      {NAV_ITEMS.map((item, i) => (
                        <motion.li
                          key={item.to}
                          initial={reduce ? false : { opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <NavLink
                            to={item.to}
                            end={item.to === '/'}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                'relative flex items-center justify-between rounded-xl px-4 py-3 font-display text-[0.95rem] font-bold tracking-[0.14em] uppercase transition-all duration-200 overflow-hidden',
                                isActive
                                  ? 'bg-gradient-to-r from-pink-500/15 via-amber-500/10 to-transparent border border-pink-500/40 text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                                  : 'text-slate-300/85 hover:text-white hover:bg-white/5 border border-transparent',
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                {isActive && (
                                  <span className="absolute left-0 inset-y-1.5 w-1 rounded-r-full bg-gradient-to-b from-[#ff007f] via-[#ec4899] to-[#fbbf24] shadow-[0_0_10px_rgba(255,0,127,0.9)]" />
                                )}
                                <div className="flex items-center gap-2.5">
                                  {isActive ? (
                                    <span className="text-[#fbbf24] text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse select-none">
                                      ✦
                                    </span>
                                  ) : (
                                    <span className="text-slate-600 text-[10px] select-none">•</span>
                                  )}
                                  <span className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : ''}>
                                    {item.label}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    'font-mono text-xs font-bold',
                                    isActive ? 'text-amber-400' : 'text-slate-500',
                                  )}
                                >
                                  0{i + 1}
                                </span>
                              </>
                            )}
                          </NavLink>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="flex flex-col gap-3 pt-5 border-t border-white/10 mt-4">
                    <a
                      href={youtubeSubscribeUrl(profile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white py-3 px-4 font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.45)] transition active:scale-95"
                    >
                      <span className="bell-shake text-sm select-none" aria-hidden="true">
                        🔔
                      </span>
                      <WaveSubscribeText />
                      <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-mono text-amber-200">
                        27.6K
                      </span>
                    </a>

                    <ExternalButton
                      href={isLive ? liveUrl : (profile.youtube_url ?? liveUrl)}
                      hosts={['youtube.com']}
                      size="md"
                      icon={<Radio className="size-4" aria-hidden />}
                    >
                      {isLive ? 'Watch Live on YouTube' : 'Visit YouTube Channel'}
                    </ExternalButton>

                    <div className="pt-1 flex justify-center">
                      <SocialIconRow profile={profile} />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
