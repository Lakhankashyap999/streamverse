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
      // ── TURNING WINTER MODE ON: Cinematic Progressive Freeze Wave ──
      setIsTransitioning(true);
      setIsFreezing(true);

      // 1. Snowfall starts gently first (isWinterMode becomes true)
      setIsWinterMode(true);

      // 2. Add transition class so all element styles interpolate smoothly over 1.4s
      document.documentElement.classList.add('winter-transitioning');

      // 3. Trigger document-level freeze theme shortly after snowfall begins
      setTimeout(() => {
        document.documentElement.classList.add('winter-mode');
        try {
          localStorage.setItem('khushi-winter-mode', 'true');
        } catch {}
      }, 300);

      // 4. End the soft downward mist wave
      setTimeout(() => {
        setIsFreezing(false);
      }, 2500);

      // 5. Cleanup transition class for 120 FPS performance during normal browsing
      setTimeout(() => {
        document.documentElement.classList.remove('winter-transitioning');
        setIsTransitioning(false);
      }, 2800);
    } else {
      // ── TURNING WINTER MODE OFF: Gentle Thaw ──
      setIsTransitioning(true);
      document.documentElement.classList.add('winter-transitioning');

      // Smoothly remove winter mode
      document.documentElement.classList.remove('winter-mode');
      try {
        localStorage.setItem('khushi-winter-mode', 'false');
      } catch {}

      setTimeout(() => {
        setIsWinterMode(false);
        document.documentElement.classList.remove('winter-transitioning');
        setIsTransitioning(false);
      }, 1200);
    }
  };

  return (
    <WinterModeContext.Provider value={{ isWinterMode, isTransitioning, isFreezing, toggleWinterMode }}>
      {children}
    </WinterModeContext.Provider>
  );
}

export const useWinterMode = () => useContext(WinterModeContext);
