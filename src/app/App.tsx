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
  const [showSplash, setShowSplash] = useState(() => {
    // If the user already experienced the intro in this session, skip the delay
    return !sessionStorage.getItem('sv_intro_seen');
  });

  useEffect(() => {
    if (!showSplash) return;

    // Show the shooting soldier loader on entrance for 1.5 seconds on first visit
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('sv_intro_seen', '1');
    }, 1500);

    return () => clearTimeout(timer);
  }, [showSplash]);

  const handleComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('sv_intro_seen', '1');
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
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.35, ease: 'easeOut' } }}
                className="fixed inset-0 z-[999] bg-[#090b16]"
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
