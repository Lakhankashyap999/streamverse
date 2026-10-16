import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Flame,
  Pause,
  Play,
  RotateCw,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';

interface XSuitLevel {
  star: number;
  title: string;
  tag: string;
  stones: number;
  fragments: number;
  perk: string;
  desc: string;
}

/**
 * Authentic BGMI / PUBG Mobile X-Laboratory Upgrade Progression Data
 * (Starforge Stones + Star Fragments per star tier from 1-Star to 7-Star Max)
 */
const XSUIT_LEVELS: XSuitLevel[] = [
  {
    star: 1,
    title: 'Basic Appearance',
    tag: 'Base Unlock',
    stones: 0,
    fragments: 0,
    perk: 'Pharaoh Storm Base Armor (300 Silver / Spin)',
    desc: 'Unlocks the base Mythic X-Suit combat armor in the X-Laboratory.',
  },
  {
    star: 2,
    title: 'Team-Up Interaction',
    tag: 'Lobby Synergy',
    stones: 5,
    fragments: 85,
    perk: 'Exclusive Squad Lobby Emote & Voice Lines',
    desc: 'Triggers special lightning salute when joining a squad in the lobby.',
  },
  {
    star: 3,
    title: 'Advanced Form',
    tag: 'Visual Evolution',
    stones: 9,
    fragments: 165,
    perk: 'Golden Winged Pauldrons & Glowing Cyber-Dreads',
    desc: 'Upgrades shoulder dragon-armor and activates glowing blue dreadlock conduits.',
  },
  {
    star: 4,
    title: 'Victory Broadcast',
    tag: 'Kill Feed HUD',
    stones: 14,
    fragments: 265,
    perk: 'Custom Golden Storm Elimination Broadcast',
    desc: 'Displays a mythic golden-blue lightning banner across the match kill feed.',
  },
  {
    star: 5,
    title: 'Shockwave Arrival',
    tag: 'Spawn Island',
    stones: 20,
    fragments: 380,
    perk: 'Spawn Island Thunder Entrance & Parachute Trail',
    desc: 'Casts a high-voltage storm aura on Spawn Island and blue lightning sky-drop trail.',
  },
  {
    star: 6,
    title: 'Final Form',
    tag: 'Mythic Mastery',
    stones: 27,
    fragments: 525,
    perk: 'Full Winged Pharaoh Armor + Reactive Arc Lightning',
    desc: 'Unlocks the complete armored wings, gauntlets, and reactive combat lightning.',
  },
  {
    star: 7,
    title: 'Astral Awakening',
    tag: 'MAX LEVEL 7★',
    stones: 35,
    fragments: 680,
    perk: 'Awakened God-King Aura + Loot Crate & Result Pose',
    desc: 'Maximum X-Laboratory evolution with custom MVP victory statue and mythic loot box.',
  },
];

const TOTAL_STONES = XSUIT_LEVELS.reduce((acc, l) => acc + l.stones, 0); // 110 Starforge Stones
const TOTAL_FRAGMENTS = XSUIT_LEVELS.reduce((acc, l) => acc + l.fragments, 0); // 2,100 Star Fragments

