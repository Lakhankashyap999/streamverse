import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface WinterModeContextType {
  isWinterMode: boolean;
  toggleWinterMode: () => void;
}

const WinterModeContext = createContext<WinterModeContextType>({
  isWinterMode: false,
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
      try {
        localStorage.setItem('khushi-winter-mode', 'true');
      } catch {}
    } else {
      document.documentElement.classList.remove('winter-mode');
      try {
        localStorage.setItem('khushi-winter-mode', 'false');
      } catch {}
    }
  }, [isWinterMode]);

  const toggleWinterMode = () => setIsWinterMode((prev) => !prev);

  return (
    <WinterModeContext.Provider value={{ isWinterMode, toggleWinterMode }}>
      {children}
    </WinterModeContext.Provider>
  );
}

export const useWinterMode = () => useContext(WinterModeContext);
