import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Skull, Sparkles, Zap } from 'lucide-react';

const KILL_EVENTS = [
  {
    id: 1,
    killer: 'KhushiYT',
    weapon: 'M416 Glacier',
    victim: 'Pochinki_Squad',
    badge: 'HEADSHOT',
    distance: '142m',
    color: 'text-cyan-300',
    icon: Crosshair,
  },
  {
    id: 2,
    killer: 'KhushiYT',
    weapon: 'AWM .300 Magnum',
    victim: 'BridgeCamper_OP',
    badge: 'SNIPER CLUTCH',
    distance: '324m',
    color: 'text-amber-300',
    icon: Zap,
  },
  {
    id: 3,
    killer: 'KhushiYT',
    weapon: 'Groza 7.62',
    victim: 'LastSquad_Alive',
    badge: '1v4 SQUAD WIPE',
    distance: '38m',
    color: 'text-pink-300',
    icon: Skull,
  },
  {
    id: 4,
    killer: 'KhushiYT',
    weapon: 'Frag Grenade',
    victim: 'CampCharlie_Team',
    badge: 'QUADRA KNOCK',
    distance: '25m',
    color: 'text-emerald-300',
    icon: Sparkles,
  },
  {
    id: 5,
    killer: 'KhushiYT',
    weapon: 'UMP45 Beast',
    victim: 'Bootcamp_Rival',
    badge: 'RUSH HEADSHOT',
    distance: '18m',
    color: 'text-rose-300',
    icon: Crosshair,
  },
];

export function PubgLiveKillFeed({ className = '' }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % KILL_EVENTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const event = KILL_EVENTS[index];
  const Icon = event.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-red-500/30 bg-[#0d1124]/90 p-2 sm:p-2.5 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.6)] ${className}`}
      role="region"
      aria-label="Live Battle Kill Feed"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
        {/* Header HUD tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
            <Icon className="size-3 text-red-400" aria-hidden="true" />
            BATTLE LOG // KILL FEED
          </span>
        </div>

        {/* Dynamic Animated Kill Notification */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-mono"
            >
              <span className="font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                {event.killer}
              </span>
              <span className="text-white/60 text-[11px]">eliminated</span>
              <span className="text-rose-400 font-semibold underline decoration-rose-500/40">
                {event.victim}
              </span>
              <span className="text-white/40">with</span>
              <span className={`px-1.5 py-0.5 rounded font-bold text-[11px] bg-white/5 border border-white/10 ${event.color}`}>
                ⚡ {event.weapon}
              </span>
              <span className="ml-auto shrink-0 rounded bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-red-300">
                {event.badge} [{event.distance}]
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
