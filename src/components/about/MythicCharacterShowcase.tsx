import { useEffect, useRef, useState } from 'react';
import { Eye, Pause, Play, RotateCcw, Shield, Sparkles, Zap } from 'lucide-react';

/**
 * Removes the solid black background (#000000) and the bottom-right corner watermark
 * once on load, returning a clean transparent PNG data URL for 3D volumetric rendering.
 */
function createTransparentCutout(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Downscale slightly to 514x768 for ultra-fast mobile GPU texture upload
      const w = 514;
      const h = 768;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          // Erase bottom-right star watermark cleanly
          if (x > w * 0.78 && y > h * 0.84) {
            d[idx + 3] = 0;
            continue;
          }

          const r = d[idx];
          const g = d[idx + 1];
          const b = d[idx + 2];
          const maxC = Math.max(r, g, b);

          // Smooth luminance-keying for black background while keeping blue lightning & embers
          if (maxC < 14) {
            d[idx + 3] = 0;
          } else if (maxC < 48) {
            d[idx + 3] = Math.min(255, Math.round(((maxC - 14) / 34) * 255));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export function MythicCharacterShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const frontSideRef = useRef<HTMLDivElement>(null);
  const backSideRef = useRef<HTMLDivElement>(null);
  const edgeFlashRef = useRef<HTMLDivElement>(null);
  const pedestalRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const angleBadgeRef = useRef<HTMLSpanElement>(null);

  const [frontTex, setFrontTex] = useState<string>('/images/creator/mythic-character-front.jpg');
  const [backTex, setBackTex] = useState<string>('/images/creator/mythic-character-back.jpg');
  const [autoSpin, setAutoSpin] = useState(true);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isVisible, setIsVisible] = useState(false);

  // Mutable animation state (kept in refs so 60/120fps rotation never triggers React re-renders)
  const stateRef = useRef({
    yaw: 0, // horizontal angle in degrees
    pitch: 0, // vertical tilt in degrees (-12 to +12)
    targetYaw: null as number | null,
    isDragging: false,
    startX: 0,
    startY: 0,
    startYaw: 0,
    startPitch: 0,
    velocity: 0,
  });

  // Prepare transparent cutouts once
  useEffect(() => {
    let mounted = true;
    Promise.all([
      createTransparentCutout('/images/creator/mythic-character-front.jpg'),
      createTransparentCutout('/images/creator/mythic-character-back.jpg'),
    ]).then(([f, b]) => {
      if (mounted) {
        setFrontTex(f);
        setBackTex(b);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Pause RAF when scrolled off-screen for zero background GPU usage
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

  // Main 3D turntable animation loop (DOM refs only, zero React re-renders per frame)
  useEffect(() => {
    if (!isVisible) return;
    let rafId = 0;
    let lastSide: 'front' | 'back' = 'front';

    const tick = () => {
      const s = stateRef.current;

      if (!s.isDragging) {
        if (s.targetYaw !== null) {
          const diff = s.targetYaw - s.yaw;
          if (Math.abs(diff) < 0.6) {
            s.yaw = s.targetYaw;
            s.targetYaw = null;
          } else {
            s.yaw += diff * 0.14;
          }
          s.pitch *= 0.9;
        } else if (autoSpin) {
          // Normalize angle to [0, 360)
          const norm = ((s.yaw % 360) + 360) % 360;
          // Accelerate smoothly across the 90° and 270° side edges so it never lingers edge-on
          const edgeDist = Math.min(Math.abs(norm - 90), Math.abs(norm - 270));
          const edgeBoost = edgeDist < 28 ? 1 + ((28 - edgeDist) / 28) * 2.2 : 1;
          s.yaw += 0.55 * edgeBoost;
          s.pitch *= 0.92;
        } else if (Math.abs(s.velocity) > 0.05) {
          s.yaw += s.velocity;
          s.velocity *= 0.92;
          s.pitch *= 0.92;
        }
      }

      const normYaw = ((s.yaw % 360) + 360) % 360;
      const isBack = normYaw > 90 && normYaw < 270;
      const currentSide: 'front' | 'back' = isBack ? 'back' : 'front';
      if (currentSide !== lastSide) {
        lastSide = currentSide;
        setActiveSide(currentSide);
      }

      // Compute visual 3D tilt angle clamped so the character always looks volumetric, never paper-thin
      // Maps [0..90] -> [0..52deg], [90..180] -> [128..180deg], etc.
      const rad = (normYaw * Math.PI) / 180;
      const sinYaw = Math.sin(rad);
      const cosYaw = Math.cos(rad);
      const visualTiltY = sinYaw * 38; // max ±38° 3D perspective angle per face
      const scaleX = 0.86 + Math.abs(cosYaw) * 0.14;

      if (rigRef.current) {
        rigRef.current.style.transform = `rotateX(${(-s.pitch).toFixed(2)}deg) rotateY(${visualTiltY.toFixed(2)}deg) scaleX(${scaleX.toFixed(3)})`;
      }

      if (frontSideRef.current && backSideRef.current) {
        frontSideRef.current.style.opacity = isBack ? '0' : '1';
        backSideRef.current.style.opacity = isBack ? '1' : '0';
      }

      // Electric plasma surge when crossing the 90° / 270° transition edge
      const edgeProximity = Math.max(0, 1 - Math.min(Math.abs(normYaw - 90), Math.abs(normYaw - 270)) / 24);
      if (edgeFlashRef.current) {
        edgeFlashRef.current.style.opacity = (edgeProximity * 0.85).toFixed(2);
        edgeFlashRef.current.style.transform = `translateZ(14px) scale(${(0.95 + edgeProximity * 0.12).toFixed(2)})`;
      }

      // Dynamic armor specular light sweep
      if (sheenRef.current) {
        const sheenX = 50 + sinYaw * 35;
        sheenRef.current.style.background = `radial-gradient(circle at ${sheenX.toFixed(0)}% 38%, rgba(56, 189, 248, 0.22), transparent 62%)`;
      }

      // Rotate 3D pedestal ring in full 360°
      if (pedestalRef.current) {
        pedestalRef.current.style.transform = `translateX(-50%) rotateX(75deg) rotateZ(${(-normYaw).toFixed(1)}deg)`;
      }

      if (angleBadgeRef.current) {
        angleBadgeRef.current.textContent = `${Math.round(normYaw)}°`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [autoSpin, isVisible]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.targetYaw = null;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.startYaw = s.yaw;
    s.startPitch = s.pitch;
    s.velocity = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = stateRef.current;
    if (!s.isDragging) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    const nextYaw = s.startYaw + dx * 0.85;
    s.velocity = (nextYaw - s.yaw) * 0.5;
    s.yaw = nextYaw;
    s.pitch = Math.max(-12, Math.min(12, s.startPitch + dy * 0.15));
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
    const currentNorm = ((s.yaw % 360) + 360) % 360;
    let delta = targetDeg - currentNorm;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    s.targetYaw = s.yaw + delta;
  };

  return (
    <div className="panel winter-icicle-container relative overflow-hidden p-4 sm:p-6 border border-cyan-400/25 bg-[#0b1022]">
      {/* Subtle Ambient Aura */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 28% 50%, rgba(14, 165, 233, 0.14) 0%, rgba(251, 191, 36, 0.06) 40%, transparent 70%)',
        }}
      />

      <div className="grid gap-6 md:grid-cols-[260px_1fr] lg:grid-cols-[290px_1fr] items-center">
        {/* ── LEFT: COMPACT 3D INTERACTIVE TURNTABLE VIEWPORT ── */}
        <div className="relative mx-auto w-full max-w-[250px] sm:max-w-[280px]">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative h-[300px] sm:h-[340px] w-full rounded-2xl border border-cyan-400/30 bg-[#060914] overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-[inset_0_0_40px_rgba(14,165,233,0.18)]"
            style={{
              perspective: '850px',
              touchAction: 'pan-y',
            }}
            role="region"
            aria-label="Interactive 3D BGMI Mythic Character Turntable — drag left or right to rotate"
          >
            {/* Top HUD telemetry bar inside 3D viewport */}
            <div className="absolute inset-x-2.5 top-2.5 z-20 flex items-center justify-between pointer-events-none font-mono text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 text-cyan-300 font-bold uppercase">
                <Zap className="size-2.5 text-cyan-300" />
                {activeSide === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
              </span>
              <span
                ref={angleBadgeRef}
                className="rounded-md bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-amber-300 font-bold tabular-nums"
              >
                0°
              </span>
            </div>

            {/* Dynamic Armor Specular Lighting Sweep */}
            <div ref={sheenRef} className="pointer-events-none absolute inset-0 z-10" />

            {/* 3D Volumetric Character Rig */}
            <div className="absolute inset-0 flex items-center justify-center pb-5 pt-6 pointer-events-none">
              <div
                ref={rigRef}
                className="relative w-[195px] h-[255px] sm:w-[215px] sm:h-[285px]"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                {/* FRONT VOLUMETRIC STACK (3 Depth Planes for 2.5D Relief) */}
                <div
                  ref={frontSideRef}
                  className="absolute inset-0"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Back Rim Depth Slice */}
                  <img
                    src={frontTex}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 size-full object-contain opacity-45 brightness-75 saturate-150"
                    style={{ transform: 'translateZ(-7px) scale(0.985)' }}
                  />
                  {/* Main Core Slice */}
                  <img
                    src={frontTex}
                    alt="BGMI Mythic Character Front"
                    draggable={false}
                    className="absolute inset-0 size-full object-contain"
                    style={{ transform: 'translateZ(0px)' }}
                  />
                  {/* Foreground Highlight Relief Slice */}
                  <img
                    src={frontTex}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 size-full object-contain opacity-35 mix-blend-screen"
                    style={{ transform: 'translateZ(7px) scale(1.01)' }}
                  />
                </div>

                {/* BACK VOLUMETRIC STACK (3 Depth Planes for 2.5D Relief) */}
                <div
                  ref={backSideRef}
                  className="absolute inset-0"
                  style={{ transformStyle: 'preserve-3d', opacity: 0 }}
                >
                  <img
                    src={backTex}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 size-full object-contain opacity-45 brightness-75 saturate-150"
                    style={{ transform: 'translateZ(-7px) scale(0.985)' }}
                  />
                  <img
                    src={backTex}
                    alt="BGMI Mythic Character Back"
                    draggable={false}
                    className="absolute inset-0 size-full object-contain"
                    style={{ transform: 'translateZ(0px)' }}
                  />
                  <img
                    src={backTex}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 size-full object-contain opacity-35 mix-blend-screen"
                    style={{ transform: 'translateZ(7px) scale(1.01)' }}
                  />
                </div>

                {/* Electric Lightning Warp Surge during 90° / 270° Side Flip */}
                <div
                  ref={edgeFlashRef}
                  className="pointer-events-none absolute inset-4 rounded-full opacity-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.75) 0%, rgba(251, 191, 36, 0.35) 45%, transparent 72%)',
                  }}
                />
              </div>
            </div>

            {/* 3D Rotating BGMI Mythic Pedestal Ring under the character */}
            <div
              ref={pedestalRef}
              className="pointer-events-none absolute bottom-3 left-1/2 size-40 sm:size-44 rounded-full border-2 border-dashed border-amber-400/60 shadow-[0_0_20px_rgba(56,189,248,0.45)]"
              style={{
                transform: 'translateX(-50%) rotateX(75deg) rotateZ(0deg)',
                background:
                  'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(251, 191, 36, 0.15) 55%, transparent 72%)',
              }}
            >
              <div className="absolute inset-3 rounded-full border border-cyan-300/60" />
            </div>

            {/* Bottom Drag Hint Pill */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center">
              <span className="rounded-full bg-black/75 border border-white/15 px-2.5 py-0.5 font-mono text-[9px] text-slate-200 tracking-wider uppercase">
                ↔ Drag / Touch to Rotate 3D
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: MYTHIC X-SUIT DOSSIER & INTERACTIVE CONTROLS ── */}
        <div className="flex flex-col justify-between space-y-4 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <Sparkles className="size-3 text-amber-300" />
              In-Game Mythic Avatar · 3D Turntable
            </div>
            <h3 className="mt-2.5 font-display text-xl sm:text-2xl font-bold text-white">
              Pharaoh&apos;s Storm <span className="text-gradient-gold">Mythic X-Suit</span>
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
              KhushiYT&apos;s signature in-game battleground avatar featuring golden Pharaoh winged armor, glowing subzero cyber-dreads, and reactive high-voltage arc lightning.
            </p>
          </div>

          {/* Compact Loadout Attributes Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 font-mono">
            <div className="rounded-xl border border-line bg-surface/75 p-2.5">
              <span className="block text-[9px] uppercase text-cyan-300 font-bold">Tier Grade</span>
              <span className="mt-0.5 block text-xs sm:text-sm font-black text-white">⭐⭐⭐⭐⭐⭐⭐</span>
            </div>
            <div className="rounded-xl border border-line bg-surface/75 p-2.5">
              <span className="block text-[9px] uppercase text-amber-300 font-bold">Kill Broadcast</span>
              <span className="mt-0.5 block text-xs sm:text-sm font-black text-white truncate"> Golden Storm</span>
            </div>
            <div className="rounded-xl border border-line bg-surface/75 p-2.5">
              <span className="block text-[9px] uppercase text-pink-300 font-bold">Spawn Island</span>
              <span className="mt-0.5 block text-xs sm:text-sm font-black text-white truncate">Lightning Aura</span>
            </div>
          </div>

          {/* Interactive 3D Camera Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                stateRef.current.targetYaw = null;
                setAutoSpin((s) => !s);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                autoSpin
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.45)]'
                  : 'border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
              }`}
            >
              {autoSpin ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              <span>{autoSpin ? 'Auto-Spin: ON' : 'Auto-Spin: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => snapToAngle(0)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-bold transition cursor-pointer ${
                activeSide === 'front' && !autoSpin
                  ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                  : 'border-line bg-card text-slate-200 hover:border-white/30 hover:text-white'
              }`}
            >
              <Eye className="size-3.5 text-amber-300" />
              <span>Front (0°)</span>
            </button>

            <button
              type="button"
              onClick={() => snapToAngle(180)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-bold transition cursor-pointer ${
                activeSide === 'back' && !autoSpin
                  ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                  : 'border-line bg-card text-slate-200 hover:border-white/30 hover:text-white'
              }`}
            >
              <RotateCcw className="size-3.5 text-cyan-300" />
              <span>Back (180°)</span>
            </button>

            <span className="ml-auto hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-slate-300">
              <Shield className="size-3 text-emerald-400" /> 3D Touch & Mouse Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
