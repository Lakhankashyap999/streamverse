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

/** PUBG-HUD style section heading with themed eyebrow label. */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  action,
  align = 'left',
  id,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
}) {
  return (
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
        {description && <p className="mt-2 text-sm sm:text-base leading-relaxed text-white font-medium">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
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
