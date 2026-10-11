import { useMemo, useState } from 'react';
import { Vote, Trophy, Lightbulb, MessageSquareHeart } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAsync, usePageMeta } from '../hooks';
import { pollService } from '../services/pollService';
import { communityPostService } from '../services/contentServices';
import { suggestionService } from '../services/communityService';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { PollCard } from '../components/community/PollCard';
import { SuggestionForm } from '../components/community/SuggestionForm';
import { CommunityPostCard } from '../components/community/CommunityPostCard';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { SectionHeading } from '../components/ui/Display';
import { SITE } from '../config/site';

export function CommunityPage() {
  const { profile } = useProfile();
  usePageMeta('Community Hub', `Join the ${SITE.communityName} — vote in active polls, accept weekly game challenges, and submit your stream ideas.`);

  const { data: polls, loading: pollsLoading, error: pollsError, reload: reloadPolls } = useAsync(() => pollService.listPublic(), []);
  const { data: posts, loading: postsLoading, error: postsError, reload: reloadPosts } = useAsync(() => communityPostService.listPublic(), []);
  const { data: approvedSuggestions, loading: suggLoading } = useAsync(() => suggestionService.listPublic(), []);

  const [activeTab, setActiveTab] = useState<'all' | 'polls' | 'challenges' | 'suggestions'>('all');

  const pollList = polls ?? [];
  const postList = posts ?? [];
  const suggestionList = approvedSuggestions ?? [];

  const challenges = useMemo(() => postList.filter((p) => p.kind === 'challenge'), [postList]);
  const announcements = useMemo(() => postList.filter((p) => p.kind === 'announcement'), [postList]);
  const matches = useMemo(() => postList.filter((p) => p.kind === 'match'), [postList]);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Safe Zone Hub"
        title="Community"
        highlight="Family 🌸"
        description={`Your squad center. Vote on upcoming stream game modes, test your skills in challenges, and send suggestions directly to ${profile.gaming_name}.`}
      />

      <PageContainer className="py-12 space-y-16">
        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2 border-b border-line pb-4" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`clip-angle-sm px-5 py-2 font-display text-sm font-semibold transition ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black shadow-md shadow-pink-500/20'
                : 'bg-card text-slate-300 hover:text-white'
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'polls'}
            onClick={() => setActiveTab('polls')}
            className={`clip-angle-sm flex items-center gap-2 px-5 py-2 font-display text-sm font-semibold transition ${
              activeTab === 'polls'
                ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black shadow-md shadow-pink-500/20'
                : 'bg-card text-slate-300 hover:text-white'
            }`}
          >
            <Vote className="size-4" /> Polls ({pollList.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'challenges'}
            onClick={() => setActiveTab('challenges')}
            className={`clip-angle-sm flex items-center gap-2 px-5 py-2 font-display text-sm font-semibold transition ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black shadow-md shadow-pink-500/20'
                : 'bg-card text-slate-300 hover:text-white'
            }`}
          >
            <Trophy className="size-4" /> Challenges & Matches ({challenges.length + matches.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'suggestions'}
            onClick={() => setActiveTab('suggestions')}
            className={`clip-angle-sm flex items-center gap-2 px-5 py-2 font-display text-sm font-semibold transition ${
              activeTab === 'suggestions'
                ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black shadow-md shadow-pink-500/20'
                : 'bg-card text-slate-300 hover:text-white'
            }`}
          >
            <Lightbulb className="size-4" /> Fan Suggestions
          </button>
        </div>

        {/* 1. Polls Section */}
        {(activeTab === 'all' || activeTab === 'polls') && (
          <section aria-labelledby="community-polls-heading">
            <SectionHeading
              eyebrow="Viewer Choice"
              title="Interactive"
              highlight="Polls"
              id="community-polls-heading"
              description="Your vote influences future stream challenges, hot-drop decisions, and broadcast schedules."
            />
            {pollsLoading ? (
              <LoadingState count={2} label="Loading polls" />
            ) : pollsError ? (
              <ErrorState message={pollsError} onRetry={reloadPolls} />
            ) : pollList.length === 0 ? (
              <EmptyState
                icon={<Vote className="size-8 text-gold" />}
                title="No active polls right now"
                message="Check back during or after the next stream when new questions are posted."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {pollList.map((p) => (
                  <PollCard key={p.id} poll={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. Gaming Challenges & Events */}
        {(activeTab === 'all' || activeTab === 'challenges') && (
          <section aria-labelledby="community-challenges-heading">
            <SectionHeading
              eyebrow="Battleground Missions"
              title="Gaming"
              highlight="Challenges"
              id="community-challenges-heading"
              description="Take part in squad missions, record your clutch clips, and get shoutouts on stream."
            />
            {postsLoading ? (
              <LoadingState count={2} label="Loading challenges" />
            ) : postsError ? (
              <ErrorState message={postsError} onRetry={reloadPosts} />
            ) : challenges.length === 0 && matches.length === 0 && announcements.length === 0 ? (
              <EmptyState
                icon={<Trophy className="size-8 text-gold" />}
                title="No active challenges or tournaments"
                message="New challenges will be published here with rules and deadlines."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {announcements.map((p) => (
                  <CommunityPostCard key={p.id} post={p} />
                ))}
                {challenges.map((p) => (
                  <CommunityPostCard key={p.id} post={p} />
                ))}
                {matches.map((p) => (
                  <CommunityPostCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. Suggestions Section (Submit + Approved ideas) */}
        {(activeTab === 'all' || activeTab === 'suggestions') && (
          <section aria-labelledby="community-suggestions-heading">
            <SectionHeading
              eyebrow="Direct Line"
              title="Submit Your"
              highlight="Ideas"
              id="community-suggestions-heading"
              description="Got a crazy drop location or a fun squad dare? Send it in. Submissions are reviewed privately."
            />

            <div className="grid gap-10 lg:grid-cols-2">
              {/* Form */}
              <div className="panel p-6 sm:p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="size-5 text-gold" /> Have a Stream Idea?
                </h3>
                <SuggestionForm />
              </div>

              {/* Approved showcase */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquareHeart className="size-5 text-blush" /> Approved Community Ideas
                </h3>
                <p className="text-sm text-mute">
                  Ideas submitted by viewers and approved by the creator for upcoming gameplay sessions.
                </p>

                {suggLoading ? (
                  <LoadingState count={2} variant="row" />
                ) : suggestionList.length === 0 ? (
                  <div className="rounded-2xl border border-line bg-card/40 p-6 text-center text-mute text-sm">
                    No approved suggestions published yet. Be the first to submit a creative idea on the left!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestionList.map((s) => (
                      <div key={s.id} className="panel p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-mute">
                          <span className="font-display uppercase tracking-wider text-gold font-semibold">
                            {s.type.replace('_', ' ')}
                          </span>
                          <span>Suggested by {s.display_name || 'Anonymous Viewer'}</span>
                        </div>
                        <p className="text-ink text-sm leading-relaxed">{s.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </PageContainer>
    </div>
  );
}
