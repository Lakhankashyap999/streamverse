import { useState } from 'react';
import {
  Crosshair,
  Flame,
  Gamepad2,
  Shield,
  Skull,
  Sparkles,
  Target,
  Trophy,
  Zap,
  ChevronDown,
  Activity,
} from 'lucide-react';
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

/** Verified Official In-Game Stats from Screenshot (media_1791653398557.jpg) */
const STATS_DATA: StatMetric[] = [
  {
    id: 'fd_ratio',
    label: 'F/D Ratio (K/D)',
    value: 9.16,
    decimals: 2,
    suffix: '',
    badge: 'SSS Rating',
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    icon: Crosshair,
    colorClass: 'text-gradient-gold',
    description: 'Eliminations to deaths ratio in Ranked TPP Squad',
  },
  {
    id: 'eliminations',
    label: 'Total Eliminations',
    value: 2308,
    decimals: 0,
    suffix: '',
    badge: '2.3K+ Frags',
    badgeColor: 'border-rose-400/40 text-rose-300 bg-rose-400/10',
    icon: Skull,
    colorClass: 'text-rose-400',
    description: 'Total enemy players eliminated across 252 matches',
  },
  {
    id: 'matches',
    label: 'Matches Played',
    value: 252,
    decimals: 0,
    suffix: '',
    badge: 'Ranked Push',
    badgeColor: 'border-purple-400/40 text-purple-300 bg-purple-400/10',
    icon: Gamepad2,
    colorClass: 'text-violet-400',
    description: 'Current season competitive squad matches grinded',
  },
  {
    id: 'win_rate',
    label: 'Win Ratio',
    value: 45.6,
    decimals: 1,
    suffix: '%',
    badge: '115 Dinners',
    badgeColor: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10',
    icon: Trophy,
    colorClass: 'text-emerald-400',
    description: 'Winner Winner Chicken Dinners conversion rate (115 Wins)',
  },
  {
    id: 'top10_rate',
    label: 'Top 10 Rate',
    value: 86.1,
    decimals: 1,
    suffix: '%',
    badge: '217 Top 10s',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10',
    icon: Shield,
    colorClass: 'text-cyan-400',
    description: 'Survival into final circle top 10 squads (217 matches)',
  },
  {
    id: 'avg_damage',
    label: 'AVG Match Damage',
    value: 2137.5,
    decimals: 1,
    suffix: ' HP',
    badge: 'Heavy Impact',
    badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    icon: Zap,
    colorClass: 'text-amber-300',
    description: 'Consistent combat firepower dealt per match',
  },
  {
    id: 'most_kills',
    label: 'Most Eliminations',
    value: 24,
    decimals: 0,
    suffix: ' Kills',
    badge: 'Single Match Record',
    badgeColor: 'border-red-400/40 text-red-300 bg-red-400/10',
    icon: Flame,
    colorClass: 'text-gradient-gold',
    description: 'Highest elimination clutch in a single classic match',
  },
  {
    id: 'total_damage',
    label: 'Total Season Damage',
    value: 538658,
    decimals: 0,
    suffix: ' HP',
    badge: '538K+ Firepower',
    badgeColor: 'border-fuchsia-400/40 text-fuchsia-300 bg-fuchsia-400/10',
    icon: Sparkles,
    colorClass: 'text-gradient',
    description: 'Total cumulative combat damage dealt to opponents',
  },
];

