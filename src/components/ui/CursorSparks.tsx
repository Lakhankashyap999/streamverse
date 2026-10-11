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

const SPARK_COLORS = ['#fbbf24', '#f59e0b', '#f472b6', '#fb923c', '#ffffff'];

/**
 * Super-smooth, hardware-accelerated Ember Sparks cursor trail.
 * - Automatically disables on touch/mobile devices to prevent scrolling jank.
 * - Throttles mouse movement to requestAnimationFrame to prevent high-DPI mouse polling lag.
 * - Idle-pauses RAF loop when cursor stops to save 100% CPU/GPU cycles.
 */
export function CursorSparks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Disable on touch devices (mobile phones/tablets) and reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches || !window.matchMedia('(hover: hover)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    setupCanvas();

    let animationFrameId: number = 0;
    const particles: Particle[] = [];
    let mouseX = -100;
    let mouseY = -100;
    let lastSpawnX = -100;
    let lastSpawnY = -100;
    let isMoving = false;
    let isLooping = false;
    const maxParticles = 24;

    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const spawnEmbers = (x: number, y: number, count = 1, isBurst = false) => {
      if (particles.length >= maxParticles) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 2.8 + 1.2 : Math.random() * 1.2 + 0.3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isBurst ? 1 : 0.4),
          size: isBurst ? Math.random() * 3 + 1.5 : Math.random() * 2.2 + 1,
          color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
          alpha: 1,
          decay: isBurst ? Math.random() * 0.04 + 0.025 : Math.random() * 0.05 + 0.035,
        });
      }
    };

    const startLoop = () => {
      if (!isLooping) {
        isLooping = true;
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      startLoop();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      spawnEmbers(e.clientX, e.clientY, 8, true);
      startLoop();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

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
      // Spawn ember if cursor moved far enough
      if (isMoving) {
        const dx = mouseX - lastSpawnX;
        const dy = mouseY - lastSpawnY;
        if (dx * dx + dy * dy > 36) {
          spawnEmbers(mouseX, mouseY, 1, false);
          lastSpawnX = mouseX;
          lastSpawnY = mouseY;
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
        p.vy += 0.02;
        p.alpha -= p.decay;
        p.size *= 0.95;

        if (p.alpha <= 0.02 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(tick);
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
      className="pointer-events-none fixed inset-0 z-[9999] size-full touch-none will-change-transform"
      aria-hidden="true"
    />
  );
}
