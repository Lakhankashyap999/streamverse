import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { Crosshair } from 'lucide-react';
import { cn } from '../../utils/misc';
import { safeImageSrc } from '../../utils/links';

/** Image with lazy loading, validated src and a branded fallback when it fails. */
export function SafeImage({
  src,
  fallback = '/images/art/hero-battleground-sm.webp',
  alt,
  className,
  ...rest
}: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string | null | undefined; fallback?: string }) {
  const valid = safeImageSrc(src);
  const [failed, setFailed] = useState(false);
  const finalSrc = !valid || failed ? fallback : valid;
  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
      {...rest}
    />
  );
}

/**
 * Option 1 Neon Stage Light Tube
 * A sleek horizontal neon tube (hot pink #ec4899 to violet-purple #8b5cf6)
 * with tapered fading tips and a delicate, airy downward stage-light cone reflection.
 * Absorbs into existing section padding without taking up extra vertical space.
 * Fully responsive across iPhone (Safari), Android mobile, and desktop webview.
 */
export function NeonStageLight({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'neon-stage-light pointer-events-none select-none relative my-2 sm:my-3 flex flex-col items-center justify-center w-full',
        className,
      )}
      aria-hidden="true"
    >
      {/* Seamless 360° Omni-Directional Neon Reflection (Fades to 0% well before all 4 container edges — zero box corners) */}
      <div
        className="neon-light-wash absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-44 sm:h-60 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(ellipse 32% 42% at 37% 50%, rgba(236, 72, 153, 0.34) 0%, rgba(236, 72, 153, 0.14) 38%, rgba(236, 72, 153, 0.03) 62%, transparent 78%),
            radial-gradient(ellipse 38% 46% at 50% 50%, rgba(192, 132, 252, 0.24) 0%, rgba(168, 85, 247, 0.10) 42%, transparent 76%),
            radial-gradient(ellipse 32% 42% at 63% 50%, rgba(139, 92, 246, 0.32) 0%, rgba(139, 92, 246, 0.13) 38%, rgba(139, 92, 246, 0.03) 62%, transparent 78%)
          `,
          WebkitMaskImage: 'radial-gradient(ellipse 46% 46% at 50% 50%, #000 40%, transparent 92%)',
          maskImage: 'radial-gradient(ellipse 46% 46% at 50% 50%, #000 40%, transparent 92%)',
        }}
      />

      {/* Soft Close-Range All-Around Tube Bloom */}
      <div
        className="neon-light-halo absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] sm:w-[72%] max-w-3xl h-12 sm:h-16 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse 46% 46% at 50% 50%, rgba(236, 72, 153, 0.42) 0%, rgba(139, 92, 246, 0.22) 48%, transparent 90%)',
        }}
      />

      {/* Sleek Horizontal Neon Light Tube */}
      <div className="neon-light-tube relative h-[2.5px] sm:h-[3px] w-[82%] sm:w-[65%] max-w-3xl rounded-full bg-[linear-gradient(90deg,transparent_0%,#ec4899_18%,#c084fc_50%,#8b5cf6_82%,transparent_100%)] shadow-[0_0_10px_rgba(236,72,153,0.9),0_0_24px_rgba(236,72,153,0.55),0_0_44px_rgba(139,92,246,0.4)]">
        {/* Luminous inner core */}
        <div className="neon-light-core absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.95)_28%,rgba(255,255,255,0.95)_72%,transparent_100%)] opacity-90" />
      </div>
    </div>
  );
}

/** PUBG-HUD style section heading with themed eyebrow label and Option 1 neon stage light. */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  action,
  align = 'left',
  id,
  showNeonLight = true,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
  showNeonLight?: boolean;
}) {
  return (
    <div className="relative isolate w-full">
      {showNeonLight && <NeonStageLight />}
      <div
        className={cn(
          'relative z-10 mb-8 flex flex-col gap-4 sm:mb-10',
          align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        )}
      >
        <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
          <p className={cn('hud-label flex items-center gap-2', align === 'center' && 'justify-center')}>
            <Crosshair className="size-3.5" aria-hidden />
            {eyebrow}
          </p>
          <h2 id={id} className="mt-2.5 text-2xl font-bold leading-tight sm:text-4xl">
            {title} {highlight && <span className="text-gradient">{highlight}</span>}
          </h2>
          {/* Handcrafted natural organic ice line with delicate crystal drips */}
          <div className="winter-ice-accent" aria-hidden="true">
            <svg className="w-44 sm:w-60 h-2.5 overflow-visible" viewBox="0 0 240 10" fill="none">
              <path d="M0 2 Q30 0 60 2 Q90 0 120 3 Q150 1 180 2 Q210 0 240 2" stroke="url(#iceLineGrad)" strokeWidth="1.5" strokeLinecap="round" />
              <polygon points="30,2 33,8 36,2" fill="url(#iceDripGrad)" />
              <polygon points="90,2 93,10 96,2" fill="url(#iceDripGrad)" />
              <polygon points="160,2 163,8 166,2" fill="url(#iceDripGrad)" />
              <defs>
                <linearGradient id="iceLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="iceDripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.75" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {description && (
            <p
              className="mt-2 text-sm sm:text-base leading-relaxed !text-white font-medium"
              style={{ color: '#ffffff', opacity: 1 }}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/** Lightweight wrapper (zero mid-scroll JS animation overhead for 120 FPS scrolling). */
export function Reveal({ children, className }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={className}>{children}</div>;
}
