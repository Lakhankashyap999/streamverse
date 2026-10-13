import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '../context/AuthContext';
import { ProfileProvider } from '../context/ProfileContext';
import { ToastProvider } from '../components/ui/Toast';
import { CursorSparks } from '../components/ui/CursorSparks';
import { PubgLoader } from '../components/ui/PubgLoader';
import { router } from './router';

export function App() {
  // Always show loader on page load and refresh as requested
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!showSplash) return;

    // Fallback safety timeout to ensure site displays smoothly
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [showSplash]);

  const handleComplete = () => {
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <ProfileProvider>
        <ToastProvider>
          <CursorSparks />
          <AnimatePresence mode="wait">
            {showSplash && (
              <motion.div
                key="splash"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.35, ease: 'easeOut' } }}
                className="fixed inset-0 z-[9999] bg-[#060814] w-screen h-[100dvh] overflow-hidden"
              >
                <PubgLoader fullscreen onComplete={handleComplete} />
              </motion.div>
            )}
          </AnimatePresence>
          <RouterProvider router={router} />
        </ToastProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
