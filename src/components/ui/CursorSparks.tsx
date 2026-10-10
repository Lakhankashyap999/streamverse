import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  glow: number;
}

const SPARK_COLORS = [
  '#fbbf24', // golden spark
  '#f59e0b', // fire ember
  '#f472b6', // neon pink spark
  '#fb923c', // fiery orange
  '#c026d3', // neon magenta
  '#fde68a', // bright core
];

/**
 * Interactive PUBG "Tiliya" / Ember Sparks cursor & touch trail.
 * Renders glowing ember sparks following mouse movement and touch gestures,
 * plus a firecracker ricochet burst on clicks/taps.
 */
export function CursorSparks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId: number;
    const particles: Particle[] = [];
    let lastX = -1;
    let lastY = -1;
    let isRunning = false;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const isMobile = window.innerWidth < 640;
    const maxParticles = isMobile ? 25 : 45;

    const createSpark = (x: number, y: number, count = 2, isBurst = false) => {
      if (particles.length >= maxParticles) return;

      const actualCount = isMobile ? Math.min(count, 2) : count;
      for (let i = 0; i < actualCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 3.5 + 1.5 : Math.random() * 1.6 + 0.4;
        const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isBurst ? 1.2 : 0.6),
          size: isBurst ? Math.random() * 3.5 + 2 : Math.random() * 2.5 + 1.2,
          color,
          alpha: 1,
          decay: isBurst ? Math.random() * 0.035 + 0.025 : Math.random() * 0.05 + 0.035,
          glow: Math.random() * 4 + 2,
        });
      }

      if (!isRunning) {
        isRunning = true;
        render();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const dx = x - lastX;
      const dy = y - lastY;
      const dist = dx * dx + dy * dy;

      if (dist > 36) { // moved > 6px
        createSpark(x, y, isMobile ? 1 : 2, false);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      createSpark(e.clientX, e.clientY, isMobile ? 8 : 12, true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const handleVisibility = () => {
      if (document.hidden) {
        particles.length = 0;
        isRunning = false;
        ctx.clearRect(0, 0, width, height);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (particles.length === 0) {
        ctx.clearRect(0, 0, width, height);
        isRunning = false;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gentle gravity
        p.alpha -= p.decay;
        p.size *= 0.95;

        if (p.alpha <= 0.01 || p.size <= 0.3) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle for larger embers without shadowBlur
        if (p.size > 2.2) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] size-full"
      aria-hidden="true"
    />
  );
}