export function MythicCharacterShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const charWrapperRef = useRef<HTMLDivElement>(null);
  const frontImgRef = useRef<HTMLImageElement>(null);
  const backImgRef = useRef<HTMLImageElement>(null);
  const flashOverlayRef = useRef<HTMLDivElement>(null);
  const pedestalRingRef = useRef<HTMLDivElement>(null);
  const angleTextRef = useRef<HTMLSpanElement>(null);
  const sideLabelRef = useRef<HTMLSpanElement>(null);

  const [autoSpin, setAutoSpin] = useState(true);
  const [selectedStar, setSelectedStar] = useState<number>(7);
  const [isVisible, setIsVisible] = useState(false);

  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;

  const stateRef = useRef({
    angle: 0, // 0..360 continuous turntable angle
    tiltX: 0, // vertical 3D camera tilt (-10..+10 deg)
    targetAngle: null as number | null,
    isDragging: false,
    startX: 0,
    startY: 0,
    startAngle: 0,
    startTiltX: 0,
    velocity: 0,
  });

  // Pause animation when off-screen
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Smooth 120fps 3D Turntable Controller preserving 100% original HD image realism
  useEffect(() => {
    if (!isVisible) return;
    let rafId = 0;

    const tick = () => {
      const s = stateRef.current;

      if (!s.isDragging) {
        if (s.targetAngle !== null) {
          const diff = s.targetAngle - s.angle;
          if (Math.abs(diff) < 0.4) {
            s.angle = s.targetAngle;
            s.targetAngle = null;
          } else {
            s.angle += diff * 0.14;
          }
          s.tiltX *= 0.9;
        } else if (autoSpinRef.current) {
          const norm = ((s.angle % 360) + 360) % 360;
          // Smoothly glide across the 90° and 270° flip zones so the character never looks flat or squished
          const distToFlip = Math.min(Math.abs(norm - 90), Math.abs(norm - 270));
          const flipSpeedBoost = distToFlip < 32 ? 1 + ((32 - distToFlip) / 32) * 3.8 : 1;
          s.angle += 0.38 * flipSpeedBoost;
          s.tiltX *= 0.92;
        } else if (Math.abs(s.velocity) > 0.04) {
          s.angle += s.velocity;
          s.velocity *= 0.92;
          s.tiltX *= 0.92;
        } else {
          // If user releases drag right on the 90°/270° flip zone, settle gently toward Front or Back
          const norm = ((s.angle % 360) + 360) % 360;
          const dist90 = norm - 90;
          const dist270 = norm - 270;
          if (Math.abs(dist90) < 22) {
            s.angle += (dist90 >= 0 ? 1 : -1) * 0.9;
          } else if (Math.abs(dist270) < 22) {
            s.angle += (dist270 >= 0 ? 1 : -1) * 0.9;
          }
        }
      }

      const norm = ((s.angle % 360) + 360) % 360;
      const isBack = norm > 90 && norm < 270;
      const rad = (norm * Math.PI) / 180;

      // Subtle, natural 3D perspective rotation (max ±20° Y tilt + gentle scale so proportions stay 100% realistic!)
      const localTiltY = Math.sin(rad) * 20;
      const cosMag = Math.abs(Math.cos(rad));
      // Never squish horizontally below 0.90 so the armor & body always look solid and realistic
      const scaleX = 0.9 + cosMag * 0.1;
      const floatY = Math.sin(rad * 2) * -2.5;

      if (charWrapperRef.current) {
        charWrapperRef.current.style.transform = `translate3d(0, ${floatY.toFixed(1)}px, 0) rotateX(${(-s.tiltX).toFixed(2)}deg) rotateY(${localTiltY.toFixed(2)}deg) scaleX(${scaleX.toFixed(3)})`;
      }

      // Crossfade smoothly between untouched HD Front and HD Back renders across the flip zone
      const backWeight = norm <= 90
        ? Math.max(0, (norm - 68) / 44)
        : norm < 270
        ? Math.min(1, Math.min(1, 0.5 + (norm - 90) / 44), Math.max(0, 1 - (norm - 248) / 44))
        : Math.max(0, 0.5 - (norm - 270) / 44);

      if (frontImgRef.current && backImgRef.current) {
        frontImgRef.current.style.opacity = (1 - backWeight).toFixed(3);
        backImgRef.current.style.opacity = backWeight.toFixed(3);
      }

      // Subtle lightning energy pulse only during the instant of Front <-> Back transition
      const flipPulse = Math.max(0, 1 - Math.min(Math.abs(norm - 90), Math.abs(norm - 270)) / 22);
      if (flashOverlayRef.current) {
        flashOverlayRef.current.style.opacity = (flipPulse * 0.45).toFixed(2);
      }

      // Rotate the 3D holographic pedestal ring underneath the boots in full 360°
      if (pedestalRingRef.current) {
        pedestalRingRef.current.style.transform = `translateX(-50%) rotateX(77deg) rotateZ(${(-norm).toFixed(1)}deg)`;
      }

      if (angleTextRef.current) {
        angleTextRef.current.textContent = `${Math.round(norm)}°`;
      }
      if (sideLabelRef.current) {
        sideLabelRef.current.textContent = isBack ? 'BACK ARMOR (180°)' : 'FRONT ARMOR (0°)';
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.targetAngle = null;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.startAngle = s.angle;
    s.startTiltX = s.tiltX;
    s.velocity = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    if (!s.isDragging) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const nextAngle = s.startAngle + dx * 0.85;
    s.velocity = (nextAngle - s.angle) * 0.45;
    s.angle = nextAngle;
    s.tiltX = Math.max(-10, Math.min(10, s.startTiltX + dy * 0.12));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    stateRef.current.isDragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const snapToAngle = (targetDeg: number) => {
    setAutoSpin(false);
    const s = stateRef.current;
    const currentNorm = ((s.angle % 360) + 360) % 360;
    let delta = targetDeg - currentNorm;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    s.targetAngle = s.angle + delta;
  };

  const currentLevel = XSUIT_LEVELS.find((l) => l.star === selectedStar) ?? XSUIT_LEVELS[6];
  const cumulativeStones = XSUIT_LEVELS.filter((l) => l.star <= selectedStar).reduce((a, b) => a + b.stones, 0);
  const cumulativeFragments = XSUIT_LEVELS.filter((l) => l.star <= selectedStar).reduce((a, b) => a + b.fragments, 0);

  return (
    <div className="panel winter-icicle-container relative overflow-hidden p-4 sm:p-6 border border-amber-400/30 bg-[#070a14]">
      {/* Subtle Ambient Gold & Cyan Showroom Glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 22% 50%, rgba(56, 189, 248, 0.14) 0%, rgba(251, 191, 36, 0.08) 45%, transparent 72%)',
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[310px_1fr] items-stretch">
        {/* ── LEFT: PITCH-BLACK HD 3D TURNTABLE SHOWROOM (100% ORIGINAL REALISM) ── */}
        <div className="flex flex-col justify-between mx-auto w-full max-w-[285px] sm:max-w-[310px]">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative h-[370px] sm:h-[410px] w-full rounded-2xl border border-amber-400/35 bg-black overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(56,189,248,0.15)]"
            style={{
              perspective: '1000px',
              touchAction: 'pan-y',
            }}
            role="region"
            aria-label="Interactive 3D BGMI Mythic X-Suit Showroom — drag left or right to rotate"
          >
            {/* Top HUD Bar */}
            <div className="absolute inset-x-3 top-2.5 z-30 flex items-center justify-between pointer-events-none font-mono text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-black/80 border border-cyan-400/40 px-2 py-0.5 text-cyan-300 font-bold uppercase">
                <Zap className="size-2.5 text-cyan-300" />
                <span ref={sideLabelRef}>FRONT ARMOR (0°)</span>
              </span>
              <span
                ref={angleTextRef}
                className="rounded-md bg-black/80 border border-amber-400/45 px-2 py-0.5 text-amber-300 font-bold tabular-nums"
              >
                0°
              </span>
            </div>

            {/* 3D Rotating Holographic X-Laboratory Pedestal on Floor (Screen Blend over Pure Black) */}
            <div
              ref={pedestalRingRef}
              className="pointer-events-none absolute bottom-2 left-1/2 z-20 size-48 sm:size-52 rounded-full border-2 border-dashed border-amber-400/70 mix-blend-screen"
              style={{
                transform: 'translateX(-50%) rotateX(77deg) rotateZ(0deg)',
                background:
                  'radial-gradient(circle, rgba(56, 189, 248, 0.42) 0%, rgba(251, 191, 36, 0.22) 52%, transparent 72%)',
                boxShadow: '0 0 24px rgba(56, 189, 248, 0.5)',
              }}
            >
              <div className="absolute inset-3 rounded-full border border-cyan-300/70" />
              <div className="absolute inset-8 rounded-full border border-amber-300/50" />
            </div>

            {/* Untouched Razor-Sharp Original HD Character Render in 3D Perspective Space */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pt-5 pb-3 pointer-events-none">
              <div
                ref={charWrapperRef}
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                {/* Original HD Front Render */}
                <img
                  ref={frontImgRef}
                  src="/images/creator/mythic-character-front.jpg"
                  alt="Pharaoh's Storm Mythic X-Suit — Front View"
                  draggable={false}
                  className="absolute inset-0 size-full object-contain"
                />

                {/* Original HD Back Render */}
                <img
                  ref={backImgRef}
                  src="/images/creator/mythic-character-back.jpg"
                  alt="Pharaoh's Storm Mythic X-Suit — Back View"
                  draggable={false}
                  className="absolute inset-0 size-full object-contain opacity-0"
                />

                {/* Pure black mask patch over the tiny bottom-right watermark corner so the original image stays 100% clean */}
                <div
                  className="absolute bottom-0 right-0 w-16 h-16 bg-black pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 75% 75%, #000000 55%, transparent 100%)',
                  }}
                />

                {/* Subtle Lightning Surge during Front <-> Back Spin Transition */}
                <div
                  ref={flashOverlayRef}
                  className="pointer-events-none absolute inset-6 rounded-full opacity-0 mix-blend-screen"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.85) 0%, rgba(251, 191, 36, 0.35) 45%, transparent 70%)',
                  }}
                />
              </div>
            </div>

            {/* Bottom Interactive Hint */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center">
              <span className="rounded-full bg-black/85 border border-amber-400/35 px-3 py-0.5 font-mono text-[9px] text-amber-200 tracking-wider uppercase">
                ↔ Swipe / Drag to Rotate 360°
              </span>
            </div>
          </div>

          {/* Camera Control Bar */}
          <div className="mt-2.5 grid grid-cols-3 gap-2 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => {
                stateRef.current.targetAngle = null;
                setAutoSpin((s) => !s);
              }}
              className={`flex items-center justify-center gap-1 rounded-xl py-2 font-bold uppercase transition cursor-pointer ${
                autoSpin
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-[0_0_14px_rgba(251,191,36,0.4)]'
                  : 'border border-amber-400/40 bg-amber-500/10 text-amber-200'
              }`}
            >
              {autoSpin ? <Pause className="size-3" /> : <Play className="size-3" />}
              <span>{autoSpin ? 'Auto-Spin' : 'Paused'}</span>
            </button>

            <button
              type="button"
              onClick={() => snapToAngle(0)}
              className="flex items-center justify-center gap-1 rounded-xl border border-line bg-card py-2 font-bold text-slate-200 hover:border-amber-400/60 hover:text-white transition cursor-pointer"
            >
              <Eye className="size-3 text-amber-300" />
              <span>Front (0°)</span>
            </button>

            <button
              type="button"
              onClick={() => snapToAngle(180)}
              className="flex items-center justify-center gap-1 rounded-xl border border-line bg-card py-2 font-bold text-slate-200 hover:border-cyan-400/60 hover:text-white transition cursor-pointer"
            >
              <RotateCw className="size-3 text-cyan-300" />
              <span>Back (180°)</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT: AUTHENTIC BGMI X-LABORATORY MAX UPGRADE & FRAGMENT CALCULATOR ── */}
        <div className="flex flex-col justify-between space-y-4 text-left min-w-0">
          {/* Header & Total Max Cost Summary */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line/70 pb-3.5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
                <Trophy className="size-3 text-amber-300" />
                BGMI X-Laboratory · 7-Star Maxed Dossier
              </div>
              <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-white">
                Pharaoh&apos;s Storm <span className="text-gradient-gold">Mythic X-Suit</span>
              </h3>
            </div>

            {/* Total Max Upgrade Materials Box (1★ -> 7★ MAX) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 font-mono text-center">
                <span className="block text-[9px] uppercase text-amber-300 font-bold">Total Starforge Stones</span>
                <span className="text-sm sm:text-base font-black text-white">🔶 {TOTAL_STONES}</span>
              </div>
              <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-center">
                <span className="block text-[9px] uppercase text-cyan-300 font-bold">Total Star Fragments</span>
                <span className="text-sm sm:text-base font-black text-white">💠 {TOTAL_FRAGMENTS.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Interactive 7-Star Level Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-300">
              <span>Select X-Suit Star Level (1★ to 7★ Max)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3" /> All 7 Levels Unlocked
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {XSUIT_LEVELS.map((lvl) => {
                const active = lvl.star === selectedStar;
                return (
                  <button
                    key={lvl.star}
                    type="button"
                    onClick={() => setSelectedStar(lvl.star)}
                    className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 font-mono transition cursor-pointer ${
                      active
                        ? 'border-amber-400 bg-gradient-to-b from-amber-400/25 to-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.3)]'
                        : 'border-line bg-surface/70 text-slate-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black">{lvl.star}★</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-tighter truncate max-w-full">
                      {lvl.star === 7 ? 'MAX' : `Lv.${lvl.star}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Level Material Cost & Unlocked Perk Card */}
          <div className="rounded-2xl border border-cyan-400/25 bg-[#10172e]/90 p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-400 px-2 py-0.5 font-mono text-xs font-black text-slate-950">
                  <Star className="size-3 fill-slate-950" /> {currentLevel.star}-STAR
                </span>
                <h4 className="font-display text-base sm:text-lg font-bold text-white">{currentLevel.title}</h4>
              </div>
              <span className="rounded-md border border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-cyan-300">
                {currentLevel.tag}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{currentLevel.desc}</p>

            {/* Level Cost vs Cumulative Cost Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-amber-300 font-bold">This Level Stones</span>
                <span className="mt-0.5 block text-xs sm:text-sm font-black text-white">
                  {currentLevel.stones === 0 ? '300 Silver' : `🔶 ${currentLevel.stones} Stones`}
                </span>
              </div>
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-cyan-300 font-bold">This Level Fragments</span>
                <span className="mt-0.5 block text-xs sm:text-sm font-black text-white">
                  {currentLevel.fragments === 0 ? 'Base Spin' : `💠 ${currentLevel.fragments} Shards`}
                </span>
              </div>
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-purple-300 font-bold">Cumulative (1★→{currentLevel.star}★)</span>
                <span className="mt-0.5 block text-xs sm:text-sm font-black text-white">
                  🔶 {cumulativeStones} · 💠 {cumulativeFragments}
                </span>
              </div>
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-emerald-300 font-bold">Special Unlock</span>
                <span className="mt-0.5 block text-[11px] font-bold text-emerald-300 truncate" title={currentLevel.perk}>
                  {currentLevel.perk}
                </span>
              </div>
            </div>
          </div>

          {/* Complete 1★ to 7★ Upgrade Breakdown Table */}
          <div className="rounded-xl border border-line/70 bg-surface/60 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-line/60 bg-black/30 font-mono text-[10px] uppercase font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Flame className="size-3.5 text-amber-400" />
                X-Laboratory Full Upgrade Chart (1★ to 7★ Max)
              </span>
              <span className="text-amber-300">~45,000 – 65,000 UC Est.</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-line/50 font-mono text-[10px] text-center">
              {XSUIT_LEVELS.slice(1).map((lvl) => (
                <button
                  key={lvl.star}
                  type="button"
                  onClick={() => setSelectedStar(lvl.star)}
                  className={`p-2 transition cursor-pointer ${
                    selectedStar === lvl.star ? 'bg-amber-400/15 text-white' : 'hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <span className="block font-black text-amber-300">{lvl.star}★ {lvl.title.split(' ')[0]}</span>
                  <span className="block text-[9px] text-slate-200 mt-0.5">🔶 {lvl.stones} Stones</span>
                  <span className="block text-[9px] text-cyan-300">💠 {lvl.fragments} Frag</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-slate-300 pt-0.5">
            <span className="inline-flex items-center gap-1">
              <Shield className="size-3 text-emerald-400" /> Owner: <strong className="text-white">FRAGxKhusiYT (UID: 5112658248)</strong>
            </span>
            <span className="inline-flex items-center gap-1 text-cyan-300 font-bold">
              <Sparkles className="size-3" /> 7★ MAX AWAKENED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
