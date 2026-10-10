import { Link } from 'react-router-dom';
import {
  Video,
  Radio,
  Sparkles,
  Vote,
  Plus,
  User,
  ArrowRight,
  Lightbulb,
  Mail,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAsync, usePageMeta } from '../hooks';
import { videoService, streamService, highlightService } from '../services/contentServices';
import { pollService } from '../services/pollService';
import { suggestionService, contactService } from '../services/communityService';
import { isFuture } from '../utils/date';
import { LoadingState } from '../components/ui/States';
import { ButtonLink } from '../components/ui/Button';

export function DashboardOverview() {
  const { profile } = useProfile();
  usePageMeta('Dashboard Overview');

  const { data: videos, loading: vL } = useAsync(() => videoService.listAll(), []);
  const { data: streams, loading: sL } = useAsync(() => streamService.listAll(), []);
  const { data: highlights, loading: hL } = useAsync(() => highlightService.listAll(), []);
  const { data: polls, loading: pL } = useAsync(() => pollService.listAll(), []);
  const { data: suggestions } = useAsync(() => suggestionService.listAll(), []);
  const { data: messages } = useAsync(() => contactService.listAll(), []);

  const videoCount = videos?.filter((v) => v.is_published).length ?? 0;
  const upcomingCount = streams?.filter((s) => s.status === 'scheduled' && isFuture(s.scheduled_at)).length ?? 0;
  const highlightCount = highlights?.filter((h) => h.is_published).length ?? 0;
  const activePollCount = polls?.filter((p) => p.status === 'active').length ?? 0;

  const pendingSuggestions = suggestions?.filter((s) => s.status === 'pending').length ?? 0;
  const unreadMessages = messages?.filter((m) => m.status === 'new').length ?? 0;

  const loading = vL || sL || hL || pL;

  return (
    <div className="space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <p className="hud-label">Command Deck</p>
          <h1 className="text-3xl font-bold font-display mt-1">
            Welcome back, <span className="text-gradient-gold">{profile.gaming_name}</span>
          </h1>
          <p className="text-sm text-mute mt-1">
            Here's what is currently active on your website. (Website records count, not YouTube views)
          </p>
        </div>

        <ButtonLink to="/dashboard/profile" variant="secondary" size="sm" icon={<User className="size-4" />}>
          Edit Profile & Bio
        </ButtonLink>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <LoadingState count={4} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel p-5 space-y-3">
            <div className="flex items-center justify-between text-mute">
              <span className="text-xs font-semibold uppercase tracking-wider">Published Videos</span>
              <Video className="size-5 text-blush" />
            </div>
            <p className="text-3xl font-bold font-display text-ink">{videoCount}</p>
            <p className="text-xs text-mute">Active on videos gallery</p>
          </div>

          <div className="panel p-5 space-y-3">
            <div className="flex items-center justify-between text-mute">
              <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Streams</span>
              <Radio className="size-5 text-gold" />
            </div>
            <p className="text-3xl font-bold font-display text-ink">{upcomingCount}</p>
            <p className="text-xs text-mute">Scheduled on timeline</p>
          </div>

          <div className="panel p-5 space-y-3">
            <div className="flex items-center justify-between text-mute">
              <span className="text-xs font-semibold uppercase tracking-wider">Highlights</span>
              <Sparkles className="size-5 text-ultra" />
            </div>
            <p className="text-3xl font-bold font-display text-ink">{highlightCount}</p>
            <p className="text-xs text-mute">Clips published</p>
          </div>

          <div className="panel p-5 space-y-3">
            <div className="flex items-center justify-between text-mute">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Polls</span>
              <Vote className="size-5 text-ok" />
            </div>
            <p className="text-3xl font-bold font-display text-ink">{activePollCount}</p>
            <p className="text-xs text-mute">Currently accepting votes</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display">Quick Management Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard/videos"
            className="panel p-5 flex items-center justify-between group hover:border-blush/50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-neon/15 text-blush">
                <Plus className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-sm group-hover:text-white">Add Video</p>
                <p className="text-xs text-mute">Post YouTube link</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-mute group-hover:text-ink group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/dashboard/streams"
            className="panel p-5 flex items-center justify-between group hover:border-gold/50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-gold/15 text-gold">
                <Plus className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-sm group-hover:text-white">Schedule Stream</p>
                <p className="text-xs text-mute">Set time & title</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-mute group-hover:text-ink group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/dashboard/highlights"
            className="panel p-5 flex items-center justify-between group hover:border-ultra/50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-ultra/15 text-ultra">
                <Plus className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-sm group-hover:text-white">Add Highlight</p>
                <p className="text-xs text-mute">Clutch clip</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-mute group-hover:text-ink group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/dashboard/polls"
            className="panel p-5 flex items-center justify-between group hover:border-ok/50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-ok/15 text-green-300">
                <Plus className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-sm group-hover:text-white">Create Poll</p>
                <p className="text-xs text-mute">Ask the community</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-mute group-hover:text-ink group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>

      {/* Moderation & Inquiries Notices */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Lightbulb className="size-5 text-gold" /> Fan Suggestions Moderation
            </h3>
            {pendingSuggestions > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
                {pendingSuggestions} Pending
              </span>
            ) : (
              <span className="text-xs text-mute">Up to date</span>
            )}
          </div>
          <p className="text-sm text-mute leading-relaxed">
            Viewers have submitted stream challenges and ideas. Review and approve before they appear on the public Community hub.
          </p>
          <ButtonLink to="/dashboard/suggestions" variant="secondary" size="sm">
            Review Suggestions
          </ButtonLink>
        </div>

        <div className="panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Mail className="size-5 text-blush" /> Business Contact Inquiries
            </h3>
            {unreadMessages > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-neon/20 text-fuchsia-300 text-xs font-semibold">
                {unreadMessages} New
              </span>
            ) : (
              <span className="text-xs text-mute">No unread inquiries</span>
            )}
          </div>
          <p className="text-sm text-mute leading-relaxed">
            Sponsorship requests and brand collaboration messages submitted through the official business contact form.
          </p>
          <ButtonLink to="/dashboard/settings" variant="secondary" size="sm">
            Check Messages & Settings
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
