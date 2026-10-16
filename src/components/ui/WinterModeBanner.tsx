import { Sparkles, Sun } from 'lucide-react';
import { useWinterMode } from '../../context/WinterModeContext';

export function WinterModeBanner() {
  const { isWinterMode, isTransitioning, isFreezing, toggleWinterMode } = useWinterMode();

  return (
    <div className="relative z-30 pt-[70px] sm:pt-[78px] pb-1 sm:pb-2 px-3 sm:px-4 max-w-7xl mx-auto flex items-center justify-center">
      <div className="flex items-center gap-2 flex-wrap justify-center w-full sm:w-auto">
        <button
          onClick={toggleWinterMode}
          disabled={isTransitioning}
          className={`group relative overflow-hidden w-full xs:w-auto max-w-full px-4 xs:px-5 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-gaming text-xs xs:text-sm sm:text-base font-black tracking-wide uppercase flex items-center justify-center gap-2 sm:gap-3 transition-transform duration-200 ${
            isTransitioning ? 'cursor-wait opacity-95' : 'cursor-pointer active:scale-95'
          } ${
            isWinterMode
              ? 'bg-gradient-to-r from-cyan-300 via-sky-200 to-cyan-400 text-slate-950 border-2 border-white shadow-[0_4px_18px_rgba(56,189,248,0.45)]'
              : 'bg-[#091528] hover:bg-[#0d203d] text-white border-2 border-cyan-400/90 shadow-[0_4px_18px_rgba(34,211,238,0.35)]'
          }`}
          aria-label="Toggle BGMI Vikendi Glacier Mode"
        >
          {isWinterMode ? (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Sun className={`size-4 sm:size-5 text-amber-500 shrink-0 ${isTransitioning ? 'animate-spin' : ''}`} />
              <span className="font-extrabold text-slate-950 text-xs xs:text-sm sm:text-base whitespace-nowrap">
                {isTransitioning ? (
                  <span>{isFreezing ? 'Freezing Website...' : 'Snowfall Starting...'}</span>
                ) : (
                  <>
                    <span className="sm:hidden">Normal Mode</span>
                    <span className="hidden sm:inline">Restore Normal Theme</span>
                  </>
                )}
              </span>
              <span className="text-[10px] xs:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-950 text-cyan-300 font-sans font-black border border-cyan-400/40 shrink-0">
                ❄️ Winter Active
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 justify-center">
              <span className="text-base xs:text-lg sm:text-xl shrink-0 select-none">❄️</span>
              <span className="text-white font-black tracking-wide text-center leading-tight">
                {isTransitioning ? (
                  <span>Restoring Theme...</span>
                ) : (
                  <>
                    <span className="sm:hidden">Winter Mode</span>
                    <span className="hidden sm:inline">Turn website into Winter Mode</span>
                  </>
                )}
              </span>
              {!isTransitioning && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-bold uppercase tracking-widest hidden md:inline-flex items-center gap-1 shrink-0">
                  <Sparkles className="size-3 text-cyan-300" />
                  Activate
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
