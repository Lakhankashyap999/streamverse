import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/misc';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('panel relative overflow-hidden', className)} {...rest}>
      {children}
    </div>
  );
}

type Tone = 'neutral' | 'live' | 'upcoming' | 'success' | 'warning' | 'danger' | 'sample' | 'accent' | 'gold';

const tones: Record<Tone, string> = {
  neutral: 'bg-white/8 text-mute border-white/10',
  live: 'bg-bad text-white border-bad',
  upcoming: 'bg-ultra/20 text-violet-200 border-ultra/40',
  success: 'bg-ok/15 text-green-300 border-ok/40',
  warning: 'bg-warn/15 text-amber-200 border-warn/40',
  danger: 'bg-bad/15 text-red-300 border-bad/40',
  sample: 'bg-amber-400/15 text-amber-200 border-amber-300/40 border-dashed',
  accent: 'bg-neon/20 text-fuchsia-200 border-neon/40',
  gold: 'bg-gold/15 text-gold border-gold/40',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-display text-[0.7rem] font-semibold uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Live badge never relies on colour alone — always includes the word LIVE + a dot. */
export function LiveBadge({ label = 'Live', className }: { label?: string; className?: string }) {
  return (
    <Badge tone="live" className={className}>
      <span className="size-1.5 rounded-full bg-white animate-pulse-dot" aria-hidden />
      {label}
    </Badge>
  );
}

export function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge tone="sample" className={className}>
      Sample
    </Badge>
  );
}
