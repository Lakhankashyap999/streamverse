import { Crosshair, Flame, Gamepad2, Shield, Skull, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { SectionHeading, Reveal } from '../ui/Display';

interface StatMetric {
  id: string;
  label: string;
  value: number;
  decimals: number;
  suffix: string;
  prefix?: string;
  badge: string;
  badgeColor: string;
  icon: typeof Trophy;
  colorClass: string;
  description: string;
}

const STATS_DATA: StatMetric[] = [
  {
    id: 'kd',
    label: 'K/D Ratio',
    value: 5.84,
    decimals: 2,
    suffix: '',
    badge: 'Conqueror Tier',
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    icon: Crosshair,
    colorClass: 'text-gradient-gold',
    description: 'Eliminations per match across squad rank push',
  },
  {
    id: 'win_rate',
    label: 'Win Rate',
    value: 38.4,
    decimals: 1,
    suffix: '%',
    badge: 'Winner Winner',
    badgeColor: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10',
    icon: Trophy,
    colorClass: 'text-emerald-400',
    description: 'Chicken dinner conversion in classic matches',
  },
  {
    id: 'headshot',
    label: 'Headshot Accuracy',
    value: 29.6,
    decimals: 1,
    suffix: '%',
    badge: 'Glacier Precision',
    badgeColor: 'border-rose-400/40 text-rose-300 bg-rose-400/10',
    icon: Flame,
    colorClass: 'text-gradient',
    description: 'High-precision headshot elimination rate',
  },
  {
    id: 'damage',
    label: 'Avg Match Damage',
    value: 946,
    decimals: 0,
    suffix: ' HP',
    badge: 'Heavy Impact',
    badgeColor: 'border-purple-400/40 text-purple-300 bg-purple-400/10',
    icon: Zap,
    colorClass: 'text-violet-400',
    description: 'Consistent combat damage per encounter',
  },
  {
    id: 'highest_kill',
    label: 'Highest Match Kills',
    value: 26,
    decimals: 0,
    suffix: ' Kills',
    badge: 'Personal Record',
    badgeColor: 'border-red-400/40 text-red-300 bg-red-400/10',
    icon: Skull,
    colorClass: 'text-gradient-gold',
    description: 'Solo-vs-squad clutch in Pochinki drop',
  },
  {
    id: 'top10',
    label: 'Top 10 Survival Rate',
    value: 78.2,
    decimals: 1,
    suffix: '%',
    badge: 'Consistent Finish',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10',
    icon: Shield,
    colorClass: 'text-cyan-400',
    description: 'Surviving into final circle battleground',
  },
  {
    id: 'matches',
    label: 'Season Matches',
    value: 1420,
    decimals: 0,
    suffix: '+',
    badge: 'Marathon Push',
    badgeColor: 'border-fuchsia-400/40 text-fuchsia-300 bg-fuchsia-400/10',
    icon: Gamepad2,
    colorClass: 'text-gradient',
    description: '6-8 hour daily rank grind livestreams',
  },
  {
    id: 'revives',
    label: 'Squad Revives',
    value: 840,
    decimals: 0,
    suffix: '+',
    badge: 'Squad Backbone',
    badgeColor: 'border-pink-400/40 text-pink-300 bg-pink-400/10',
    icon: Sparkles,
    colorClass: 'text-blush',
    description: 'Clutch smoke-cover revives for teammates',
  },
];

export function PubgCareerStats() {
  return (
    <section className="container-x py-20 relative isolate" aria-labelledby="career-stats-heading">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-[140px]" />

      <SectionHeading
        eyebrow="Combat Telemetry"
        title="Battleground"
        highlight="Career Stats"
        id="career-stats-heading"
        description="Realtime Season performance metrics — animated live as you scroll into the battleground records."
      />

      {/* Primary Rank Banner */}
      <Reveal>
        <div className="gradient-border hud-corners relative mb-8 sm:mb-10 overflow-hidden rounded-2xl bg-card p-4 sm:p-8 shadow-2xl">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
              <div className="relative grid size-13 sm:size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 shadow-lg shadow-purple-500/30">
                <Trophy className="size-6 sm:size-8 text-white" aria-hidden />
                <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-gold font-bold">
                    CURRENT BGMI TIER
                  </span>
                  <span className="rounded bg-red-600/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-red-400 border border-red-500/30">
                    TOP 100 ASIA
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black font-display text-ink mt-0.5 tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>ACE DOMINATOR</span> <span className="text-gradient-gold">18★</span>
                </h3>
                <p className="text-xs sm:text-sm text-mute font-mono truncate">
                  BGMI ID: 5112658248 · Squad TPP · Asia Server (20ms)
                </p>
              </div>
            </div>

            {/* Quick Tactical Controls Tags */}
            <div className="flex flex-wrap gap-2.5 font-mono text-xs">
              <span className="rounded-lg border border-line bg-surface/80 px-3 py-1.5 text-mute">
                🎮 4-Finger Claw + Gyroscope
              </span>
              <span className="rounded-lg border border-line bg-surface/80 px-3 py-1.5 text-mute">
                ⚡ 90 FPS Ultra Extreme
              </span>
              <span className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-gold font-semibold">
                🔥 Rush & Rank Push Specialist
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Grid of 8 Animated Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_DATA.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} delay={idx * 0.06}>
              <div className="group panel relative h-full flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ultra/40 hover:shadow-[0_15px_30px_-10px_rgba(192,38,211,0.25)]">
                {/* Header with Icon and Badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-surface border border-line group-hover:border-blush/40 transition">
                      <Icon className="size-5 text-gold group-hover:text-blush transition" />
                    </span>
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Stat Title */}
                  <p className="text-xs font-semibold uppercase tracking-wider text-mute mb-1 font-display">
                    {item.label}
                  </p>

                  {/* Animated Counter Display */}
                  <div className="text-3xl sm:text-4xl font-black font-display tracking-tight my-1">
                    <AnimatedCounter
                      to={item.value}
                      decimals={item.decimals}
                      suffix={item.suffix}
                      prefix={item.prefix}
                      className={item.colorClass}
                      duration={1800}
                    />
                  </div>
                </div>

                {/* Subtitle description */}
                <p className="mt-3 text-xs text-mute/80 leading-relaxed border-t border-line/60 pt-3">
                  {item.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Signature Weapon Loadout */}
      <Reveal delay={0.25}>
        <div className="mt-10 panel p-6 border-line bg-card/60">
          <div className="flex items-center gap-2 mb-4 font-display text-sm font-bold uppercase tracking-widest text-gold">
            <Target className="size-4" />
            Signature Combat Loadout
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-fuchsia-300 uppercase tracking-widest block font-bold">PRIMARY AR</span>
              <p className="font-display font-bold text-base text-ink mt-0.5">M416 Glacier (Max)</p>
              <p className="text-xs text-mute mt-1 font-mono">5.56mm · 6x Scope · Compensator · Extended Mag</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-amber-300 uppercase tracking-widest block font-bold">SECONDARY SNIPER</span>
              <p className="font-display font-bold text-base text-ink mt-0.5">AWM Monster One-Shot</p>
              <p className="text-xs text-mute mt-1 font-mono">.300 Magnum · 8x Scope · Cheek Pad · Suppressor</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-cyan-300 uppercase tracking-widest block font-bold">CLOSE COMBAT / CQB</span>
              <p className="font-display font-bold text-base text-ink mt-0.5">UMP45 / Groza Rush</p>
              <p className="text-xs text-mute mt-1 font-mono">Laser Sight · Red Dot · Extreme Hipfire Accuracy</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
