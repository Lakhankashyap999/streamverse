import { ShieldAlert, Home, Radio } from 'lucide-react';
import { usePageMeta } from '../hooks';
import { ButtonLink } from '../components/ui/Button';

export function NotFoundPage() {
  usePageMeta('404 · Outside the Safe Zone');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-20 relative">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" aria-hidden />

      {/* Decorative blue-zone circle */}
      <div className="size-64 rounded-full border-2 border-dashed border-ultra/40 animate-[zone-spin_40s_linear_infinite] absolute -z-10" />

      <div className="panel p-8 sm:p-12 max-w-lg space-y-6 relative">
        <span className="grid size-16 place-items-center rounded-2xl bg-bad/15 text-bad mx-auto border border-bad/30">
          <ShieldAlert className="size-8" />
        </span>

        <div>
          <p className="hud-label text-bad">Blue Zone Warning</p>
          <h1 className="text-4xl sm:text-5xl font-bold mt-2 font-display">
            404 <span className="text-gradient">Lost in the Blue</span>
          </h1>
          <p className="text-mute mt-3 text-base">
            You've strayed outside the safe zone! The drop coordinate you're searching for does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <ButtonLink to="/" size="md" icon={<Home className="size-4" />}>
            Return to Safe Zone
          </ButtonLink>
          <ButtonLink to="/streams" variant="secondary" size="md" icon={<Radio className="size-4" />}>
            Check Streams
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
