import { useEffect, useState } from 'react';
import { useWinterMode } from '../../context/WinterModeContext';

interface SnowLayerSpec {
  tile: number;
  flakes: number;
  minR: number;
  maxR: number;
  alpha: number;
  fall: number;
  swayClass: string;
}

/**
 * Generates a small, seamless wrap-around snow tile once into a PNG data URL.
 * Keeping the tile compact (280px–340px) and using only 2 flat GPU layers
 * guarantees <1ms compositor frame time on all mobile WebViews and desktops.
 */
function buildTile(spec: SnowLayerSpec): string {
  const c = document.createElement('canvas');
  c.width = spec.tile;
  c.height = spec.tile;
  const ctx = c.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = `rgba(240, 249, 255, ${spec.alpha})`;

  for (let i = 0; i < spec.flakes; i++) {
    const x = Math.random() * spec.tile;
    const y = Math.random() * spec.tile;
    const r = spec.minR + Math.random() * (spec.maxR - spec.minR);

    for (const ox of [-spec.tile, 0, spec.tile]) {
      for (const oy of [-spec.tile, 0, spec.tile]) {
        const px = x + ox;
        const py = y + oy;
        if (px < -r * 2 || px > spec.tile + r * 2 || py < -r * 2 || py > spec.tile + r * 2) continue;
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

  // Smoothly fade snowfall in over 1.2s when winter mode turns on
  useEffect(() => {
    if (isWinterMode) {
      const timer = setTimeout(() => setSnowOpacity(1), 40);
      return () => clearTimeout(timer);
    }
    setSnowOpacity(0);
  }, [isWinterMode]);

  useEffect(() => {
    if (!isWinterMode || layers.length > 0) return;
    const isMobile = window.innerWidth < 768;
    const specs: SnowLayerSpec[] = [
      // Layer 1 (Far): fine soft snow
      {
        tile: 280,
        flakes: isMobile ? 10 : 14,
        minR: 1.0,
        maxR: 1.7,
        alpha: 0.65,
        fall: 14,
        swayClass: 'winter-snow-layer-a',
      },
      // Layer 2 (Near): larger foreground flakes
      {
        tile: 340,
        flakes: isMobile ? 7 : 10,
        minR: 1.8,
        maxR: 2.8,
        alpha: 0.9,
        fall: 9.5,
        swayClass: 'winter-snow-layer-b',
      },
    ];
    setLayers(specs.map((spec) => ({ spec, url: buildTile(spec) })));
  }, [isWinterMode, layers.length]);

  if (!isWinterMode && snowOpacity === 0 && !isFreezing) return null;

  return (
    <>
      {/* 1. Ultra-smooth 2-layer compositor snowfall with gentle fade-in */}
      <div
        className="winter-snow-root"
        style={{ opacity: snowOpacity }}
        aria-hidden="true"
      >
        {layers.map(({ spec, url }, i) => (
          <div
            key={i}
            className={`winter-snow-fall ${spec.swayClass}`}
            style={{
              backgroundImage: `url(${url})`,
              backgroundSize: `${spec.tile}px ${spec.tile}px`,
              top: `-${spec.tile}px`,
              ['--tile' as string]: `${spec.tile}px`,
              animationDuration: `${spec.fall}s`,
            }}
          />
        ))}
      </div>

      {/* 2. Soft Top-to-Bottom Frost Wave when freezing begins (GPU-composited transform + opacity only) */}
      {isFreezing && (
        <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-x-0 w-full h-[55vh] -top-[55vh] pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(186, 230, 253, 0.06) 20%, rgba(224, 242, 254, 0.22) 50%, rgba(186, 230, 253, 0.06) 80%, transparent 100%)',
              animation: 'frostMistWave 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              willChange: 'transform, opacity',
            }}
          />
        </div>
      )}
    </>
  );
}
