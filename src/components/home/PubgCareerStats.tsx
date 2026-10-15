import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Shield,
  Target,
  Trophy,
  Zap,
  ChevronDown,
  Activity,
  Award,
  Crown,
  Check,
  Heart,
  Copy,
} from 'lucide-react';
import { SectionHeading, Reveal } from '../ui/Display';

export interface SeasonData {
  id: string;
  name: string;
  shortName: string;
  tierBadge: string;
  tierScore: string;
  tierLabel: string;
  isCurrent?: boolean;
  radar: {
    winRatio: number;
    feedback: number;
    support: number;
    survived: number;
    combat: number;
  };
  overview: {
    matches: number;
    wins: number;
    top10: number;
    eliminations: number;
    fdRatio: number;
  };
  details: {
    winRatioPct: string;
    top10RatePct: string;
    accuracyPct: string;
    headshotRatePct: string;
    headshots: number;
    avgDamage: string;
    totalDamage: string;
    mostEliminations: number;
    highestDamage: number;
    totalAssists: number;
    avgAssists: string;
    longestTraveled: string;
  };
}

/** Verified Official In-Game Season Records from Screenshots */
const SEASONS: SeasonData[] = [
  {
    id: 'current',
    name: 'CURRENT SEASON',
    shortName: 'Current Season',
    tierBadge: 'Ace Dominator ⭐ 24',
    tierScore: '8544',
    tierLabel: 'Season Rating · Rank #817 (Top Region)',
    isCurrent: true,
    radar: {
      winRatio: 98.5,
      feedback: 90.2,
      support: 100.0,
      survived: 88.5,
      combat: 97.2,
    },
    overview: {
      matches: 258,
      wins: 118,
      top10: 217,
      eliminations: 2379,
      fdRatio: 9.22,
    },
    details: {
      winRatioPct: '45.7%',
      top10RatePct: '84.1%',
      accuracyPct: '12.5%',
      headshotRatePct: '18.2%',
      headshots: 433,
      avgDamage: '2127.8',
      totalDamage: '548983.0',
      mostEliminations: 27,
      highestDamage: 4890,
      totalAssists: 1084,
      avgAssists: '4.2',
      longestTraveled: '18.15 KM',
    },
  },
  {
    id: 's30',
    name: 'SEASON 30',
    shortName: 'Season 30',
    tierBadge: 'SSS',
    tierScore: '96.9',
    tierLabel: 'Combat Rating · SSS Grade',
    radar: {
      winRatio: 98.9,
      feedback: 91.3,
      support: 100.0,
      survived: 89.0,
      combat: 98.0,
    },
    overview: {
      matches: 598,
      wins: 285,
      top10: 544,
      eliminations: 5727,
      fdRatio: 9.58,
    },
    details: {
      winRatioPct: '47.7%',
      top10RatePct: '91.0%',
      accuracyPct: '12.7%',
      headshotRatePct: '16.0%',
      headshots: 915,
      avgDamage: '1671.7',
      totalDamage: '999665.8',
      mostEliminations: 30,
      highestDamage: 8357,
      totalAssists: 2541,
      avgAssists: '4.2',
      longestTraveled: '17.28 KM',
    },
  },
  {
    id: 's29',
    name: 'SEASON 29',
    shortName: 'Season 29',
    tierBadge: 'SSS',
    tierScore: '94.7',
    tierLabel: 'Combat Rating · SSS Grade',
    radar: {
      winRatio: 98.1,
      feedback: 86.2,
      support: 100.0,
      survived: 83.8,
      combat: 94.1,
    },
    overview: {
      matches: 338,
      wins: 153,
      top10: 288,
      eliminations: 2340,
      fdRatio: 6.92,
    },
    details: {
      winRatioPct: '45.3%',
      top10RatePct: '85.2%',
      accuracyPct: '11.6%',
      headshotRatePct: '18.7%',
      headshots: 437,
      avgDamage: '1185.8',
      totalDamage: '400784.8',
      mostEliminations: 25,
      highestDamage: 5314,
      totalAssists: 1180,
      avgAssists: '3.5',
      longestTraveled: '16.25 KM',
    },
  },
  {
    id: 's28',
    name: 'SEASON 28',
    shortName: 'Season 28',
    tierBadge: 'SSS',
    tierScore: '96.0',
    tierLabel: 'Combat Rating · SSS Grade',
    radar: {
      winRatio: 98.9,
      feedback: 88.7,
      support: 100.0,
      survived: 88.1,
      combat: 95.9,
    },
    overview: {
      matches: 508,
      wins: 267,
      top10: 461,
      eliminations: 4056,
      fdRatio: 7.98,
    },
    details: {
      winRatioPct: '52.6%',
      top10RatePct: '90.7%',
      accuracyPct: '12.0%',
      headshotRatePct: '21.0%',
      headshots: 853,
      avgDamage: '1281.0',
      totalDamage: '650732.8',
      mostEliminations: 27,
      highestDamage: 3734,
      totalAssists: 1750,
      avgAssists: '3.4',
      longestTraveled: '16.09 KM',
    },
  },
  {
    id: 's27',
    name: 'S27',
    shortName: 'Season 27',
    tierBadge: 'SSS',
    tierScore: '97.7',
    tierLabel: 'Combat Rating · SSS Grade',
    radar: {
      winRatio: 99.2,
      feedback: 93.7,
      support: 100.0,
      survived: 92.4,
      combat: 97.9,
    },
    overview: {
      matches: 637,
      wins: 400,
      top10: 593,
      eliminations: 6042,
      fdRatio: 9.49,
    },
    details: {
      winRatioPct: '62.8%',
      top10RatePct: '93.1%',
      accuracyPct: '12.3%',
      headshotRatePct: '17.5%',
      headshots: 1058,
      avgDamage: '1457.5',
      totalDamage: '928440.3',
      mostEliminations: 29,
      highestDamage: 4036,
      totalAssists: 2194,
      avgAssists: '3.4',
      longestTraveled: '17.31 KM',
    },
  },
  {
    id: 'c9s26',
    name: 'C9S26',
    shortName: 'Cycle 9 Season 26',
    tierBadge: 'SS+',
    tierScore: '94.4',
    tierLabel: 'Combat Rating · SS+ Grade',
    radar: {
      winRatio: 98.0,
      feedback: 85.6,
      support: 100.0,
      survived: 81.7,
      combat: 94.6,
    },
    overview: {
      matches: 632,
      wins: 256,
      top10: 533,
      eliminations: 4650,
      fdRatio: 7.36,
    },
    details: {
      winRatioPct: '40.5%',
      top10RatePct: '84.3%',
      accuracyPct: '12.3%',
      headshotRatePct: '18.0%',
      headshots: 835,
      avgDamage: '1201.0',
      totalDamage: '759002.6',
      mostEliminations: 25,
      highestDamage: 3205,
      totalAssists: 2107,
      avgAssists: '3.3',
      longestTraveled: '23.99 KM',
    },
  },
];

