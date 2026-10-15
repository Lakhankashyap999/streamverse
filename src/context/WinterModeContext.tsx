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
    if (isTransitioning) return; // Prevent spamming or glitching during transition

    const nextMode = !isWinterMode;

    if (nextMode) {
      // ── TURNING WINTER MODE ON: "Pehle Snowfall, Fir Dheere-Dheere Sab Kuch Jamna" ──
      setIsTransitioning(true);

      // Phase 1: Snowfall starts first peacefully (canvas mounts & fades in)
      setIsWinterMode(true);

      // Phase 2: After 1.8 seconds of pure snowfall, the cold freeze wave begins
      setTimeout(() => {
        setIsFreezing(true);
        document.documentElement.classList.add('winter-transitioning');
        document.documentElement.classList.add('winter-mode');
        try {
          localStorage.setItem('khushi-winter-mode', 'true');
        } catch {}
      }, 1800);

      // Phase 3: The freeze wave completes smoothly
      setTimeout(() => {
        setIsFreezing(false);
      }, 4800);

      // Phase 4: Cleanup transition class so browsing returns to pure 120 FPS
      setTimeout(() => {
        document.documentElement.classList.remove('winter-transitioning');
        setIsTransitioning(false);
      }, 5000);
    } else {
      // ── TURNING WINTER MODE OFF: Gentle Thaw ──
      setIsTransitioning(true);
      document.documentElement.classList.add('winter-transitioning');

      // Smoothly remove winter mode styles
      document.documentElement.classList.remove('winter-mode');
      try {
        localStorage.setItem('khushi-winter-mode', 'false');
      } catch {}

      setTimeout(() => {
        setIsWinterMode(false);
        document.documentElement.classList.remove('winter-transitioning');
        setIsTransitioning(false);
      }, 1500);
    }
  };

  return (
    <WinterModeContext.Provider value={{ isWinterMode, isTransitioning, isFreezing, toggleWinterMode }}>
      {children}
    </WinterModeContext.Provider>
  );
}

export const useWinterMode = () => useContext(WinterModeContext);
