import React, { useState } from 'react';
import { Sparkles, Shield, Flame, Trophy, Zap, CheckCircle2, Layers } from 'lucide-react';
import { useWinterMode } from '../../context/WinterModeContext';

interface XSuitStarLevel {
  star: number;
  title: string;
  perkType: string;
  stones: number;
  fragments: number;
  cumStones: number;
  cumFragments: number;
  description: string;
  badgeColor: string;
}

const XSUIT_UPGRADE_LEVELS: XSuitStarLevel[] = [
  {
    star: 1,
    title: 'Basic Appearance',
    perkType: 'Base Unlock',
    stones: 1,
    fragments: 100,
    cumStones: 1,
    cumFragments: 100,
    description: 'Unlocks the base Mythic X-Suit armor, custom lobby stance, and Pharaoh-Poseidon hybrid crest.',
    badgeColor: '#94a3b8',
  },
  {
    star: 2,
    title: 'Teammate Interaction',
    perkType: 'Lobby Synergy',
    stones: 5,
    fragments: 200,
    cumStones: 6,
    cumFragments: 300,
    description: 'Unlocks exclusive squad lobby interaction emote and golden-hydro energy resonance with teammates.',
    badgeColor: '#38bdf8',
  },
  {
    star: 3,
    title: 'Advanced Form',
    perkType: 'Armor Evolution',
    stones: 10,
    fragments: 300,
    cumStones: 16,
    cumFragments: 600,
    description: 'Upgrades shoulder pauldrons to Golden Viper crests with glowing sapphire energy conduits.',
    badgeColor: '#60a5fa',
  },
  {
    star: 4,
    title: 'Victory Broadcast',
    perkType: 'Elimination Banner',
    stones: 15,
    fragments: 350,
    cumStones: 31,
    cumFragments: 950,
    description: 'Broadcasts a custom Golden Lightning Elimination Banner in the killfeed on every knock & finish.',
    badgeColor: '#a855f7',
  },
  {
    star: 5,
    title: 'Shock & Awe',
    perkType: 'Spawn Island Entry',
    stones: 20,
    fragments: 380,
    cumStones: 51,
    cumFragments: 1330,
    description: 'Triggers a grand lightning-storm arrival announcement and custom skydiving plasma trail.',
    badgeColor: '#ec4899',
  },
  {
    star: 6,
    title: 'Final Form + Emote',
    perkType: 'Mythic Transformation',
    stones: 27,
    fragments: 385,
    cumStones: 78,
    cumFragments: 1715,
    description: 'Unlocks full bioluminescent hydro-dreadlocks, wing capes, and lightning gauntlets.',
    badgeColor: '#f59e0b',
  },
  {
    star: 7,
    title: '7-Star Max Awakening',
    perkType: 'Apex Mythic Status',
    stones: 32,
    fragments: 385,
    cumStones: 110,
    cumFragments: 2100,
    description: 'Maximum BGMI X-Lab Awakening: Exclusive Loot Crate, Kill Message, and Sovereign Hydro-Pharaoh Aura.',
    badgeColor: '#fbbf24',
  },
];