/** Verified In-Game Honor Titles from Screenshot (media_1791724431585_fb07fbcb.jpg) */
const VERIFIED_TITLES = [
  { name: 'Season 12 Conq', type: 'Conqueror Crown', tier: 'red', desc: 'Ranked Season 12 Top 500 Conqueror' },
  { name: 'Mythic Fashion', type: 'Mythic Collection', tier: 'red', desc: '300+ Permanent Mythic Outfits' },
  { name: 'Unique Destiny', type: 'Special Achievement', tier: 'red', desc: '6000+ Achievement Milestone' },
  { name: 'Perfectionist', type: 'Royale Pass Mastery', tier: 'red', desc: 'Max Royale Pass Multi-Season' },
  { name: 'Overachiever', type: 'Honor Milestone', tier: 'red', desc: '2800+ Achievement Points' },
  { name: 'Well-Liked', type: 'Popularity Honor', tier: 'purple', desc: '10,000+ Likes & Synergies' },
  { name: 'Weapon Master', type: 'Armory Elite', tier: 'purple', desc: 'Multi-Class Eliminations Mastery' },
  { name: '1235 Box Collect', type: 'Collector Honor', tier: 'purple', desc: 'Collector Showcase Milestone' },
  { name: 'Veteran', type: 'Battleground Legacy', tier: 'purple', desc: '8 Years Active Battleground Veteran' },
  { name: '#1/100', type: 'Lone Survivor', tier: 'purple', desc: 'Solo vs Squad Solo Chicken Dinner' },
];

