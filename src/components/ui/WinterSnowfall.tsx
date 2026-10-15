import { useEffect, useRef } from 'react';
import { useWinterMode } from '../../context/WinterModeContext';

interface Flake {
  x: number;
  y: number;
  r: number;
  speedY: number;
  speedX: number;
  windWeight: number;
  angle: number;
  w: number;
  layer: 0 | 1;
}

export function WinterSnowfall() {
  const { isWinterMode } = useWinterMode();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isWinterMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;

    // Keep DPR optimized (max 1.25) for ultra-low GPU memory bandwidth and 120 FPS buttery scrolling
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasDimensions = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();

    // Prevent resize re-allocations during mobile scroll
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (Math.abs(window.innerWidth - lastWidth) > 30) {
        lastWidth = window.innerWidth;
        setCanvasDimensions();
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Scroll reactivity: prevents snowfall from looking frozen or static while scrolling
    let scrollVel = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      lastScrollTime = now;

      // Positive dy = user scrolling down (page moves up)
      const impulse = (dy / dt) * 0.4;
      scrollVel = Math.max(-6, Math.min(6, scrollVel + impulse));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const isMobile = window.innerWidth < 768;
    // 38 particles on mobile, 65 on desktop for a rich snowy atmosphere
    const count = isMobile ? 38 : 65;
    const flakes: Flake[] = [];

    for (let i = 0; i < count; i++) {
      const isForeground = Math.random() < 0.35;
      const isBackground = !isForeground && Math.random() < 0.55;

      const r = isForeground
        ? Math.random() * 1.3 + 2.2 // 2.2px to 3.5px
        : isBackground
        ? Math.random() * 0.6 + 0.8 // 0.8px to 1.4px
        : Math.random() * 0.8 + 1.4; // 1.4px to 2.2px

      const layer: 0 | 1 = isBackground ? 0 : 1;

      flakes.push({
        x: Math.random() * (width + 120) - 60,
        y: Math.random() * height,
        r,
        speedY: isForeground ? Math.random() * 0.8 + 1.2 : Math.random() * 0.5 + 0.7,
        speedX: Math.random() * 0.4 - 0.2,
        windWeight: isForeground ? 1.3 : isBackground ? 0.7 : 1.0,
        angle: Math.random() * Math.PI * 2,
        w: Math.random() * 0.02 + 0.008,
        layer,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      // Real elapsed time calculation - never throttles during scroll
      const elapsed = time - lastTime;
      lastTime = time;
      const delta = Math.min(Math.max(elapsed / 16.67, 0.2), 3.5);

      // Smooth decay for scroll velocity
      scrollVel *= 0.93;

      // ── Wind Gust Cycle ("Aandhi" vs "Halka" Snowfall) ──
      // Total periodic cycle ~13 seconds
      const t = time * 0.001; // in seconds
      const cyclePhase = (t / 13) * Math.PI * 2;

      // Gust intensity (0.0 = calm/halka, 1.0 = heavy storm gust/aandhi)
      const rawGust = Math.max(0, Math.sin(cyclePhase));
      const gust = Math.pow(rawGust, 2.8); // Natural gust surge

      // Horizontal wind + slight downward surge during gusts
      const windX = 0.35 + gust * 3.6 + Math.sin(t * 1.8) * 0.25;
      const windY = gust * 0.65;

      ctx.clearRect(0, 0, width, height);

      // ── Pass 1: Background Flurry (Soft, semi-transparent) ──
      ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const f = flakes[i];
        if (f.layer !== 0) continue;
        ctx.moveTo(f.x + f.r, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);

        // Physics update
        f.angle += f.w * delta;
        const sway = Math.sin(f.angle) * 0.35;
        f.x += (f.speedX + sway + windX * f.windWeight + scrollVel * 0.12) * delta;
        f.y += (f.speedY + windY + scrollVel * 0.2) * delta;

        // Boundary wrapping
        if (f.y > height + 15) {
          f.y = -15;
          f.x = Math.random() * (width + 60) - 30;
        } else if (f.y < -20) {
          f.y = height + 15;
        }
        if (f.x > width + 25) f.x = -25;
        if (f.x < -25) f.x = width + 25;
      }
      ctx.fill();

      // ── Pass 2: Midground & Foreground Snow (Crisp White with Icy Luminance) ──
      ctx.fillStyle = 'rgba(240, 249, 255, 0.9)';
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const f = flakes[i];
        if (f.layer !== 1) continue;
        ctx.moveTo(f.x + f.r, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);

        // Physics update
        f.angle += f.w * delta;
        const sway = Math.sin(f.angle) * 0.45;
        f.x += (f.speedX + sway + windX * f.windWeight + scrollVel * 0.16) * delta;
        f.y += (f.speedY + windY + scrollVel * 0.28) * delta;

        // Boundary wrapping
        if (f.y > height + 15) {
          f.y = -15;
          f.x = Math.random() * (width + 80) - 40;
        } else if (f.y < -20) {
          f.y = height + 15;
        }
        if (f.x > width + 30) f.x = -30;
        if (f.x < -30) f.x = width + 30;
      }
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, [isWinterMode]);

  if (!isWinterMode) return null;

  return (
    <>
      {/* 1. Delicate & Dynamic Blizzard Snowfall Canvas (Hardware accelerated, 120FPS smooth) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[45] w-full h-full"
        aria-hidden="true"
      />

      {/* 2. Tiny, subtle snow accumulation strictly in the extreme bottom corners */}
      <div className="fixed bottom-0 left-0 z-[46] pointer-events-none select-none">
        <svg
          className="w-20 sm:w-28 h-3.5 sm:h-4 opacity-75"
          viewBox="0 0 120 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 20 L0 6 Q15 4 30 9 Q50 3 75 11 Q100 8 120 20 Z"
            fill="url(#subtleSnowL)"
          />
          <defs>
            <linearGradient id="subtleSnowL" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="fixed bottom-0 right-0 z-[46] pointer-events-none select-none">
        <svg
          className="w-20 sm:w-28 h-3.5 sm:h-4 -scale-x-100 opacity-75"
          viewBox="0 0 120 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 20 L0 6 Q15 4 30 9 Q50 3 75 11 Q100 8 120 20 Z"
            fill="url(#subtleSnowL)"
          />
        </svg>
      </div>
    </>
  );
}