export function PubgCareerStats() {
  const [chartType, setChartType] = useState<'radar' | 'curve'>('radar');

  return (
    <section className="container-x py-16 sm:py-24 relative isolate overflow-x-hidden" aria-labelledby="career-stats-heading">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-25" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-[140px]" />

      <SectionHeading
        eyebrow="Combat Telemetry"
        title="Official BGMI"
        highlight="Career Statistics"
        id="career-stats-heading"
        description="Verified in-game performance metrics — Season ranked TPP Squad statistics updated directly from player profile."
      />

      {/* ────────────────── OFFICIAL BGMI IN-GAME STATS DASHBOARD ────────────────── */}
      <Reveal>
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-line bg-[#101422] shadow-2xl">
          {/* Header Bar with Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/80 bg-[#161c30]/90 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-ink">
                DATA <span className="text-mute">·</span> STATISTICS
              </span>
              <span className="hidden sm:inline-block rounded bg-red-600/20 px-2 py-0.5 text-[10px] font-mono font-bold text-red-400 border border-red-500/30">
                VERIFIED ID: 5112658248
              </span>
            </div>

            {/* Tactical Dropdown Badges */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-1 rounded bg-[#212946] px-2.5 py-1 text-ink border border-line">
                CURRENT SEASON <ChevronDown className="size-3 text-mute" />
              </span>
              <span className="flex items-center gap-1 rounded bg-[#212946] px-2.5 py-1 text-ink border border-line">
                RANKED <ChevronDown className="size-3 text-mute" />
              </span>
              <span className="flex items-center gap-1 rounded bg-[#212946] px-2.5 py-1 text-ink border border-line">
                TPP Squad <ChevronDown className="size-3 text-mute" />
              </span>
            </div>
          </div>

          {/* Main Telemetry Container (Split: Radar / SSS on Left, Full Table on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-line/60">
            {/* Left Column: SSS Grade & 5-Axis Combat Radar */}
            <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col items-center justify-between bg-[#121629]/60">
              {/* SSS Badge */}
              <div className="text-center w-full">
                <div className="inline-block relative">
                  <h3 className="font-display font-black text-5xl sm:text-6xl tracking-tighter text-transparent bg-clip-text bg-[linear-gradient(180deg,#fff8db_0%,#fbbf24_45%,#d97706_85%,#92400e_100%)] drop-shadow-[0_4px_16px_rgba(251,191,36,0.4)]">
                    SSS
                  </h3>
                  <div className="text-xs font-mono text-ink font-bold tracking-wider mt-0.5">
                    Rating: <span className="text-gold font-bold text-sm">96.5</span>
                  </div>
                </div>
              </div>

              {/* Pentagon Radar Chart SVG */}
              <div className="relative my-3 w-full max-w-[270px] aspect-[260/220]">
                <svg viewBox="0 0 260 220" className="size-full overflow-visible" role="img" aria-label="BGMI 5-Axis Combat Telemetry Radar">
                  <defs>
                    <linearGradient id="radar-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f75d9" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#253c7a" stopOpacity="0.55" />
                    </linearGradient>
                  </defs>

                  {/* Concentric Pentagon Background Grids (20%, 40%, 60%, 80%, 100%) */}
                  {[0.2, 0.4, 0.6, 0.8, 1].map((scale, idx) => (
                    <polygon
                      key={idx}
                      points={`
                        ${130},${115 - 75 * scale}
                        ${130 + 75 * scale * 0.951},${115 - 75 * scale * 0.309}
                        ${130 + 75 * scale * 0.588},${115 + 75 * scale * 0.809}
                        ${130 - 75 * scale * 0.588},${115 + 75 * scale * 0.809}
                        ${130 - 75 * scale * 0.951},${115 - 75 * scale * 0.309}
                      `}
                      fill="none"
                      stroke="#283556"
                      strokeWidth={idx === 4 ? '1.5' : '1'}
                      strokeDasharray={idx < 4 ? '2 2' : undefined}
                    />
                  ))}

                  {/* Center Spoke Lines */}
                  {[
                    [130, 115 - 75],
                    [130 + 75 * 0.951, 115 - 75 * 0.309],
                    [130 + 75 * 0.588, 115 + 75 * 0.809],
                    [130 - 75 * 0.588, 115 + 75 * 0.809],
                    [130 - 75 * 0.951, 115 - 75 * 0.309],
                  ].map(([x, y], i) => (
                    <line key={i} x1="130" y1="115" x2={x} y2={y} stroke="#283556" strokeWidth="1" />
                  ))}

                  {/* Radar Polygon with Exact Values */}
                  {/* Top: 98.2 | Feedback: 90.6 | Support: 100.0 | Survived: 88.2 | Combat: 97.6 */}
                  <polygon
                    points="130,41.35 194.63,94.00 174.08,175.68 91.12,168.52 60.39,92.38"
                    fill="url(#radar-fill)"
                    stroke="#7096e8"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_12px_rgba(79,117,217,0.6)]"
                  />

                  {/* Vertex Points */}
                  {[
                    [130, 41.35],
                    [194.63, 94.00],
                    [174.08, 175.68],
                    [91.12, 168.52],
                    [60.39, 92.38],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
                  ))}

                  {/* Data Labels Matching In-Game Screenshot */}
                  <text x="130" y="24" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Win Ratio
                  </text>
                  <text x="130" y="36" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    98.2
                  </text>

                  <text x="210" y="90" textAnchor="start" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Feedback
                  </text>
                  <text x="210" y="102" textAnchor="start" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    90.6
                  </text>

                  <text x="186" y="196" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Support
                  </text>
                  <text x="186" y="208" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    100.0
                  </text>

                  <text x="74" y="196" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Survived
                  </text>
                  <text x="74" y="208" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    88.2
                  </text>

                  <text x="50" y="90" textAnchor="end" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Combat
                  </text>
                  <text x="50" y="102" textAnchor="end" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    97.6
                  </text>
                </svg>
              </div>

              {/* Chart Switcher Buttons */}
              <div className="flex items-center gap-1 bg-[#1e253d] p-1 rounded border border-line">
                <button
                  type="button"
                  onClick={() => setChartType('radar')}
                  className={`px-3 py-1 text-xs font-mono rounded transition cursor-pointer ${
                    chartType === 'radar' ? 'bg-[#3b4872] text-white font-bold' : 'text-mute hover:text-ink'
                  }`}
                >
                  ⬟ Radar
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('curve')}
                  className={`px-3 py-1 text-xs font-mono rounded transition cursor-pointer ${
                    chartType === 'curve' ? 'bg-[#3b4872] text-white font-bold' : 'text-mute hover:text-ink'
                  }`}
                >
                  📈 Curve
                </button>
              </div>
            </div>

            {/* Right Column: 5 Top Overview Columns + 4 Performance Matrix Rows */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              {/* Top Overview Black Strip (5 Columns) */}
              <div className="grid grid-cols-5 divide-x divide-line/60 bg-[#0d101c] py-4 px-2 sm:px-4 text-center border-b border-line/60">
                <div className="px-1 sm:px-2">
                  <p className="font-mono text-[9px] sm:text-[11px] text-mute uppercase tracking-wider">Matches Played</p>
                  <p className="font-mono text-base sm:text-2xl md:text-3xl font-bold text-ink mt-0.5">252</p>
                </div>
                <div className="px-1 sm:px-2">
                  <p className="font-mono text-[9px] sm:text-[11px] text-mute uppercase tracking-wider">Wins</p>
                  <p className="font-mono text-base sm:text-2xl md:text-3xl font-bold text-emerald-400 mt-0.5">115</p>
                </div>
                <div className="px-1 sm:px-2">
                  <p className="font-mono text-[9px] sm:text-[11px] text-mute uppercase tracking-wider">Top 10</p>
                  <p className="font-mono text-base sm:text-2xl md:text-3xl font-bold text-cyan-400 mt-0.5">217</p>
                </div>
                <div className="px-1 sm:px-2">
                  <p className="font-mono text-[9px] sm:text-[11px] text-mute uppercase tracking-wider">Eliminations</p>
                  <p className="font-mono text-base sm:text-2xl md:text-3xl font-bold text-rose-400 mt-0.5">2308</p>
                </div>
                <div className="px-1 sm:px-2">
                  <p className="font-mono text-[9px] sm:text-[11px] text-mute uppercase tracking-wider">F/D Ratio</p>
                  <p className="font-mono text-base sm:text-2xl md:text-3xl font-bold text-gradient-gold mt-0.5">9.16</p>
                </div>
              </div>

              {/* 4 Performance Rows Matching the In-Game UI */}
              <div className="divide-y divide-line/40 font-mono">
                {/* Row 1: Chicken Dinner / Win Stats */}
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-9 sm:size-11 shrink-0 rounded-xl bg-amber-400/10 border border-amber-400/20 grid place-items-center text-amber-300">
                    <Trophy className="size-5 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Win Ratio</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">45.6%</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Top 10 Rate</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">86.1%</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Accuracy</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">15.4%</p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Reticle / Precision Stats */}
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-9 sm:size-11 shrink-0 rounded-xl bg-rose-400/10 border border-rose-400/20 grid place-items-center text-rose-300">
                    <Crosshair className="size-5 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Headshot Rate</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">15.8%</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Headshots</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">364</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">AVG Damage</p>
                      <p className="text-xs sm:text-base font-bold text-amber-300 mt-0.5">2137.5</p>
                    </div>
                  </div>
                </div>

                {/* Row 3: Ammo / Damage Stats */}
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-9 sm:size-11 shrink-0 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 grid place-items-center text-fuchsia-300">
                    <Zap className="size-5 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Total Damage</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">538658.6</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Most Eliminations</p>
                      <p className="text-xs sm:text-base font-bold text-rose-400 mt-0.5">24</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Highest Damage</p>
                      <p className="text-xs sm:text-base font-bold text-gold mt-0.5">10299</p>
                    </div>
                  </div>
                </div>

                {/* Row 4: Teamplay / Movement Stats */}
                <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-9 sm:size-11 shrink-0 rounded-xl bg-cyan-400/10 border border-cyan-400/20 grid place-items-center text-cyan-300">
                    <Shield className="size-5 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Total Assists</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">1024</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Avg. Assists</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">4.1</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-mute uppercase">Longest Traveled</p>
                      <p className="text-xs sm:text-base font-bold text-ink mt-0.5">18.41 KM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom In-Game Actions */}
              <div className="flex items-center justify-between border-t border-line/60 bg-[#0e1220] px-4 py-3 sm:px-6 font-mono text-xs text-mute">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-mute hover:text-ink cursor-pointer transition">
                    <Shield className="size-3.5 text-rose-400" /> Report
                  </span>
                  <span className="flex items-center gap-1.5 text-mute hover:text-ink cursor-pointer transition">
                    <Activity className="size-3.5 text-cyan-400" /> Compare
                  </span>
                </div>
                <span className="text-[11px] text-mute/80 hidden sm:inline">
                  Asia Server · Squad TPP · Updated Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ────────────────── 8 ANIMATED METRIC CARDS ON SCROLL ────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_DATA.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} delay={idx * 0.05}>
              <div className="group panel relative h-full flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ultra/40 hover:shadow-[0_15px_30px_-10px_rgba(192,38,211,0.25)]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-surface border border-line group-hover:border-blush/40 transition">
                      <Icon className="size-5 text-gold group-hover:text-blush transition" />
                    </span>
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-mute mb-1 font-display">
                    {item.label}
                  </p>

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

                <p className="mt-3 text-xs text-mute/80 leading-relaxed border-t border-line/60 pt-3">
                  {item.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* ────────────────── SIGNATURE COMBAT LOADOUT ────────────────── */}
      <Reveal delay={0.2}>
        <div className="mt-10 panel p-6 border-line bg-card/60">
          <div className="flex items-center gap-2 mb-4 font-display text-sm font-bold uppercase tracking-widest text-gold">
            <Target className="size-4" />
            Signature Combat Loadout & Sensitivity
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-fuchsia-300 uppercase tracking-widest block font-bold">PRIMARY AR</span>
              <p className="font-display font-bold text-base text-ink mt-0.5">M416 Glacier (Max)</p>
              <p className="text-xs text-mute mt-1 font-mono">5.56mm · 6x to 3x Pull · Compensator · Ext. Quickdraw Mag</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-amber-300 uppercase tracking-widest block font-bold">SECONDARY SNIPER</span>
              <p className="font-display font-bold text-base text-ink mt-0.5">AWM Monster One-Shot</p>
              <p className="text-xs text-mute mt-1 font-mono">.300 Magnum · 8x Scope · Cheek Pad · Suppressor</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-cyan-300 uppercase tracking-widest block font-bold">CLOSE COMBAT / CQB</span>
              <p className="font-display font-bold text-base text-ink mt-0.5">UMP45 / DBS Rush</p>
              <p className="text-xs text-mute mt-1 font-mono">Laser Sight · Red Dot · Extreme Hipfire Accuracy</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