export function PubgCareerStats() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('current');
  const [chartType, setChartType] = useState<'radar' | 'curve'>('radar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('5112658248');
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const activeSeason = SEASONS.find((s) => s.id === selectedSeasonId) ?? SEASONS[0];

  // Dynamic Pentagon Polygon Points Calculation from Active Season (Wide ViewBox to avoid mobile clipping)
  const cx = 140;
  const cy = 115;
  const r0 = (activeSeason.radar.winRatio / 100) * 70;
  const r1 = (activeSeason.radar.feedback / 100) * 70;
  const r2 = (activeSeason.radar.support / 100) * 70;
  const r3 = (activeSeason.radar.survived / 100) * 70;
  const r4 = (activeSeason.radar.combat / 100) * 70;

  const pt0 = `${cx},${(cy - r0).toFixed(2)}`;
  const pt1 = `${(cx + r1 * 0.951).toFixed(2)},${(cy - r1 * 0.309).toFixed(2)}`;
  const pt2 = `${(cx + r2 * 0.588).toFixed(2)},${(cy + r2 * 0.809).toFixed(2)}`;
  const pt3 = `${(cx - r3 * 0.588).toFixed(2)},${(cy + r3 * 0.809).toFixed(2)}`;
  const pt4 = `${(cx - r4 * 0.951).toFixed(2)},${(cy - r4 * 0.309).toFixed(2)}`;
  const polygonPoints = `${pt0} ${pt1} ${pt2} ${pt3} ${pt4}`;

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
        description="Verified in-game performance metrics — Ranked TPP Squad multi-season telemetry updated directly from player profile."
      />

      {/* ────────────────── OFFICIAL BGMI IN-GAME STATS DASHBOARD ────────────────── */}
      <Reveal>
        <div className="relative mb-12 rounded-2xl border border-line bg-[#101422] shadow-2xl winter-icicle-container">
          {/* Header Bar with Interactive Season Selector & Tactical Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-line/80 bg-[#161c30]/95 px-3.5 sm:px-6 py-3 rounded-t-2xl">
            {/* Left Group: DATA · STATISTICS & Season Selector (Authentic In-Game Layout) */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3.5 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-white whitespace-nowrap">
                  DATA <span className="text-white/60">·</span> STATISTICS
                </span>
              </div>

              {/* Season Selection Dropdown - Aligned with left-0 so it NEVER clips */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#212946] hover:bg-[#2b3558] px-2.5 py-1.5 sm:px-3 text-white font-bold border border-line shadow transition cursor-pointer"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="text-amber-300 font-bold text-xs truncate max-w-[120px] sm:max-w-none">{activeSeason.name}</span>
                  <ChevronDown className={`size-3.5 text-white shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Backdrop to close on click outside on mobile/desktop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-1.5 w-56 sm:w-60 rounded-xl border border-line/80 bg-[#13172b]/98 p-1.5 shadow-2xl z-50 backdrop-blur-xl"
                      >
                        <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-200 border-b border-line/50 mb-1 flex items-center justify-between">
                          <span>Select Season</span>
                          <span className="text-[9px] text-amber-400 font-normal">6 Records</span>
                        </div>
                        {SEASONS.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedSeasonId(s.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-mono transition cursor-pointer ${
                              selectedSeasonId === s.id
                                ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                                : 'text-slate-100 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="truncate font-bold">{s.name}</span>
                              <span className="text-[10px] text-slate-200 truncate">{s.tierBadge}</span>
                            </div>
                            {selectedSeasonId === s.id && <Check className="size-3.5 text-amber-300 shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile UID Display */}
              <span className="sm:hidden rounded bg-red-600/20 px-2 py-0.5 text-[9px] font-mono font-bold text-red-400 border border-red-500/30 shrink-0">
                UID: 5112658248
              </span>
            </div>

            {/* Right Group: Tactical Filters & Desktop UID */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 font-mono text-[10px] sm:text-[11px] relative justify-between sm:justify-end">
              <span className="flex items-center gap-1 rounded bg-[#212946]/80 px-2.5 py-1.5 text-slate-200 border border-line/60 shrink-0">
                RANKED
              </span>
              <span className="flex items-center gap-1 rounded bg-[#212946]/80 px-2.5 py-1.5 text-slate-200 border border-line/60 shrink-0">
                TPP Squad
              </span>
              <span className="hidden sm:inline-flex rounded bg-red-600/20 px-2.5 py-1 text-[10px] font-mono font-bold text-red-400 border border-red-500/30 shrink-0">
                UID: 5112658248
              </span>
            </div>
          </div>

          {/* Main Telemetry Container (Split: Radar / Curve on Left, Full Table on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-line/60">
            {/* Left Column: SSS / Dominator Grade & Chart (Radar vs Curve) */}
            <div className="lg:col-span-4 p-4 sm:p-6 flex flex-col items-center justify-between bg-[#121629]/60 min-w-0">
              {/* Dynamic Tier Badge */}
              <div className="text-center w-full px-2">
                <div className="inline-flex flex-col items-center max-w-full">
                  <h3 className="font-display font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl tracking-tight text-transparent bg-clip-text bg-[linear-gradient(180deg,#fff8db_0%,#fbbf24_45%,#d97706_85%,#92400e_100%)] drop-shadow-[0_4px_16px_rgba(251,191,36,0.4)] text-center max-w-full break-words leading-tight">
                    {activeSeason.tierBadge}
                  </h3>
                  <div className="text-xs font-mono text-slate-100 font-bold tracking-wider mt-1 flex items-center justify-center gap-1.5">
                    <span>Rating:</span>
                    <span className="text-amber-300 font-black text-sm sm:text-base">{activeSeason.tierScore}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-mono text-slate-100 font-medium mt-0.5 text-center px-1">
                    {activeSeason.tierLabel}
                  </p>
                </div>
              </div>

              {/* Interactive Graphic: Pentagon Radar Chart OR Ace Dominator Progression Curve */}
              <div className="relative my-3 w-full max-w-[280px] aspect-[280/220] flex items-center justify-center">
                {chartType === 'radar' ? (
                  <svg viewBox="0 0 280 220" className="size-full overflow-visible" role="img" aria-label="BGMI 5-Axis Combat Telemetry Radar">
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
                          ${140},${115 - 70 * scale}
                          ${140 + 70 * scale * 0.951},${115 - 70 * scale * 0.309}
                          ${140 + 70 * scale * 0.588},${115 + 70 * scale * 0.809}
                          ${140 - 70 * scale * 0.588},${115 + 70 * scale * 0.809}
                          ${140 - 70 * scale * 0.951},${115 - 70 * scale * 0.309}
                        `}
                        fill="none"
                        stroke="#283556"
                        strokeWidth={idx === 4 ? '1.5' : '1'}
                        strokeDasharray={idx < 4 ? '2 2' : undefined}
                      />
                    ))}

                    {/* Center Spoke Lines */}
                    {[
                      [140, 115 - 70],
                      [140 + 70 * 0.951, 115 - 70 * 0.309],
                      [140 + 70 * 0.588, 115 + 70 * 0.809],
                      [140 - 70 * 0.588, 115 + 70 * 0.809],
                      [140 - 70 * 0.951, 115 - 70 * 0.309],
                    ].map(([x, y], i) => (
                      <line key={i} x1="140" y1="115" x2={x} y2={y} stroke="#283556" strokeWidth="1" />
                    ))}

                    {/* Dynamic Radar Polygon based on Selected Season */}
                    <polygon
                      points={polygonPoints}
                      fill="url(#radar-fill)"
                      stroke="#7096e8"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_12px_rgba(79,117,217,0.6)] transition-all duration-500 ease-out"
                    />

                    {/* Vertex Points */}
                    {[
                      [cx, cy - r0],
                      [cx + r1 * 0.951, cy - r1 * 0.309],
                      [cx + r2 * 0.588, cy + r2 * 0.809],
                      [cx - r3 * 0.588, cy + r3 * 0.809],
                      [cx - r4 * 0.951, cy - r4 * 0.309],
                    ].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
                    ))}

                    {/* Data Labels Matching In-Game UI */}
                    <text x="140" y="24" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      Win Ratio
                    </text>
                    <text x="140" y="36" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {activeSeason.radar.winRatio.toFixed(1)}
                    </text>

                    <text x="216" y="90" textAnchor="start" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      Feedback
                    </text>
                    <text x="216" y="102" textAnchor="start" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {activeSeason.radar.feedback.toFixed(1)}
                    </text>

                    <text x="195" y="196" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      Support
                    </text>
                    <text x="195" y="208" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {activeSeason.radar.support.toFixed(1)}
                    </text>

                    <text x="85" y="196" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      Survived
                    </text>
                    <text x="85" y="208" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {activeSeason.radar.survived.toFixed(1)}
                    </text>

                    <text x="64" y="90" textAnchor="end" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      Combat
                    </text>
                    <text x="64" y="102" textAnchor="end" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {activeSeason.radar.combat.toFixed(1)}
                    </text>
                  </svg>
                ) : (
                  /* Authentic Ace Dominator Tier Progression Curve Graph (media_1791724419376_e62a34eb.jpg) */
                  <div className="size-full flex flex-col justify-between p-2 rounded-xl bg-[#0d1020]/90 border border-blue-500/20 shadow-inner">
                    <svg viewBox="0 0 240 180" className="size-full" role="img" aria-label="Ace Dominator Score Progression Curve">
                      <defs>
                        <linearGradient id="curve-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Tier Milestone Horizontal Guides */}
                      <line x1="20" y1="35" x2="225" y2="35" stroke="#475569" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x="22" y="30" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        Ace Dominator 6700
                      </text>

                      <line x1="20" y1="85" x2="225" y2="85" stroke="#475569" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x="22" y="80" fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        Ace Dominator 6500
                      </text>

                      <line x1="20" y1="140" x2="225" y2="140" stroke="#475569" strokeWidth="0.8" strokeDasharray="3 3" />
                      <text x="22" y="135" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        Ace Dominator 6300
                      </text>

                      {/* Progression Curve Area Fill */}
                      <path
                        d="M 25 125 C 60 120, 80 110, 105 102 C 130 96, 150 95, 175 75 C 195 68, 210 67, 225 66 L 225 155 L 25 155 Z"
                        fill="url(#curve-gradient)"
                      />

                      {/* Main Blue Progression Line */}
                      <path
                        d="M 25 125 C 60 120, 80 110, 105 102 C 130 96, 150 95, 175 75 C 195 68, 210 67, 225 66"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                      />

                      {/* Milestone Checkpoint Nodes */}
                      {[
                        [25, 125],
                        [50, 122],
                        [75, 115],
                        [100, 104],
                        [125, 98],
                        [150, 96],
                        [175, 75],
                        [195, 68],
                        [210, 67],
                        [225, 66],
                      ].map(([x, y], idx) => (
                        <circle key={idx} cx={x} cy={y} r="2.5" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
                      ))}

                      {/* Timeline Labels */}
                      <text x="25" y="165" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        10/09
                      </text>
                      <text x="205" y="165" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        10/11
                      </text>
                    </svg>
                    <div className="text-center font-mono text-[10px] text-sky-300 font-bold">
                      Ace Dominator 6580+ PTS · Current Rank Push
                    </div>
                  </div>
                )}
              </div>

              {/* Chart Switcher Buttons (Functional Toggle) */}
              <div className="flex items-center gap-1 bg-[#1e253d] p-1 rounded-xl border border-line">
                <button
                  type="button"
                  onClick={() => setChartType('radar')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    chartType === 'radar'
                      ? 'bg-[#3b4872] text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>⬟</span> Radar
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('curve')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    chartType === 'curve'
                      ? 'bg-[#3b4872] text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>📈</span> Curve
                </button>
              </div>
            </div>

            {/* Right Column: 5 Top Overview Columns + 4 Performance Matrix Rows (Always White & Vivid on PC) */}
            <div className="lg:col-span-8 flex flex-col justify-between min-w-0">
              {/* Top Overview Black Strip (5 Columns) */}
              <div className="grid grid-cols-5 divide-x divide-line/60 bg-[#0d101c] py-3.5 sm:py-4 px-1 sm:px-4 text-center border-b border-line/60">
                <div className="px-0.5 sm:px-2 min-w-0">
                  <p className="font-mono text-[8px] xs:text-[9px] sm:text-[11px] text-slate-100 uppercase tracking-wider font-bold truncate">
                    <span className="sm:hidden">Matches</span>
                    <span className="hidden sm:inline">Matches Played</span>
                  </p>
                  <p className="font-mono text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-white mt-0.5 truncate">
                    {activeSeason.overview.matches}
                  </p>
                </div>
                <div className="px-0.5 sm:px-2 min-w-0">
                  <p className="font-mono text-[8px] xs:text-[9px] sm:text-[11px] text-slate-100 uppercase tracking-wider font-bold truncate">Wins</p>
                  <p className="font-mono text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-emerald-400 mt-0.5 truncate">
                    {activeSeason.overview.wins}
                  </p>
                </div>
                <div className="px-0.5 sm:px-2 min-w-0">
                  <p className="font-mono text-[8px] xs:text-[9px] sm:text-[11px] text-slate-100 uppercase tracking-wider font-bold truncate">Top 10</p>
                  <p className="font-mono text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-cyan-400 mt-0.5 truncate">
                    {activeSeason.overview.top10}
                  </p>
                </div>
                <div className="px-0.5 sm:px-2 min-w-0">
                  <p className="font-mono text-[8px] xs:text-[9px] sm:text-[11px] text-slate-100 uppercase tracking-wider font-bold truncate">
                    <span className="sm:hidden">Kills</span>
                    <span className="hidden sm:inline">Eliminations</span>
                  </p>
                  <p className="font-mono text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-rose-400 mt-0.5 truncate">
                    {activeSeason.overview.eliminations}
                  </p>
                </div>
                <div className="px-0.5 sm:px-2 min-w-0">
                  <p className="font-mono text-[8px] xs:text-[9px] sm:text-[11px] text-slate-100 uppercase tracking-wider font-bold truncate">
                    <span className="sm:hidden">F/D</span>
                    <span className="hidden sm:inline">F/D Ratio</span>
                  </p>
                  <p className="font-mono text-xs xs:text-sm sm:text-2xl md:text-3xl font-black text-amber-300 mt-0.5 truncate">
                    {activeSeason.overview.fdRatio.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* 4 Performance Rows Matching In-Game UI (Explicit Crisp Colors on PC and Mobile) */}
              <div className="divide-y divide-line/40 font-mono">
                {/* Row 1: Chicken Dinner / Win Stats */}
                <div className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-8 sm:size-11 shrink-0 rounded-xl bg-amber-400/10 border border-amber-400/20 grid place-items-center text-amber-300">
                    <Trophy className="size-4 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 flex-1 text-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Win Ratio</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-emerald-400 mt-0.5 truncate">{activeSeason.details.winRatioPct}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Top 10 Rate</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-cyan-400 mt-0.5 truncate">{activeSeason.details.top10RatePct}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Accuracy</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-amber-300 mt-0.5 truncate">{activeSeason.details.accuracyPct}</p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Reticle / Precision Stats */}
                <div className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-8 sm:size-11 shrink-0 rounded-xl bg-rose-400/10 border border-rose-400/20 grid place-items-center text-rose-300">
                    <Crosshair className="size-4 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 flex-1 text-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Headshot Rate</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-rose-400 mt-0.5 truncate">{activeSeason.details.headshotRatePct}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Headshots</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-pink-300 mt-0.5 truncate">{activeSeason.details.headshots}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">AVG Damage</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-amber-300 mt-0.5 truncate">{activeSeason.details.avgDamage}</p>
                    </div>
                  </div>
                </div>

                {/* Row 3: Ammo / Damage Stats */}
                <div className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-8 sm:size-11 shrink-0 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 grid place-items-center text-fuchsia-300">
                    <Zap className="size-4 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 flex-1 text-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Total Damage</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-fuchsia-300 mt-0.5 truncate">{activeSeason.details.totalDamage}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Most Kills</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-rose-400 mt-0.5 truncate">{activeSeason.details.mostEliminations}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Highest Dmg</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-amber-300 mt-0.5 truncate">{activeSeason.details.highestDamage}</p>
                    </div>
                  </div>
                </div>

                {/* Row 4: Teamplay / Movement Stats */}
                <div className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-5 hover:bg-white/[0.02] transition">
                  <div className="size-8 sm:size-11 shrink-0 rounded-xl bg-cyan-400/10 border border-cyan-400/20 grid place-items-center text-cyan-300">
                    <Shield className="size-4 sm:size-6" />
                  </div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 flex-1 text-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Total Assists</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-cyan-400 mt-0.5 truncate">{activeSeason.details.totalAssists}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Avg Assists</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-sky-300 mt-0.5 truncate">{activeSeason.details.avgAssists}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-xs text-slate-100 uppercase font-bold truncate">Distance</p>
                      <p className="text-[11px] xs:text-xs sm:text-lg font-black text-teal-300 mt-0.5 truncate">{activeSeason.details.longestTraveled}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom In-Game Actions */}
              <div className="flex items-center justify-between border-t border-line/60 bg-[#0e1220] px-4 py-3 sm:px-6 font-mono text-xs">
                <div className="flex items-center gap-4 text-slate-100 font-medium">
                  <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition">
                    <Shield className="size-3.5 text-rose-400" /> Report
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition">
                    <Activity className="size-3.5 text-cyan-400" /> Compare
                  </span>
                </div>
                <span className="text-[11px] text-slate-100 font-bold hidden sm:inline">
                  Asia Server · Squad TPP · {activeSeason.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ────────────────── OFFICIAL BASIC INFO & PROFILE SHOWCASE BAR ────────────────── */}
      <Reveal delay={0.1}>
        <div className="relative mb-12 rounded-2xl border border-line bg-[#11162a]/95 p-4 sm:p-7 shadow-xl backdrop-blur-md winter-icicle-container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            {/* Player Identity Block */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              {/* Profile Avatar with Lv.91 Badge */}
              <div className="relative size-14 sm:size-20 shrink-0 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-400/20 to-pink-500/20 p-0.5 sm:p-1 shadow-lg shadow-amber-500/20">
                <img
                  src="/images/creator/khushi-avatar-gamer.webp"
                  alt="FRAGxKhusiYT Avatar"
                  className="size-full object-cover rounded-xl"
                  loading="lazy"
                />
                <span className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 rounded-md bg-amber-400 px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-black text-slate-950 shadow">
                  Lv.91
                </span>
              </div>

              {/* Player Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-gaming text-lg xs:text-xl sm:text-2xl font-bold text-white tracking-wide truncate">
                    ♀ FRAGxKhusiYT
                  </h3>
                  <span className="rounded bg-red-600/20 border border-red-500/40 px-2 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold text-red-300 shrink-0">
                    FRAGOFFICIALS Leader
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-100 mt-1.5 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-[#1a213a] px-2 py-0.5 rounded border border-line/60">
                    <span className="text-slate-200 text-[11px] font-semibold">UID:</span>
                    <strong className="text-amber-300 text-[11px] sm:text-xs">5112658248</strong>
                    <button
                      type="button"
                      onClick={handleCopyUid}
                      title="Copy UID"
                      className="ml-1 text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-0.5"
                    >
                      {copiedUid ? (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Copied</span>
                      ) : (
                        <Copy className="size-3 text-slate-300 hover:text-amber-300" />
                      )}
                    </button>
                  </div>
                  <span className="text-slate-200 text-[11px]">Region: <strong className="text-white">India 🇮🇳</strong></span>
                </div>

                <div className="flex items-center gap-2 mt-2 font-mono text-[10px] sm:text-[11px] max-w-full">
                  <span className="text-pink-300 bg-pink-500/10 border border-pink-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 font-bold truncate max-w-full">
                    <Heart className="size-3 fill-pink-400 text-pink-400 shrink-0" />
                    <span className="truncate">Partner: TOM and FRAGxKhusi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Profile Milestones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center font-mono w-full lg:w-auto">
              <div className="rounded-xl border border-line bg-card/60 p-2.5 sm:p-3 min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-200 font-bold block truncate">Master Collector</span>
                <span className="text-xs sm:text-base font-black text-amber-300 mt-0.5 block truncate">Level 100</span>
              </div>
              <div className="rounded-xl border border-line bg-card/60 p-2.5 sm:p-3 min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-200 font-bold block truncate">Lifetime Matches</span>
                <span className="text-xs sm:text-base font-black text-white mt-0.5 block truncate">21,728</span>
              </div>
              <div className="rounded-xl border border-line bg-card/60 p-2.5 sm:p-3 min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-200 font-bold block truncate">Achievement Points</span>
                <span className="text-xs sm:text-base font-black text-cyan-300 mt-0.5 block truncate">⭐ 8,820</span>
              </div>
              <div className="rounded-xl border border-line bg-card/60 p-2.5 sm:p-3 min-w-0">
                <span className="text-[9px] sm:text-[10px] uppercase text-slate-200 font-bold block truncate">Played For</span>
                <span className="text-xs sm:text-base font-black text-emerald-300 mt-0.5 block truncate">8 Years</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ────────────────── OFFICIAL HONOR & 79 TITLES SHOWCASE (media_1791724431585_fb07fbcb.jpg) ────────────────── */}
      <Reveal delay={0.15}>
        <div className="relative mb-12 rounded-2xl border border-line bg-[#101424] p-4 sm:p-8 shadow-2xl winter-icicle-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-line/60">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Award className="size-4" /> HONOR · ACHIEVEMENTS
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                Official In-Game Titles Showcase
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-400/15 border border-amber-400/30 px-3.5 py-1.5 font-mono text-xs text-amber-300 flex items-center gap-2">
                <Crown className="size-4 text-amber-400" />
                <span>Total Titles: <strong className="text-white text-sm">79</strong></span>
              </div>
            </div>
          </div>

          {/* 10 Verified Titles Grid matching In-game Screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5 font-mono">
            {VERIFIED_TITLES.map((t) => {
              const isRed = t.tier === 'red';
              return (
                <div
                  key={t.name}
                  className={`group relative overflow-hidden rounded-xl border p-2.5 sm:p-3 transition flex flex-col justify-between ${
                    isRed
                      ? 'border-red-500/30 bg-gradient-to-b from-red-950/30 to-[#12162a] hover:border-red-500/60'
                      : 'border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-[#12162a] hover:border-purple-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`size-6 rounded-lg grid place-items-center text-xs font-bold ${
                        isRed ? 'bg-red-600/30 text-red-300' : 'bg-purple-600/30 text-purple-300'
                      }`}
                    >
                      {isRed ? '👑' : '⭐'}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isRed ? 'bg-red-500/20 text-red-300' : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {isRed ? 'Mythic' : 'Epic'}
                    </span>
                  </div>
                  <h4 className="font-gaming text-sm font-bold text-white tracking-wide truncate group-hover:text-amber-300 transition">
                    {t.name}
                  </h4>
                  <p className="text-[10px] text-slate-100 mt-1 line-clamp-2 leading-tight">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* ────────────────── SIGNATURE COMBAT LOADOUT & SENSITIVITY ────────────────── */}
      <Reveal delay={0.2}>
        <div className="panel p-6 border-line bg-card/60 winter-icicle-container">
          <div className="flex items-center gap-2 mb-4 font-display text-sm font-bold uppercase tracking-widest text-amber-400">
            <Target className="size-4" />
            Signature Combat Loadout & Gun Lab Showcase
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-fuchsia-300 uppercase tracking-widest block font-bold">PRIMARY AR</span>
              <p className="font-display font-bold text-base text-white mt-0.5">M416 Glacier (Max Level)</p>
              <p className="text-xs text-slate-100 mt-1 font-mono font-medium">5.56mm · 6x to 3x Pull · Compensator · Ext. Quickdraw Mag</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-amber-300 uppercase tracking-widest block font-bold">SECONDARY SNIPER</span>
              <p className="font-display font-bold text-base text-white mt-0.5">AWM Monster One-Shot</p>
              <p className="text-xs text-slate-100 mt-1 font-mono font-medium">.300 Magnum · 8x Scope · Cheek Pad · Suppressor</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-surface/60 p-4">
              <span className="font-mono text-[10px] text-cyan-300 uppercase tracking-widest block font-bold">CLOSE COMBAT / CQB</span>
              <p className="font-display font-bold text-base text-white mt-0.5">UMP45 / DBS Rush</p>
              <p className="text-xs text-slate-100 mt-1 font-mono font-medium">Laser Sight · Red Dot · Extreme Hipfire Accuracy</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
