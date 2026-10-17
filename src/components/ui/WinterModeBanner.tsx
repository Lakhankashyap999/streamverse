import { useEffect, useState } from 'react';
import { Sparkles, Sun, ThermometerSnowflake, Flame } from 'lucide-react';
import { useWinterMode } from '../../context/WinterModeContext';

const NORMAL_TEMP = 32;
const FREEZING_POINT = 0;
const SUBZERO_TEMP = -38;

export function WinterModeBanner() {
  const { isWinterMode, isTransitioning, isFreezing, toggleWinterMode } = useWinterMode();
  const [tempC, setTempC] = useState<number>(() => (isWinterMode ? SUBZERO_TEMP : NORMAL_TEMP));

  useEffect(() => {
    // When idle (not transitioning), snap cleanly to target temperature
    if (!isTransitioning) {
      setTempC(isWinterMode ? SUBZERO_TEMP : NORMAL_TEMP);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    if (isWinterMode && !isFreezing) {
      // Phase 1 (0ms -> 1600ms): Snowfall starts -> Temp drops from +32°C to 0°C
      const duration = 1600;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease-out curve toward 0°C
        const eased = 1 - Math.pow(1 - progress, 2);
        const current = Math.round(NORMAL_TEMP + (FREEZING_POINT - NORMAL_TEMP) * eased);
        setTempC(current);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
    } else if (isWinterMode && isFreezing) {
      // Phase 2 (1600ms -> 4200ms = 2600ms): Freeze wave -> Temp plunges from 0°C to -38°C
      const duration = 2600;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 2.2);
        const current = Math.round(FREEZING_POINT + (SUBZERO_TEMP - FREEZING_POINT) * eased);
        setTempC(current);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
    } else {
      // Turning Winter Mode OFF (0ms -> 1400ms): Thaw from -38°C back to +32°C
      const duration = 1400;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 2);
        const current = Math.round(SUBZERO_TEMP + (NORMAL_TEMP - SUBZERO_TEMP) * eased);
        setTempC(current);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isWinterMode, isTransitioning, isFreezing]);

  // Normalized freeze percentage (0% at +32°C -> 100% at -38°C)
  const freezePercent = Math.min(
    100,
    Math.max(0, Math.round(((NORMAL_TEMP - tempC) / (NORMAL_TEMP - SUBZERO_TEMP)) * 100))
  );

  const formattedTemp = `${tempC > 0 ? `+${tempC}` : tempC}°C`;
  const isSubzero = tempC <= 0;

  return (
    <div className="relative z-30 pt-[70px] sm:pt-[78px] pb-1 sm:pb-2 px-3 sm:px-4 max-w-7xl mx-auto flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto">
        <button
          onClick={toggleWinterMode}
          disabled={isTransitioning}
          className={`group relative overflow-hidden w-full xs:w-auto max-w-full px-3.5 xs:px-5 sm:px-7 py-2.5 xs:py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-gaming text-xs xs:text-sm sm:text-base font-black tracking-wide uppercase flex items-center justify-center gap-2 sm:gap-3 transition-transform duration-200 ${
            isTransitioning ? 'cursor-wait opacity-95' : 'cursor-pointer active:scale-95'
          } ${
            isWinterMode
              ? 'bg-gradient-to-r from-cyan-300 via-sky-200 to-cyan-400 text-slate-950 border-2 border-white shadow-[0_4px_18px_rgba(56,189,248,0.45)]'
              : 'bg-[#091528] hover:bg-[#0d203d] text-white border-2 border-cyan-400/90 shadow-[0_4px_18px_rgba(34,211,238,0.35)]'
          }`}
          aria-label="Toggle BGMI Vikendi Glacier Mode"
        >
          {isWinterMode ? (
            <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap justify-center">
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

              {/* Live Subzero Temperature Badge inside Button */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] xs:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-sans font-black border shrink-0 tabular-nums transition-colors ${
                  isSubzero
                    ? 'bg-slate-950 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                    : 'bg-slate-900 text-amber-300 border-amber-400/50'
                }`}
              >
                <ThermometerSnowflake className="size-3 text-cyan-300 shrink-0" />
                <span>{formattedTemp}</span>
                <span className="hidden md:inline text-[9px] tracking-wider text-cyan-200/90 uppercase ml-0.5">
                  {tempC <= -30 ? 'SUBZERO' : tempC <= 0 ? 'FREEZING' : 'CHILLING'}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap justify-center">
              <span className="text-base xs:text-lg sm:text-xl shrink-0 select-none">❄️</span>
              <span className="text-white font-black tracking-wide text-center leading-tight whitespace-nowrap">
                {isTransitioning ? (
                  <span>Thawing Ice...</span>
                ) : (
                  <>
                    <span className="sm:hidden">Winter Mode</span>
                    <span className="hidden sm:inline">Turn website into Winter Mode</span>
                  </>
                )}
              </span>

              {/* Live Warm/Thawing Temperature Badge inside Button */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] xs:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-sans font-black border shrink-0 tabular-nums transition-colors ${
                  isSubzero
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400/50'
                    : 'bg-amber-500/15 text-amber-300 border-amber-400/45'
                }`}
              >
                {isSubzero ? (
                  <ThermometerSnowflake className="size-3 text-cyan-300 shrink-0" />
                ) : (
                  <Flame className="size-3 text-amber-400 shrink-0" />
                )}
                <span>{formattedTemp}</span>
              </span>

              {!isTransitioning && (
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-bold uppercase tracking-widest hidden md:inline-flex items-center gap-1 shrink-0">
                  <Sparkles className="size-3 text-cyan-300" />
                  Activate
                </span>
              )}
            </div>
          )}

          {/* Bottom Inner Mercury Freeze Line inside Button */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-black/25 overflow-hidden">
            <div
              className="h-full transition-all duration-75"
              style={{
                width: `${freezePercent}%`,
                background: isWinterMode
                  ? 'linear-gradient(90deg, #f59e0b 0%, #38bdf8 45%, #ffffff 100%)'
                  : 'linear-gradient(90deg, #38bdf8 0%, #f59e0b 100%)',
              }}
            />
          </div>
        </button>

        {/* Live Transition Telemetry Strip (Appears smoothly while temperature is actively dropping/rising) */}
        {isTransitioning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-400/40 shadow-[0_4px_16px_rgba(2,132,199,0.3)] text-[10px] sm:text-xs font-bold tracking-wider uppercase text-cyan-200 animate-fade-in">
            <span className="text-amber-300 tabular-nums">+32°C</span>
            <div className="w-16 sm:w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-cyan-200"
                style={{ width: `${freezePercent}%` }}
              />
            </div>
            <span className="text-cyan-300 font-black tabular-nums">{formattedTemp}</span>
            <span className="hidden xs:inline text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/30 text-white">
              {tempC > 0 ? 'SNOWING' : tempC > -30 ? 'FREEZING' : 'FROZEN ❄️'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
