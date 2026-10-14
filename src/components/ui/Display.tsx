import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
        'pointer-events-none select-none relative -mt-3 mb-5 sm:-mt-5 sm:mb-7 flex flex-col items-center justify-center w-full overflow-hidden',
        className,
      )}
      aria-hidden="true"
    >
      {/* Delicate Downward Stage Light Wash (Soft, airy, low-opacity ambient cone) */}
      <div className="absolute -top-5 h-36 sm:h-48 w-full max-w-4xl bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(236,72,153,0.11),rgba(139,92,246,0.05)_45%,transparent_75%)] blur-2xl" />

      {/* Sleek horizontal neon light tube */}
      <div className="relative h-[2px] sm:h-[2.5px] w-[80%] sm:w-[65%] max-w-3xl rounded-full bg-[linear-gradient(90deg,transparent_0%,#ec4899_20%,#8b5cf6_80%,transparent_100%)]">
        {/* Luminous inner core */}
        <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.85)_30%,rgba(255,255,255,0.85)_70%,transparent_100%)] opacity-70" />
        {/* Soft primary neon aura */}
        <div className="absolute -inset-y-0.5 inset-x-2 rounded-full bg-[linear-gradient(90deg,transparent_0%,#ec4899_20%,#8b5cf6_80%,transparent_100%)] blur-[2px] opacity-80" />
        {/* Ambient halo glow */}
        <div className="absolute -inset-y-2 inset-x-6 rounded-full bg-[linear-gradient(90deg,transparent_0%,#ec4899_25%,#8b5cf6_75%,transparent_100%)] blur-[6px] opacity-45" />
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
    <div className="relative w-full">
      {showNeonLight && <NeonStageLight />}
      <div
        className={cn(
          'mb-8 flex flex-col gap-4 sm:mb-10',
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

/** Fade-up reveal on scroll; disabled for reduced motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
