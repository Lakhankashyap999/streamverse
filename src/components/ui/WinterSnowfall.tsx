import { useEffect, useRef } from 'react';
import { useWinterMode } from '../../context/WinterModeContext';

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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();

    // Prevent resize re-allocations during mobile scroll (only trigger on actual screen width change)
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (Math.abs(window.innerWidth - lastWidth) > 30) {
        lastWidth = window.innerWidth;
        setCanvasDimensions();
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // 20 delicate flakes on mobile, 35 on desktop (hyper-optimized for 120 FPS)
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 20 : 35;
    const flakes: Array<{
      x: number;
      y: number;
      r: number;
      s: number;
      w: number;
      angle: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      const r = Math.random() * 1.0 + 0.8;
      const s = r * 0.45 + Math.random() * 0.5 + 0.35;

      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        s,
        w: Math.random() * 0.02 + 0.008,
        angle: Math.random() * Math.PI * 2,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Single batched draw call for ALL flakes (zero GPU overhead)
      ctx.fillStyle = 'rgba(235, 248, 255, 0.75)';
      ctx.beginPath();

      for (let i = 0; i < count; i++) {
        const f = flakes[i];
        ctx.moveTo(f.x + f.r, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);

        // Gentle, soft swaying wind drift
        f.angle += f.w * delta;
        f.x += (Math.sin(f.angle) * 0.4 + 0.15) * delta;
        f.y += f.s * delta;

        // Wrap around boundaries smoothly
        if (f.y > height + 5) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width + 6) f.x = -6;
        if (f.x < -6) f.x = width + 6;
      }

      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isWinterMode]);

  if (!isWinterMode) return null;

  return (
    <>
      {/* 1. Delicate, Natural Gentle Snowfall Canvas (Batched GPU rendering, 120FPS smooth) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[45]"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          contain: 'strict',
        }}
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
