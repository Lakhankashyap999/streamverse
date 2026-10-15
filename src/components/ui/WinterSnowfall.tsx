import { useEffect, useRef } from 'react';
import { useWinterMode } from '../../context/WinterModeContext';

export function WinterSnowfall() {
  const { isWinterMode } = useWinterMode();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isWinterMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasDimensions = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions, { passive: true });

    // Subtle, gentle snowfall - 45 delicate flakes on desktop, 25 on mobile
    const count = window.innerWidth < 768 ? 25 : 45;
    const flakes: Array<{
      x: number;
      y: number;
      r: number;
      s: number;
      w: number;
      angle: number;
      op: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      // Natural small flakes: 1.0px to 2.4px diameter (delicate, realistic, no big polka dots)
      const r = Math.random() * 1.2 + 0.8;
      const s = r * 0.4 + Math.random() * 0.6 + 0.4;
      const op = Math.random() * 0.4 + 0.45; // Soft natural opacity

      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        s,
        w: Math.random() * 0.02 + 0.008,
        angle: Math.random() * Math.PI * 2,
        op,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 16.67, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(240, 249, 255, ${f.op})`;
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();

        // Gentle, soft swaying wind drift
        f.angle += f.w * delta;
        f.x += (Math.sin(f.angle) * 0.5 + 0.2) * delta;
        f.y += f.s * delta;

        // Wrap around boundaries smoothly
        if (f.y > height + 6) {
          f.y = -6;
          f.x = Math.random() * width;
        }
        if (f.x > width + 8) f.x = -8;
        if (f.x < -8) f.x = width + 8;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animId);
    };
  }, [isWinterMode]);

  if (!isWinterMode) return null;

  return (
    <>
      {/* 1. Delicate, Natural Gentle Snowfall Canvas (60FPS, no giant polka dots) */}
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

      {/* 2. Tiny, subtle, non-intrusive snow accumulation strictly in the extreme bottom corners */}
      {/* Bottom-Left Extreme Corner: Only 18px high, nestled in corner, covers NO buttons/content */}
      <div className="fixed bottom-0 left-0 z-[46] pointer-events-none select-none">
        <svg
          className="w-24 sm:w-32 h-4 sm:h-5 opacity-80"
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

      {/* Bottom-Right Extreme Corner: Only 18px high, nestled in corner */}
      <div className="fixed bottom-0 right-0 z-[46] pointer-events-none select-none">
        <svg
          className="w-24 sm:w-32 h-4 sm:h-5 -scale-x-100 opacity-80"
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
