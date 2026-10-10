import type { ComponentType, SVGProps } from 'react';
import { Crown } from 'lucide-react';
import type { Profile } from '../../types';
import { safeExternalUrl, SOCIAL_HOSTS } from '../../utils/links';
import { cn } from '../../utils/misc';
import { DiscordIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from '../ui/BrandIcons';

export interface SocialLink {
  key: string;
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  colour: string;
  blurb: string;
}

/** Only returns links that exist and pass host validation — never invents accounts. */
export function getSocialLinks(p: Profile): SocialLink[] {
  const list: (SocialLink | null)[] = [
    mk('youtube', 'YouTube', p.youtube_url, SOCIAL_HOSTS.youtube, YouTubeIcon, 'from-red-500 to-rose-600', 'Livestreams & full videos'),
    mk('instagram', 'Instagram', p.instagram_url, SOCIAL_HOSTS.instagram, InstagramIcon, 'from-amber-400 via-pink-500 to-purple-600', 'Reels & behind the scenes'),
    mk('discord', 'Discord', p.discord_url, SOCIAL_HOSTS.discord, DiscordIcon, 'from-indigo-500 to-violet-600', 'Chat with the squad'),
    mk('whatsapp', 'WhatsApp', p.whatsapp_url, SOCIAL_HOSTS.whatsapp, WhatsAppIcon, 'from-green-500 to-emerald-600', 'Channel updates'),
    mk('membership', 'Membership', p.membership_url, SOCIAL_HOSTS.youtube, Crown as SocialLink['Icon'], 'from-yellow-400 to-orange-500', 'Join the channel & get perks'),
  ];
  return list.filter((x): x is SocialLink => x !== null);
}

function mk(
  key: string,
  label: string,
  url: string | null,
  hosts: readonly string[],
  Icon: SocialLink['Icon'],
  colour: string,
  blurb: string,
): SocialLink | null {
  const href = safeExternalUrl(url, [...hosts]);
  return href ? { key, label, href, Icon, colour, blurb } : null;
}

export function SocialIconRow({ profile, className, size = 'md' }: { profile: Profile; className?: string; size?: 'sm' | 'md' }) {
  const links = getSocialLinks(profile).filter((l) => l.key !== 'membership');
  if (!links.length) return null;
  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5', className)} aria-label="Official social profiles">
      {links.map(({ key, label, href, Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            className={cn(
              'glass grid place-items-center rounded-xl text-mute transition hover:-translate-y-0.5 hover:border-blush/50 hover:text-ink',
              size === 'sm' ? 'size-10' : 'size-11',
            )}
          >
            <Icon className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
