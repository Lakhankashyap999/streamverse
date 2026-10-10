import { useEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FlaskConical, X } from 'lucide-react';
import { isDemoMode } from '../../services/supabaseClient';
import { SITE } from '../../config/site';
import { cn } from '../../utils/misc';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('container-x', className)}>{children}</div>;
}

/** Cinematic header used by inner pages. */
export function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  image = '/images/art/battleground-map.jpg',
  children,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-14 pt-32 sm:pb-20 sm:pt-40">
      {/* High-visibility tactical battleground map */}
      <img
        src={image}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover object-center opacity-80 sm:opacity-85 filter brightness-110 contrast-125 saturate-125"
      />
      {/* Smooth gradient blend ensuring tactical zones shine while fading softly to base at the bottom */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,22,0.30)_0%,rgba(9,11,22,0.50)_50%,#090b16_100%)]" />
      {/* Tactical radar glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_65%)]" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />

      <PageContainer className="relative">
        <p className="hud-label drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">◢ {eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] sm:text-6xl">
          {title} {highlight && <span className="font-script italic text-gradient drop-shadow-[0_2px_12px_rgba(236,72,153,0.3)]">{highlight}</span>}
        </h1>
        {description && <p className="mt-5 max-w-2xl text-lg font-medium text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </PageContainer>
    </section>
  );
}

function DemoNotice() {
  const [open, setOpen] = useState(() => sessionStorage.getItem('sv-demo-notice') !== 'hidden');
  if (!isDemoMode) return null;
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="glass fixed bottom-4 left-4 z-40 grid size-11 place-items-center rounded-full text-gold"
        aria-label="About this demo"
      >
        <FlaskConical className="size-5" />
      </button>
    );
  return (
    <aside
      className="glass fixed bottom-4 left-4 right-4 z-40 flex items-start gap-3 rounded-2xl p-4 text-sm shadow-2xl sm:right-auto sm:max-w-sm"
      aria-label="Demo notice"
    >
      <FlaskConical className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
      <p className="text-mute">
        <strong className="text-ink">Concept preview.</strong> Items marked <span className="text-amber-200">“Sample”</span> are
        placeholder content. {SITE.disclaimer}
      </p>
      <button
        onClick={() => {
          sessionStorage.setItem('sv-demo-notice', 'hidden');
          setOpen(false);
        }}
        className="-m-1 rounded-lg p-1 text-mute hover:text-ink"
        aria-label="Dismiss demo notice"
      >
        <X className="size-4" />
      </button>
    </aside>
  );
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function PublicLayout() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <DemoNotice />
    </>
  );
}
