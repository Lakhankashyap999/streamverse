import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/misc';
import { Button } from './Button';

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-white/15 bg-card/40 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      {icon && <div className="relative grid size-14 place-items-center rounded-2xl bg-neon/10 text-blush">{icon}</div>}
      <h3 className="relative text-lg font-semibold">{title}</h3>
      {message && <p className="relative max-w-md text-mute">{message}</p>}
      {action && <div className="relative mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-3 rounded-2xl border border-bad/30 bg-bad/5 px-6 py-10 text-center', className)}
    >
      <AlertTriangle className="size-8 text-red-300" aria-hidden />
      <p className="max-w-md text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshCw className="size-4" aria-hidden />}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Skeleton grid that reserves layout space to avoid shifts. */
export function LoadingState({ count = 3, variant = 'card', label = 'Loading content' }: { count?: number; variant?: 'card' | 'row'; label?: string }) {
  return (
    <div role="status" aria-live="polite" className={variant === 'card' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
      <span className="sr-only">{label}…</span>
      {Array.from({ length: count }).map((_, i) =>
        variant === 'card' ? (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-card/60">
            <div className="skeleton aspect-video" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-4 w-4/5 rounded" />
              <div className="skeleton h-3 w-2/5 rounded" />
            </div>
          </div>
        ) : (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ),
      )}
    </div>
  );
}
