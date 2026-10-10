import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Video,
  Radio,
  Sparkles,
  Vote,
  Lightbulb,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  FlaskConical,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { PubgLoader } from '../components/ui/PubgLoader';
import { SafeImage } from '../components/ui/Display';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/profile', label: 'Profile & Bio', icon: User },
  { to: '/dashboard/videos', label: 'Videos', icon: Video },
  { to: '/dashboard/streams', label: 'Livestreams', icon: Radio },
  { to: '/dashboard/highlights', label: 'Highlights', icon: Sparkles },
  { to: '/dashboard/polls', label: 'Polls', icon: Vote },
  { to: '/dashboard/suggestions', label: 'Fan Suggestions', icon: Lightbulb },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const { status, signOut, demo } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected route check
  if (status === 'loading') {
    return <PubgLoader fullscreen />;
  }

  if (status !== 'creator') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="panel p-8 max-w-md text-center space-y-4">
          <p className="text-bad font-semibold">Access Restricted</p>
          <p className="text-mute text-sm">Please sign in with creator credentials to access this command center.</p>
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="inline-block clip-angle-sm bg-neon px-6 py-2.5 font-display text-sm font-semibold text-white"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-base text-ink flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-line bg-surface/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-gradient-gold">{profile.gaming_name}</span>
          <span className="text-xs text-mute">Dashboard</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-mute hover:text-ink rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-0 z-50 bg-base flex flex-col' : 'hidden'
        } md:flex md:w-64 md:flex-col md:shrink-0 md:sticky md:top-0 md:h-screen border-r border-line bg-surface/80 p-5`}
      >
        {/* Creator Identity */}
        <div className="flex items-center justify-between pb-6 border-b border-line">
          <div className="flex items-center gap-3">
            <SafeImage
              src={profile.avatar_url}
              alt=""
              className="size-11 rounded-xl border border-blush/40"
            />
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm truncate">{profile.gaming_name}</h2>
              <p className="text-xs text-mute truncate">{profile.handle || 'Creator Admin'}</p>
            </div>
          </div>
          {mobileMenuOpen && (
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 text-mute">
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Demo status alert */}
        {demo && (
          <div className="mt-4 px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center gap-2 text-amber-200 text-xs">
            <FlaskConical className="size-4 shrink-0 text-amber-400" />
            <span>Demo Mode (Local Changes)</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-r from-neon/20 to-ultra/20 text-white border border-neon/30 font-semibold'
                      : 'text-mute hover:bg-white/5 hover:text-ink'
                  }`
                }
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="pt-4 border-t border-line space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-mute hover:bg-white/5 hover:text-ink transition"
          >
            <span>View Public Website</span>
            <ExternalLink className="size-3.5" />
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-red-300 hover:bg-bad/10 transition"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
