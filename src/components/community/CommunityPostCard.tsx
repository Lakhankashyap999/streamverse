import { CalendarClock, Megaphone, Swords, Trophy } from 'lucide-react';
import type { CommunityPost } from '../../types';
import { formatDateTime } from '../../utils/date';
import { cn } from '../../utils/misc';
import { Badge, SampleBadge } from '../ui/Card';
import { ExternalButton } from '../ui/Button';

const kindMeta = {
  announcement: { label: 'Announcement', Icon: Megaphone, tone: 'accent' as const, ring: 'from-fuchsia-500/30' },
  challenge: { label: 'Challenge', Icon: Trophy, tone: 'gold' as const, ring: 'from-amber-400/30' },
  match: { label: 'Community match', Icon: Swords, tone: 'upcoming' as const, ring: 'from-violet-500/30' },
};

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  const meta = kindMeta[post.kind];
  const rules = post.rules?.split('\n').map((r) => r.trim()).filter(Boolean) ?? [];
  const statusLabel = post.status === 'open' ? 'Open' : post.status === 'upcoming' ? 'Coming soon' : 'Closed';
  return (
    <div className="winter-icicle-container h-full">
      <article className="panel relative flex h-full flex-col gap-4 overflow-hidden p-6">
      <div className={cn('pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-gradient-to-br to-transparent blur-2xl', meta.ring)} />
      <div className="relative flex flex-wrap items-center gap-2">
        <Badge tone={meta.tone} icon={<meta.Icon className="size-3" aria-hidden />}>
          {meta.label}
        </Badge>
        <Badge tone={post.status === 'open' ? 'success' : 'neutral'}>{statusLabel}</Badge>
        {post.is_sample && <SampleBadge />}
      </div>
      <h3 className="relative text-xl font-bold">{post.title}</h3>
      {post.body && <p className="relative text-mute">{post.body}</p>}
      {rules.length > 0 && (
        <div className="relative">
          <h4 className="hud-label mb-2">Rules</h4>
          <ul className="space-y-1.5 text-sm text-mute">
            {rules.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-gold" aria-hidden>
                  ▸
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
        {post.closes_at && (
          <p className="flex items-center gap-1.5 text-xs text-mute">
            <CalendarClock className="size-4" aria-hidden /> Closes {formatDateTime(post.closes_at)}
          </p>
        )}
        {post.kind === 'match' &&
          (post.registration_open && post.registration_url ? (
            <ExternalButton href={post.registration_url} size="sm">
              Register
            </ExternalButton>
          ) : (
            <p className="text-xs text-mute">Registration opens only when a match is officially announced.</p>
          ))}
      </div>
    </article>
    </div>
  );
}
