import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProfileProvider } from '../context/ProfileContext';
import { ToastProvider } from '../components/ui/Toast';
import { CursorSparks } from '../components/ui/CursorSparks';
import { PubgLoader } from '../components/ui/PubgLoader';
import { router } from './router';

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show the shooting soldier loader on entrance for 2.2 seconds so the user visibly experiences it
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <ProfileProvider>
        <ToastProvider>
          <CursorSparks />
          {showSplash && <PubgLoader fullscreen onComplete={() => setShowSplash(false)} />}
          <RouterProvider router={router} />
        </ToastProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
