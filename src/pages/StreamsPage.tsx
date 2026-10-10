import { useMemo, useState } from 'react';
import { Calendar, History } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAsync, usePageMeta } from '../hooks';
import { streamService } from '../services/contentServices';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { LiveStreamCard, StreamCard } from '../components/streams/StreamCard';
import { VideoGrid } from '../components/videos/VideoGrid';
import { streamToMedia } from '../components/videos/mappers';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { isFuture } from '../utils/date';
import { SafeImage, SectionHeading } from '../components/ui/Display';

export function StreamsPage() {
  const { profile } = useProfile();
  usePageMeta('Livestreams', `Watch ${profile.gaming_name} live or browse scheduled drops and previous stream replays.`);

  const { data: streams, loading, error, reload } = useAsync(() => streamService.listPublic(), []);
  const [tab, setTab] = useState<'all' | 'upcoming' | 'past'>('all');

  const streamList = streams ?? [];

  const upcomingStreams = useMemo(
    () =>
      streamList
        .filter((s) => s.status === 'scheduled' && isFuture(s.scheduled_at))
        .sort((a, b) => ((a.scheduled_at ?? '') > (b.scheduled_at ?? '') ? 1 : -1)),
    [streamList],
  );

  const pastStreams = useMemo(
    () =>
      streamList
        .filter((s) => s.status === 'completed' || (s.status === 'scheduled' && !isFuture(s.scheduled_at)))
        .sort((a, b) => ((b.scheduled_at ?? '') > (a.scheduled_at ?? '') ? 1 : -1)),
    [streamList],
  );

  const pastMediaItems = useMemo(
    () => pastStreams.map((s) => streamToMedia(s, profile.youtube_url)),
    [pastStreams, profile.youtube_url],
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Broadcast Center"
        title="Gaming"
        highlight="Livestreams"
        description="Jump into marathon rank-push sessions, high-kill rush matches, and viewer custom rooms."
      />

      <PageContainer className="py-12 space-y-16">
        {/* Official YouTube Channel Banner Card */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
          <div className="relative aspect-[1024/166] w-full bg-surface">
            <SafeImage
              src={profile.banner_url}
              alt={`${profile.gaming_name} YouTube Channel Banner`}
              className="size-full object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 bg-[#101426]/95 backdrop-blur-md border-t border-line">
            <div className="flex items-center gap-3">
              <SafeImage
                src={profile.avatar_url}
                alt=""
                className="size-12 rounded-xl border-2 border-blush object-cover shadow-md"
              />
              <div>
                <h2 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  {profile.gaming_name}
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 font-semibold">
                    OFFICIAL YOUTUBE CHANNEL
                  </span>
                </h2>
                <p className="text-xs text-mute font-mono">
                  {profile.handle} · {profile.stats_snapshot?.subscribers ?? '27.6K'} Subscribers · 1.1K Videos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={profile.youtube_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="clip-angle-sm flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs uppercase tracking-wider px-5 py-2 transition shadow-lg shadow-red-600/30"
              >
                Subscribe on YouTube ➔
              </a>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState count={3} label="Loading streams" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            {/* Live Now / Featured Stream section */}
            <section aria-labelledby="live-now-heading">
              <SectionHeading
                eyebrow="Realtime Broadcast"
                title="Current"
                highlight="Status"
                id="live-now-heading"
                description="Status updates automatically based on verified broadcasts or creator alerts."
              />
              <LiveStreamCard streams={streamList} videos={[]} profile={profile} />
            </section>

            {/* Filter Navigation */}
            <div className="flex gap-2 border-b border-line pb-4" role="tablist" aria-label="Stream categories">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'all'}
                onClick={() => setTab('all')}
                className={`clip-angle-sm px-5 py-2 font-display text-sm font-semibold transition ${
                  tab === 'all'
                    ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-base'
                    : 'bg-card text-mute hover:text-ink'
                }`}
              >
                All Streams
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'upcoming'}
                onClick={() => setTab('upcoming')}
                className={`clip-angle-sm flex items-center gap-2 px-5 py-2 font-display text-sm font-semibold transition ${
                  tab === 'upcoming'
                    ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-base'
                    : 'bg-card text-mute hover:text-ink'
                }`}
              >
                <Calendar className="size-4" /> Upcoming ({upcomingStreams.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'past'}
                onClick={() => setTab('past')}
                className={`clip-angle-sm flex items-center gap-2 px-5 py-2 font-display text-sm font-semibold transition ${
                  tab === 'past'
                    ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-base'
                    : 'bg-card text-mute hover:text-ink'
                }`}
              >
                <History className="size-4" /> Previous Replays ({pastStreams.length})
              </button>
            </div>

            {/* Upcoming Streams */}
            {(tab === 'all' || tab === 'upcoming') && (
              <section aria-labelledby="upcoming-heading">
                <SectionHeading
                  eyebrow="Upcoming Drops"
                  title="Scheduled"
                  highlight="Streams"
                  id="upcoming-heading"
                  description="Mark your calendar. All dates are converted to your local time."
                />
                {upcomingStreams.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="size-6 text-gold" />}
                    title="No upcoming streams right now"
                    message="Check back soon! The creator posts new broadcast schedules regularly."
                  />
                ) : (
                  <div className="grid gap-6">
                    {upcomingStreams.map((s) => (
                      <StreamCard key={s.id} stream={s} profile={profile} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Previous Streams */}
            {(tab === 'all' || tab === 'past') && (
              <section aria-labelledby="past-heading">
                <SectionHeading
                  eyebrow="Match Archives"
                  title="Previous"
                  highlight="Streams"
                  id="past-heading"
                  description="Watch full multi-hour stream VODs and marathon sessions."
                />
                {pastMediaItems.length === 0 ? (
                  <EmptyState
                    icon={<History className="size-6 text-mute" />}
                    title="No recorded streams yet"
                    message="Past stream replays will be archived here."
                  />
                ) : (
                  <VideoGrid items={pastMediaItems} columns={3} />
                )}
              </section>
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}
