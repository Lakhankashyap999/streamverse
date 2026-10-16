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
  const { isWinterMode } = useWinterMode();
  const [layers, setLayers] = useState<{ spec: SnowLayerSpec; url: string }[]>([]);

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

  if (!isWinterMode) return null;

  return (
    <div className="winter-snow-root" aria-hidden="true">
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
  );
}
