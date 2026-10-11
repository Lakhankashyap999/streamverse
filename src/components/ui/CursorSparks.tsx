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
  '#fbbf24', // bright gold spark
  '#f59e0b', // amber fire
  '#f472b6', // neon pink blossom spark
  '#fb923c', // fiery orange
  '#ffffff', // white hot spark
  '#e879f9', // neon purple-pink
];

/**
 * Super-smooth PUBG Ember Sparks trail for BOTH Desktop Mouse & Mobile Touch.
 * - Hardware accelerated at native 1x DPR to guarantee 60-120 FPS on all mobile GPUs.
 * - RequestAnimationFrame throttled particle generation (zero polling lag).
 * - Instant touch/tap bursts and fluid drag trails.
 * - Zero CPU/GPU idle cost when not touching or moving.
 */
export function CursorSparks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    setupCanvas();

    let animationFrameId: number = 0;
    const particles: Particle[] = [];
    let currentX = -100;
    let currentY = -100;
    let lastSpawnX = -100;
    let lastSpawnY = -100;
    let isMoving = false;
    let isLooping = false;
    const maxParticles = 32;

    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const spawnEmbers = (x: number, y: number, count = 2, isBurst = false) => {
      if (particles.length >= maxParticles) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 2.8 + 1.2 : Math.random() * 1.4 + 0.4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isBurst ? 1.2 : 0.5), // gentle upward float
          size: isBurst ? Math.random() * 3.2 + 1.8 : Math.random() * 2.5 + 1.2,
          color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
          alpha: 1,
          decay: isBurst ? Math.random() * 0.035 + 0.025 : Math.random() * 0.045 + 0.03,
        });
      }
    };

    const startLoop = () => {
      if (!isLooping) {
        isLooping = true;
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    // Desktop Mouse Move
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      currentX = e.clientX;
      currentY = e.clientY;
      isMoving = true;
      startLoop();
    };

    // Desktop Click Burst
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      currentX = e.clientX;
      currentY = e.clientY;
      spawnEmbers(e.clientX, e.clientY, 8, true);
      startLoop();
    };

    // Mobile Touch Drag Trail
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
      isMoving = true;
      startLoop();
    };

    // Mobile Touch Tap Burst
    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
      lastSpawnX = touch.clientX;
      lastSpawnY = touch.clientY;
      spawnEmbers(touch.clientX, touch.clientY, 6, true);
      startLoop();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    const handleVisibility = () => {
      if (document.hidden) {
        particles.length = 0;
        ctx.clearRect(0, 0, width, height);
        isLooping = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const tick = () => {
      // Spawn ember in RAF when moving, distance-throttled to avoid redundant allocations
      if (isMoving) {
        const dx = currentX - lastSpawnX;
        const dy = currentY - lastSpawnY;
        if (dx * dx + dy * dy > 36) { // ~6px distance
          spawnEmbers(currentX, currentY, 2, false);
          lastSpawnX = currentX;
          lastSpawnY = currentY;
        }
        isMoving = false;
      }

      if (particles.length === 0) {
        ctx.clearRect(0, 0, width, height);
        isLooping = false;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gentle gravity
        p.alpha -= p.decay;
        p.size *= 0.96;

        if (p.alpha <= 0.02 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // White glowing hot center on prominent sparks
        if (p.size > 2) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(tick);
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
