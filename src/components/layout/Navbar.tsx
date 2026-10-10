import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, Radio, X } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { youtubeLiveUrl } from '../../config/site';
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

export function Logo({ compact = false }: { compact?: boolean }) {
  const { profile } = useProfile();
  return (
    <Link to="/" className="group flex items-center gap-2.5 rounded-lg" aria-label={`${profile.gaming_name} — home`}>
      <img src="/icons/logo.svg" alt="" width={36} height={36} className="size-9 transition-transform group-hover:rotate-6" />
      {!compact && (
        <span className="font-display text-lg font-bold leading-none tracking-wide">
          <span className="text-gradient-gold">{profile.gaming_name.slice(0, -2) || profile.gaming_name}</span>
          <span className="text-gradient">{profile.gaming_name.length > 2 ? profile.gaming_name.slice(-2) : ''}</span>
        </span>
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

  const liveUrl = youtubeLiveUrl(profile);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300',
        scrolled || open ? 'border-b border-line bg-base/80 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-neon focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <nav className="container-x flex h-16 items-center justify-between gap-4 lg:h-18" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-lg px-3.5 py-2 text-[0.95rem] font-medium transition-colors',
                    isActive ? 'text-ink' : 'text-mute hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[linear-gradient(90deg,#fbbf24,#f472b6,#8b5cf6)]"
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ExternalButton
            href={liveUrl}
            hosts={['youtube.com']}
            size="sm"
            className="hidden sm:inline-flex"
            icon={<Radio className="size-4" aria-hidden />}
          >
            Watch Live
          </ExternalButton>
          <button
            ref={menuBtn}
            type="button"
            className="glass grid size-11 place-items-center rounded-xl lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-base/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-x flex flex-col gap-6 py-6">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.to}
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-xl font-semibold',
                          isActive ? 'bg-neon/15 text-ink' : 'text-mute hover:bg-white/5 hover:text-ink',
                        )
                      }
                    >
                      {item.label}
                      <span className="font-display text-xs text-gold/70">0{i + 1}</span>
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <ExternalButton href={liveUrl} hosts={['youtube.com']} size="lg" icon={<Radio className="size-5" aria-hidden />}>
                Watch Live on YouTube
              </ExternalButton>
              <SocialIconRow profile={profile} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
