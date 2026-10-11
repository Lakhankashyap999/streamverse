import { useMemo } from 'react';

interface PetalConfig {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  xOffset: number;
  opacity: number;
  rotate: number;
}

/**
 * SakuraPetals — Ultra-lightweight ambient Cherry Blossom floating effect.
 * Pure CSS transform-based hardware accelerated animation.
 */
export function SakuraPetals({ count = 12, className = '' }: { count?: number; className?: string }) {
  const petals = useMemo<PetalConfig[]>(() => {
    const list: PetalConfig[] = [];
    const positions = [5, 12, 22, 35, 48, 58, 68, 78, 88, 94, 28, 82];
    for (let i = 0; i < count; i++) {
      const pos = positions[i % positions.length];
      list.push({
        id: i,
        left: `${pos}%`,
        size: 10 + (i % 5) * 2.5, // 10px to 20px
        duration: 9 + (i % 4) * 2.2, // 9s to 15.6s
        delay: -(i * 1.3), // staggered starting positions so petals appear instantly
        xOffset: (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15),
        opacity: 0.45 + (i % 3) * 0.15,
        rotate: (i * 47) % 360,
      });
    }
    return list;
  }, [count]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-10 ${className}`}
      aria-hidden="true"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="sakura-petal block"
          style={
            {
              left: p.left,
              top: '0',
              width: `${p.size}px`,
              height: `${p.size * 1.3}px`,
              '--sakura-duration': `${p.duration}s`,
              '--sakura-delay': `${p.delay}s`,
              '--sakura-opacity': p.opacity,
              '--sakura-x-start': '0px',
              '--sakura-x-end': `${p.xOffset}px`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 24 32" className="size-full">
            <defs>
              <linearGradient id={`sakura-grad-${p.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#f472b6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#db2777" stopOpacity="0.65" />
              </linearGradient>
            </defs>
            {/* Elegant curved cherry blossom petal shape */}
            <path
              d="M12 0 C18 6, 24 14, 21 22 C18 29, 13 32, 12 32 C11 32, 6 29, 3 22 C0 14, 6 6, 12 0 Z"
              fill={`url(#sakura-grad-${p.id})`}
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
