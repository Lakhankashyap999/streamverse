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

    const createSpark = (x: number, y: number, count = 3, isBurst = false) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 4 + 2 : Math.random() * 2 + 0.5;
        const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5),
          vy: Math.sin(angle) * speed - (isBurst ? 1.5 : 0.8), // upward drift like embers
          size: isBurst ? Math.random() * 4 + 2.5 : Math.random() * 3 + 1.5,
          color,
          alpha: 1,
          decay: isBurst ? Math.random() * 0.03 + 0.02 : Math.random() * 0.04 + 0.03,
          glow: Math.random() * 8 + 4,
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

      // Only spawn if moved at least 4px to avoid clustering
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 4) {
        createSpark(x, y, 3, false);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      createSpark(e.clientX, e.clientY, 12, true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      createSpark(touch.clientX, touch.clientY, 2, false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

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
        p.vy += 0.03; // slight gravity
        p.alpha -= p.decay;
        p.size *= 0.96; // shrink over time

        if (p.alpha <= 0 || p.size <= 0.3) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;

        // Draw diamond spark / ember
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross star sparkle on larger embers
        if (p.size > 2.2) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 1.5, p.y);
          ctx.lineTo(p.x + p.size * 1.5, p.y);
          ctx.moveTo(p.x, p.y - p.size * 1.5);
          ctx.lineTo(p.x, p.y + p.size * 1.5);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('touchmove', handleTouchMove);
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
