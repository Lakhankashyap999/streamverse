import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { friendlyError } from '../utils/misc';

export function LoginPage() {
  const { profile } = useProfile();
  const { status, signIn, demo, enterDemo, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  usePageMeta('Creator Sign In');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(sessionExpired ? 'Your session expired. Please sign in again.' : '');

  // If already signed in as creator, navigate directly to dashboard
  if (status === 'creator') {
    const from = (location.state as { from?: string })?.from || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(friendlyError(err, 'Sign in failed. Check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    enterDemo();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-20 relative">
      <div className="panel p-6 sm:p-10 max-w-md w-full space-y-6 relative">
        <div className="text-center space-y-2">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-base mx-auto shadow-lg">
            <Lock className="size-6 text-white" />
          </span>
          <p className="hud-label">Command Center</p>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Creator Sign In</h1>
          <p className="text-sm text-mute">
            Restricted access for <strong>{profile.gaming_name}</strong> to manage streams, videos, and polls.
          </p>
        </div>

        {demo ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-200 font-display font-semibold text-sm">
              <FlaskConical className="size-4" /> Local Demonstration Mode
            </div>
            <p className="text-xs text-mute leading-relaxed">
              Supabase credentials are not connected in this preview environment. You can explore the full creator dashboard using local demo data storage.
            </p>
            <Button
              variant="gold"
              className="w-full"
              size="md"
              onClick={handleDemoAccess}
              iconRight={<ArrowRight className="size-4" />}
            >
              Enter Demo Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <Input
              label="Creator Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="creator@channel.com"
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <p role="alert" className="text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ShieldCheck className="size-5" />}
            >
              Sign In to Dashboard
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-line text-center">
          <Link to="/" className="text-xs text-mute hover:text-ink transition">
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
