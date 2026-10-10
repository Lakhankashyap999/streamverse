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
}

const SPARK_COLORS = [
  '#fbbf24', // golden spark
  '#f59e0b', // fire ember
  '#f472b6', // neon pink spark
  '#fb923c', // fiery orange
  '#c026d3', // neon magenta
  '#ffffff', // bright spark
];

/**
 * Interactive PUBG "Tiliya" / Ember Sparks cursor & touch trail.
 * Reliably tracks mouse movement on desktop and touch gestures / taps on mobile,
 * rendering crisp glowing embers scaled to Device Pixel Ratio.
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

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    setupCanvas();

    let animationFrameId: number;
    const particles: Particle[] = [];
    let lastX = -1;
    let lastY = -1;
    let isRunning = false;

    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const maxParticles = 55;

    const createSpark = (x: number, y: number, count = 2, isBurst = false) => {
      if (particles.length >= maxParticles) return;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 3.5 + 1.5 : Math.random() * 1.8 + 0.4;
        const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isBurst ? 1.2 : 0.6), // upward drift
          size: isBurst ? Math.random() * 3.5 + 2 : Math.random() * 2.8 + 1.2,
          color,
          alpha: 1,
          decay: isBurst ? Math.random() * 0.035 + 0.025 : Math.random() * 0.05 + 0.03,
        });
      }

      if (!isRunning) {
        isRunning = true;
        render();
      }
    };

    // Desktop: Pointer move
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Handled by touch events for better accuracy
      const x = e.clientX;
      const y = e.clientY;
      const dx = x - lastX;
      const dy = y - lastY;
      if (dx * dx + dy * dy > 25) {
        createSpark(x, y, 2, false);
        lastX = x;
        lastY = y;
      }
    };

    // Desktop: Click burst
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      createSpark(e.clientX, e.clientY, 10, true);
    };

    // Mobile: Touch drag / scroll trail
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      const dx = x - lastX;
      const dy = y - lastY;
      if (dx * dx + dy * dy > 16) {
        createSpark(x, y, 2, false);
        lastX = x;
        lastY = y;
      }
    };

    // Mobile: Touch tap burst
    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      lastX = touch.clientX;
      lastY = touch.clientY;
      createSpark(touch.clientX, touch.clientY, 7, true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

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

        if (p.alpha <= 0.02 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // White hot center core on prominent embers
        if (p.size > 2) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] size-full touch-none"
      aria-hidden="true"
    />
  );
}
