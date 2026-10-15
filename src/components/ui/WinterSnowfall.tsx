import { useEffect, useState } from 'react';
import { useWinterMode } from '../../context/WinterModeContext';

interface SnowLayerSpec {
  tile: number;
  flakes: number;
  minR: number;
  maxR: number;
  alpha: number;
  fall: number; // seconds for one full tile of fall
  gust: number; // wind multiplier for this layer
}

/**
 * Builds one seamless, wrap-around snow tile once (a single PNG data URL).
 * After that the snow is animated purely with CSS transforms, which run on the
 * compositor thread - so it keeps falling smoothly even while the page scrolls
 * (the old canvas version ran on the main thread and froze during scroll).
 */
function buildTile(spec: SnowLayerSpec): string {
  const c = document.createElement('canvas');
  c.width = spec.tile;
  c.height = spec.tile;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = `rgba(240, 249, 255, ${spec.alpha})`;
  ctx.shadowColor = 'rgba(186, 230, 253, 0.9)';
  ctx.shadowBlur = spec.maxR * 1.6;
  for (let i = 0; i < spec.flakes; i++) {
    const x = Math.random() * spec.tile;
    const y = Math.random() * spec.tile;
    const r = spec.minR + Math.random() * (spec.maxR - spec.minR);
    // Draw wrapped copies so flakes crossing an edge tile seamlessly
    for (const ox of [-spec.tile, 0, spec.tile]) {
      for (const oy of [-spec.tile, 0, spec.tile]) {
        const px = x + ox;
        const py = y + oy;
        if (px < -r * 4 || px > spec.tile + r * 4 || py < -r * 4 || py > spec.tile + r * 4) continue;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return c.toDataURL('image/png');
}

export function WinterSnowfall() {
  const { isWinterMode, isFreezing } = useWinterMode();
  const [snowOpacity, setSnowOpacity] = useState(0);
  const [layers, setLayers] = useState<{ spec: SnowLayerSpec; url: string }[]>([]);

  // Fade snowfall in gently over 1s when winter mode turns on
  useEffect(() => {
    if (isWinterMode) {
      const timer = setTimeout(() => setSnowOpacity(1), 50);
      return () => clearTimeout(timer);
    }
    setSnowOpacity(0);
  }, [isWinterMode]);

  // Generate the three depth layers once (cheap, ~3 tiny canvases)
  useEffect(() => {
    if (!isWinterMode || layers.length) return;
    const isMobile = window.innerWidth < 768;
    const specs: SnowLayerSpec[] = [
      // far: tiny, slow, soft
      { tile: 480, flakes: isMobile ? 10 : 16, minR: 0.8, maxR: 1.4, alpha: 0.5, fall: 22, gust: 0.6 },
      // mid
      { tile: 560, flakes: isMobile ? 8 : 12, minR: 1.3, maxR: 2.1, alpha: 0.8, fall: 15, gust: 1 },
      // near: bigger, faster, catches the gusts the most
      { tile: 640, flakes: isMobile ? 5 : 8, minR: 2.0, maxR: 3.2, alpha: 0.95, fall: 10, gust: 1.5 },
    ];
    setLayers(specs.map((spec) => ({ spec, url: buildTile(spec) })));
  }, [isWinterMode, layers.length]);

  if (!isWinterMode && snowOpacity === 0 && !isFreezing) return null;

  return (
    <>
      {/* 1. Compositor-only snowfall (CSS transform animation, zero main-thread work while scrolling) */}
      <div
        className="winter-snow-root"
        style={{ opacity: snowOpacity }}
        aria-hidden="true"
      >
        {layers.map(({ spec, url }, i) => (
          <div
            key={i}
            className="winter-snow-gust"
            style={{ ['--gust' as string]: spec.gust }}
          >
            <div
              className="winter-snow-fall"
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: `${spec.tile}px ${spec.tile}px`,
                top: `-${spec.tile}px`,
                ['--tile' as string]: `${spec.tile}px`,
                animationDuration: `${spec.fall}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* 2. Tiny, subtle snow accumulation strictly in the extreme bottom corners */}
      <div
        className="fixed bottom-0 left-0 z-[46] pointer-events-none select-none transition-opacity duration-1000 ease-out"
        style={{ opacity: snowOpacity * 0.75 }}
      >
        <svg className="w-20 sm:w-28 h-3.5 sm:h-4" viewBox="0 0 120 20" fill="none" aria-hidden="true">
          <path d="M0 20 L0 6 Q15 4 30 9 Q50 3 75 11 Q100 8 120 20 Z" fill="url(#subtleSnowL)" />
          <defs>
            <linearGradient id="subtleSnowL" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div
        className="fixed bottom-0 right-0 z-[46] pointer-events-none select-none transition-opacity duration-1000 ease-out"
        style={{ opacity: snowOpacity * 0.75 }}
      >
        <svg className="w-20 sm:w-28 h-3.5 sm:h-4 -scale-x-100" viewBox="0 0 120 20" fill="none" aria-hidden="true">
          <path d="M0 20 L0 6 Q15 4 30 9 Q50 3 75 11 Q100 8 120 20 Z" fill="url(#subtleSnowL)" />
        </svg>
      </div>

      {/* 3. Soft, Diffused Top-to-Bottom Frost Wave (Zero Sharp Edges, Pure Mist) */}
      {isFreezing && (
        <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-x-0 w-full h-[60vh] -top-[60vh] pointer-events-none opacity-15"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(186, 230, 253, 0.04) 15%, rgba(186, 230, 253, 0.12) 35%, rgba(224, 242, 254, 0.25) 50%, rgba(186, 230, 253, 0.12) 65%, rgba(186, 230, 253, 0.04) 85%, transparent 100%)',
              animation: 'frostMistWave 3.0s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transform: 'translateZ(0)',
            }}
          />
          <div
            className="absolute inset-0 bg-cyan-300/5 pointer-events-none"
            style={{ animation: 'frostMistBreathe 2.8s ease-out forwards' }}
          />
        </div>
      )}
    </>
  );
}
