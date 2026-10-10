import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { SITE } from '../../config/site';
import { NAV_ITEMS, Logo } from './Navbar';
import { SocialIconRow } from './SocialLinks';

export function Footer() {
  const { profile } = useProfile();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-line bg-surface/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#fbbf24,#f472b6,#8b5cf6,transparent)]" />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-mute">
            {profile.tagline} {profile.country ? `· ${profile.country}` : ''}. Home of the{' '}
            <span className="text-gradient font-semibold">{SITE.communityName}</span> ❤️
          </p>
          <SocialIconRow profile={profile} size="sm" />
        </div>
        <nav aria-label="Footer">
          <h2 className="hud-label mb-4">Navigate</h2>
          <ul className="grid grid-cols-2 gap-2 text-mute">
            {NAV_ITEMS.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="hud-label mb-4">Business</h2>
          <ul className="space-y-2 text-mute">
            <li>
              <Link to="/contact" className="inline-flex items-center gap-2 hover:text-ink">
                <Mail className="size-4" aria-hidden /> Contact & collaborations
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-ink">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-ink">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.gaming_name}. All rights reserved.
          </p>
          <p className="max-w-xl sm:text-right">{SITE.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