export const MythicCharacterShowcase: React.FC = () => {
  const { isWinterMode } = useWinterMode();
  const [selectedStar, setSelectedStar] = useState<number>(7);
  const [auraPreset, setAuraPreset] = useState<'gold' | 'cyan' | 'crimson' | 'purple'>('gold');

  const activeLevel = XSUIT_UPGRADE_LEVELS.find((l) => l.star === selectedStar) || XSUIT_UPGRADE_LEVELS[6];

  const auraColors = {
    gold: {
      primary: '#f59e0b',
      secondary: '#38bdf8',
      label: 'Pharaoh Gold',
      ringGlow: 'rgba(245, 158, 11, 0.45)',
    },
    cyan: {
      primary: '#00f2fe',
      secondary: '#3b82f6',
      label: 'Lightning Cyan',
      ringGlow: 'rgba(0, 242, 254, 0.45)',
    },
    crimson: {
      primary: '#f43f5e',
      secondary: '#f59e0b',
      label: 'Conqueror Ember',
      ringGlow: 'rgba(244, 63, 94, 0.45)',
    },
    purple: {
      primary: '#a855f7',
      secondary: '#38bdf8',
      label: 'Mythic Astral',
      ringGlow: 'rgba(168, 85, 247, 0.45)',
    },
  }[auraPreset];

  const starIntensity = 0.5 + (selectedStar / 7) * 0.5;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-colors duration-300 ${
        isWinterMode
          ? 'bg-[#050d1a]/95 border-sky-400/30 shadow-[0_16px_45px_rgba(2,132,199,0.2)]'
          : 'bg-[#070911]/95 border-amber-500/25 shadow-[0_16px_50px_rgba(0,0,0,0.75)]'
      }`}
    >
      {/* Top Hairline Accent */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${auraColors.primary}, ${auraColors.secondary}, transparent)`,
        }}
      />

      {/* Compact Showcase Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.14em] border whitespace-nowrap"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.14)',
              borderColor: 'rgba(245, 158, 11, 0.45)',
              color: '#fbbf24',
            }}
          >
            <Sparkles className="w-3 h-3 shrink-0" /> BGMI X-LAB // 7★ SHOWCASE
          </span>
          <span className="hidden md:inline-block text-xs font-bold text-slate-300 tracking-wide">
            Sovereign Hydro-Pharaoh X-Suit
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-300 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> 7★ MAXED
        </span>
      </div>

      {/* Main Split Grid: Character Stage (Left) + BGMI X-Lab Upgrade Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Static HD Character Showcase Stage */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-between p-3.5 sm:p-5 bg-black border-b lg:border-b-0 lg:border-r border-white/10">
          {/* Top Stage HUD Header */}
          <div className="relative z-20 w-full flex items-center justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-amber-400/90 truncate">
                AVATAR LOADOUT // 7★ MAX
              </div>
              <div className="text-xs sm:text-base font-black text-white tracking-tight truncate">
                Pharaoh × Poseidon Apex
              </div>
            </div>

            {/* Star Rating Pill */}
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
              {Array.from({ length: 7 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] sm:text-xs leading-none transition-all duration-200 ${
                    idx < selectedStar
                      ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.95)]'
                      : 'text-slate-700'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* PURE BLACK (#000000) SHOWCASE STAGE */}
          <div className="relative w-full max-w-[230px] sm:max-w-[260px] lg:max-w-[280px] aspect-[560/884] my-1 flex items-center justify-center select-none bg-black mx-auto">
            {/* Corner Tactical HUD Brackets */}
            <div className="pointer-events-none absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/45 z-20" />
            <div className="pointer-events-none absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-sky-400/45 z-20" />
            <div className="pointer-events-none absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-sky-400/45 z-20" />
            <div className="pointer-events-none absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/45 z-20" />

            {/* CHARACTER IMAGE — Full Uncropped View from Crown to Boots */}
            <img
              src="/images/creator/mythic-character-front-v2.jpg"
              alt="KhushiYT BGMI 7-Star Mythic X-Suit Showcase"
              width={560}
              height={884}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="relative z-10 w-full h-full object-contain pointer-events-none select-none"
            />

            {/* TRUE 3D ELLIPSE FLOOR AURA — Positioned at the bottom floor margin so it never cuts across the boots */}
            <div
              className="pointer-events-none absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[76%] h-[24px] z-20 mix-blend-screen"
              style={{
                opacity: starIntensity,
              }}
            >
              {/* Soft Floor Glow */}
              <div
                className="absolute -inset-x-2 -inset-y-2 rounded-[50%] blur-md"
                style={{
                  background: `radial-gradient(ellipse at center, ${auraColors.ringGlow} 0%, rgba(56,189,248,0.22) 55%, transparent 80%)`,
                }}
              />
              {/* True Oval Outer Ring (rounded-[50%] instead of stadium pill) */}
              <div
                className="absolute inset-0 rounded-[50%] border"
                style={{
                  borderColor: auraColors.primary,
                  boxShadow: `0 0 12px ${auraColors.ringGlow}`,
                }}
              />
              {/* True Oval Inner Dashed Ring */}
              <div
                className="absolute inset-x-5 inset-y-1.5 rounded-[50%] border border-dashed"
                style={{
                  borderColor: auraColors.secondary,
                }}
              />
            </div>
          </div>

          {/* BELOW-STAGE STATUS & AURA BAR */}
          <div className="relative z-20 w-full mt-2 pt-2.5 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-amber-400/30 text-[10px] font-black uppercase tracking-wider text-amber-300 truncate">
                {activeLevel.star}★ {activeLevel.title}
              </span>
              <span className="px-2 py-1 rounded-md bg-white/[0.04] border border-sky-400/30 text-[10px] font-black uppercase tracking-wider text-sky-300 shrink-0 whitespace-nowrap">
                X-SUIT // MAXED
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                Aura: <strong className="text-white">{auraColors.label}</strong>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {(['gold', 'cyan', 'crimson', 'purple'] as const).map((preset) => {
                  const dotColor =
                    preset === 'gold'
                      ? '#f59e0b'
                      : preset === 'cyan'
                      ? '#00f2fe'
                      : preset === 'crimson'
                      ? '#f43f5e'
                      : '#a855f7';
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAuraPreset(preset)}
                      title={`Switch to ${preset} aura`}
                      className={`w-4 h-4 rounded-full border transition-transform ${
                        auraPreset === preset
                          ? 'scale-125 border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                          : 'border-white/30 opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: dotColor }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentic BGMI X-Laboratory Upgrade & Fragment Breakdown */}
        <div className="lg:col-span-7 p-3.5 sm:p-6 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-950/90 via-[#090d18]/95 to-slate-950/90">
          {/* Top Summary Header + Total Materials Required */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">
                  <Layers className="w-3.5 h-3.5 shrink-0" /> BGMI X-LABORATORY // UPGRADE DATA
                </div>
                <h4 className="text-sm sm:text-lg font-black text-white tracking-tight mt-0.5">
                  Max 7-Star X-Suit Material & Fragment Cost
                </h4>
              </div>

              <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-400/30 text-[10px] font-black text-amber-300 uppercase tracking-wider whitespace-nowrap">
                X-Lab Tier: Mythic VII
              </span>
            </div>

            {/* 3 Highlight Material Stat Cards — Clean Non-Truncating Labels on Mobile & Desktop */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-300">
                  <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span className="sm:hidden">STONES</span>
                  <span className="hidden sm:inline">STARFORGE STONES</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-base sm:text-xl font-black text-white leading-none">110</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-300/80 whitespace-nowrap">
                    7★ Max
                  </span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-sky-500/10 border border-sky-500/25">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sky-300">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" />
                  <span className="sm:hidden">FRAGMENTS</span>
                  <span className="hidden sm:inline">STAR FRAGMENTS</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-base sm:text-xl font-black text-white leading-none">2,100</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-sky-300/80 whitespace-nowrap">
                    7★ Max
                  </span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-purple-500/10 border border-purple-500/25">
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-purple-300">
                  <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 shrink-0" />
                  <span className="sm:hidden">TIER COST</span>
                  <span className="hidden sm:inline">SELECTED TIER</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-1">
                  <span className="text-base sm:text-xl font-black text-white leading-none">
                    {activeLevel.star}★
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-purple-300/80 whitespace-nowrap">
                    {activeLevel.cumFragments}F
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 1★ to 7★ Level Selector Tabs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-400">
              <span className="truncate">Tap Star Level to Inspect Upgrade Cost:</span>
              <span className="text-amber-400 font-black whitespace-nowrap shrink-0">
                {activeLevel.star}★ Selected
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {XSUIT_UPGRADE_LEVELS.map((lvl) => {
                const isSelected = lvl.star === selectedStar;
                return (
                  <button
                    key={lvl.star}
                    type="button"
                    onClick={() => setSelectedStar(lvl.star)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/30 to-amber-600/10 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] -translate-y-0.5'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.07] hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-black tracking-tight flex items-center justify-center gap-0.5">
                      <span>{lvl.star}</span>
                      <span className={isSelected ? 'text-amber-400' : 'text-amber-500/60'}>★</span>
                    </div>
                    <div className="text-[9px] font-semibold opacity-75 hidden sm:block truncate mt-0.5">
                      {lvl.fragments}F
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Star Level Detail Card — Clean Single-Line Badges on Mobile */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-black/55 border border-white/10 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-slate-950 whitespace-nowrap shrink-0"
                    style={{ backgroundColor: activeLevel.badgeColor }}
                  >
                    LVL {activeLevel.star}★
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white truncate">
                    {activeLevel.title}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[10px] font-bold text-slate-300 whitespace-nowrap shrink-0">
                  {activeLevel.perkType}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 whitespace-nowrap">
                  +{activeLevel.stones} Starforge Stones
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 whitespace-nowrap">
                  +{activeLevel.fragments} Star Fragments
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{activeLevel.description}</p>

              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400">
                <span>
                  Total up to <strong className="text-white">{activeLevel.star}★</strong>:{' '}
                  <strong className="text-amber-300">{activeLevel.cumStones} Stones</strong> +{' '}
                  <strong className="text-sky-300">{activeLevel.cumFragments} Fragments</strong>
                </span>
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Unlocked in Inventory
                </span>
              </div>
            </div>
          </div>

          {/* Complete 1★–7★ Table — Zero Collisions, Full Titles, No Inner Touch Scrollbar */}
          <div className="rounded-xl border border-white/10 overflow-hidden bg-black/35">
            <div className="grid grid-cols-[42px_1fr_62px_76px] sm:grid-cols-[52px_1fr_95px_110px] gap-1.5 px-3 py-2 bg-white/[0.04] border-b border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
              <div>TIER</div>
              <div>X-LAB PERK</div>
              <div className="text-right">STONES</div>
              <div className="text-right">FRAGMENTS</div>
            </div>
            <div className="divide-y divide-white/5">
              {XSUIT_UPGRADE_LEVELS.map((row) => {
                const isCurr = row.star === selectedStar;
                return (
                  <button
                    key={row.star}
                    type="button"
                    onClick={() => setSelectedStar(row.star)}
                    className={`w-full grid grid-cols-[42px_1fr_62px_76px] sm:grid-cols-[52px_1fr_95px_110px] gap-1.5 items-center px-3 py-1.5 text-left text-[11px] sm:text-xs transition-colors ${
                      isCurr
                        ? 'bg-amber-500/15 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-black text-amber-400">{row.star}★</div>
                    <div className="truncate">{row.title}</div>
                    <div className="text-right font-mono text-amber-300 whitespace-nowrap">
                      +{row.stones}
                      <span className="hidden sm:inline text-[10px] text-slate-500 ml-1">
                        ({row.cumStones})
                      </span>
                    </div>
                    <div className="text-right font-mono text-sky-300 whitespace-nowrap">
                      +{row.fragments}
                      <span className="hidden sm:inline text-[10px] text-slate-500 ml-1">
                        ({row.cumFragments})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Armor Specs Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[10px] sm:text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                <strong className="text-slate-200">Armor:</strong> Golden Viper Pauldrons • Hydro Plasma
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-amber-400/90 font-bold whitespace-nowrap">
              POS-I // CONQUEROR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
