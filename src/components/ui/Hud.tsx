import { cn } from '../../utils/misc';

/** Decorative PUBG-style compass bar. */
export function CompassStrip({ className }: { className?: string }) {
  const marks = ['NW', '315', '330', 'N', '15', '30', 'NE', '60', '75', 'E', '105', '120', 'SE'];
  return (
    <div className={cn('pointer-events-none select-none', className)} aria-hidden>
      <div className="relative mx-auto flex max-w-md items-end justify-between border-b border-white/15 px-2 pb-1 font-display text-[0.65rem] tracking-widest text-white/45">
        {marks.map((m) => (
          <span key={m} className={cn('flex flex-col items-center gap-1', m === 'N' && 'text-gold')}>
            {m}
            <span className={cn('w-px bg-current', m.length <= 2 && Number.isNaN(Number(m)) ? 'h-2.5' : 'h-1.5')} />
          </span>
        ))}
        <span className="absolute -bottom-2 left-1/2 size-0 -translate-x-1/2 border-x-4 border-t-[6px] border-x-transparent border-t-gold" />
      </div>
    </div>
  );
}

/** Colourful scrolling ticker between sections. */
export function Ticker({ items }: { items: string[] }) {
  const colours = ['text-gradient-gold', 'text-gradient', 'text-gradient-zone'];
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-6 sm:gap-10 pr-6 sm:pr-10 py-1" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className="flex items-center gap-6 sm:gap-10 font-display text-sm sm:text-2xl font-bold uppercase tracking-wider whitespace-nowrap">
          <span className={colours[i % colours.length]}>{t}</span>
          <span className="text-gold/60 select-none" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/70 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base to-transparent" />
      <div className="flex w-max animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/** Safe-zone ring decoration. */
export function ZoneRing({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute rounded-full border-2 border-dashed border-ultra/30', className)} aria-hidden>
      <div className="absolute inset-6 rounded-full border border-blush/20" />
    </div>
  );
}
