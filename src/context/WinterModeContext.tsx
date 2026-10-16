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

  useEffect(() => {
    if (isWinterMode) {
      document.documentElement.classList.add('winter-mode');
    } else {
      document.documentElement.classList.remove('winter-mode');
    }
  }, [isWinterMode]);

  const toggleWinterMode = () => {
    setIsWinterMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('winter-mode');
      } else {
        document.documentElement.classList.remove('winter-mode');
      }
      try {
        localStorage.setItem('khushi-winter-mode', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <WinterModeContext.Provider
      value={{
        isWinterMode,
        isTransitioning: false,
        isFreezing: false,
        toggleWinterMode,
      }}
    >
      {children}
    </WinterModeContext.Provider>
  );
}

export const useWinterMode = () => useContext(WinterModeContext);
