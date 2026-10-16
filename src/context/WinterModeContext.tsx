import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface WinterModeContextType {
  isWinterMode: boolean;
  isTransitioning: boolean;
  isFreezing: boolean;
  toggleWinterMode: () => void;
}

const WinterModeContext = createContext<WinterModeContextType>({
  isWinterMode: false,
  isTransitioning: false,
  isFreezing: false,
  toggleWinterMode: () => {},
});

export function WinterModeProvider({ children }: { children: ReactNode }) {
  const [isWinterMode, setIsWinterMode] = useState(() => {
    try {
      return localStorage.getItem('khushi-winter-mode') === 'true';
    } catch {
      return false;
    }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);

  // Sync initial state on first mount without triggering transition animation
  useEffect(() => {
    if (isWinterMode) {
      document.documentElement.classList.add('winter-mode');
    } else {
      document.documentElement.classList.remove('winter-mode');
    }
  }, []);

  const toggleWinterMode = () => {
    if (isTransitioning) return;

    const nextMode = !isWinterMode;

    if (nextMode) {
      // ── TURNING WINTER MODE ON: Pehle Halka Snowfall, Fir Dheere-Dheere Sab Jamna ──
      setIsTransitioning(true);

      // Phase 1 (0s): Snowfall starts falling gently first
      setIsWinterMode(true);

      // Phase 2 (1.6s): After snowfall is falling, the smooth freeze wave begins
      setTimeout(() => {
        setIsFreezing(true);
        document.documentElement.classList.add('winter-transitioning');
        document.documentElement.classList.add('winter-mode');
        try {
          localStorage.setItem('khushi-winter-mode', 'true');
        } catch {}
      }, 1600);

      // Phase 3 (4.2s): Freeze wave finishes and transition classes are cleaned up for 120 FPS browsing
      setTimeout(() => {
        setIsFreezing(false);
        document.documentElement.classList.remove('winter-transitioning');
        setIsTransitioning(false);
      }, 4200);
    } else {
      // ── TURNING WINTER MODE OFF: Gentle Thaw ──
      setIsTransitioning(true);
      document.documentElement.classList.add('winter-transitioning');
      document.documentElement.classList.remove('winter-mode');
      try {
        localStorage.setItem('khushi-winter-mode', 'false');
      } catch {}

      setTimeout(() => {
        setIsWinterMode(false);
        document.documentElement.classList.remove('winter-transitioning');
        setIsTransitioning(false);
      }, 1400);
    }
  };

  return (
    <WinterModeContext.Provider value={{ isWinterMode, isTransitioning, isFreezing, toggleWinterMode }}>
      {children}
    </WinterModeContext.Provider>
  );
}

export const useWinterMode = () => useContext(WinterModeContext);
