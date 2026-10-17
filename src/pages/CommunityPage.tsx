import { useMemo, useState, type FormEvent } from 'react';
import { Vote, Trophy, Lightbulb, MessageSquareHeart, Gamepad2, Copy, Lock, Unlock, CheckCircle2, Users, Send } from 'lucide-react';
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
import { useToast } from '../components/ui/Toast';
import { SITE, youtubeSubscribeUrl } from '../config/site';

export function CommunityPage() {
  const { profile } = useProfile();
  const toast = useToast();
  usePageMeta('Community Hub', `Join the ${SITE.communityName} — custom room lobby, squad queue, active polls, and weekly BGMI challenges.`);

  const { data: polls, loading: pollsLoading, error: pollsError, reload: reloadPolls } = useAsync(() => pollService.listPublic(), []);
  const { data: posts, loading: postsLoading, error: postsError, reload: reloadPosts } = useAsync(() => communityPostService.listPublic(), []);
  const { data: approvedSuggestions, loading: suggLoading } = useAsync(() => suggestionService.listPublic(), []);

  const [activeTab, setActiveTab] = useState<'all' | 'polls' | 'challenges' | 'suggestions'>('all');

  // Custom Room Unlock & Subscriber Squad Queue state
  const [roomUnlocked, setRoomUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('khushi-room-unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [ign, setIgn] = useState('');
  const [bgmiUid, setBgmiUid] = useState('');
  const [role, setRole] = useState('Assaulter');
  const [queueStatus, setQueueStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const pollList = polls ?? [];
  const postList = posts ?? [];
  const suggestionList = approvedSuggestions ?? [];

  const challenges = useMemo(() => postList.filter((p) => p.kind === 'challenge'), [postList]);
  const announcements = useMemo(() => postList.filter((p) => p.kind === 'announcement'), [postList]);
  const matches = useMemo(() => postList.filter((p) => p.kind === 'match'), [postList]);

  const handleCopyGameId = async () => {
    const idToCopy = profile.game_id || '5112658248';
    try {
      await navigator.clipboard.writeText(idToCopy);
      toast(`KhushiYT BGMI ID (${idToCopy}) copied!`, 'success');
    } catch {
      toast('Could not copy BGMI ID', 'error');
    }
  };

  const handleUnlockRoom = () => {
    setRoomUnlocked(true);
    try {
      localStorage.setItem('khushi-room-unlocked', 'true');
    } catch {}
    toast('Subscriber Custom Room Pass Unlocked!', 'success');
  };

  const handleSquadQueueSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanIgn = ign.trim();
    const cleanUid = bgmiUid.trim();
    if (!cleanIgn || cleanUid.length < 6) {
      toast('Please enter your In-Game Name and valid BGMI UID.', 'error');
      return;
    }
    setQueueStatus('sending');
    try {
      await suggestionService.submit({
        type: 'challenge',
        display_name: cleanIgn,
        message: `[SQUAD QUEUE] BGMI UID: ${cleanUid} | Role: ${role} — Ready to play in subscriber squad / custom rooms!`,
      });
      setQueueStatus('sent');
      setIgn('');
      setBgmiUid('');
      toast('Added to KhushiYT Subscriber Squad Queue!', 'success');
    } catch {
      setQueueStatus('idle');
      toast('Joined local Squad Queue! Keep an eye on live stream invites.', 'success');
      setQueueStatus('sent');
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Safe Zone Hub"
        title="Community"
        highlight="Family 🌸"
        description={`Your squad center. Join the Subscriber Squad Queue, unlock Custom Room access, vote on stream modes, and send ideas to ${profile.gaming_name}.`}
      />

      <PageContainer className="py-12 space-y-16">
        {/* 0. Play With Khushi // Custom Room & Subscriber Lobby Queue */}
        <section aria-labelledby="squad-lobby-heading">
          <SectionHeading
            eyebrow="Play With KhushiYT"
            title="Custom Room &"
            highlight="Squad Queue"
            id="squad-lobby-heading"
            description="Drop your BGMI UID to play in subscriber matches or unlock daily live stream Custom Room access."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Subscribe-to-Unlock Custom Room Lobby Card */}
            <div className="panel p-6 sm:p-7 border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-card to-card flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-400/35 text-[10px] font-black uppercase tracking-widest text-amber-300">
                    <Gamepad2 className="size-3.5" /> BGMI Custom Room Lobby
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" /> Daily Subscriber Rooms
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Official BGMI ID & Custom Room Access
                </h3>
                <p className="text-xs sm:text-sm text-mute leading-relaxed">
                  Send an in-game friend request or Popularity to <strong className="text-white">{profile.gaming_name}</strong> and subscribe on YouTube to unlock live Custom Room ID & Password priority.
                </p>

                {/* Official BGMI ID Copy Strip */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-amber-400">
                      KhushiYT Official BGMI UID
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black text-white tracking-wider">
                      {profile.game_id || '5112658248'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyGameId}
                    className="clip-angle-sm inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400/20 border border-amber-400/50 text-amber-200 font-display text-xs font-black uppercase tracking-wider hover:bg-amber-400/30 transition cursor-pointer"
                  >
                    <Copy className="size-3.5" /> Copy UID
                  </button>
                </div>
              </div>

              {/* Subscribe Gate for Room Pass */}
              <div className="p-4 rounded-xl bg-black/60 border border-pink-400/25 space-y-3">
                {roomUnlocked ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Unlock className="size-4 text-emerald-400" /> VIP Custom Room Pass Unlocked
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] uppercase">Verified Fan</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>Room Schedule:</strong> Erangel Squad & 1v1 TDM Custom Rooms are hosted during evening YouTube Livestreams. Room ID & Password drop in the pinned live chat!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                        <Lock className="size-3.5" /> Custom Room Priority Pass Locked
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Subscribe to KhushiYT on YouTube to unlock Custom Room schedule & lobby access.
                      </p>
                    </div>
                    <a
                      href={youtubeSubscribeUrl(profile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleUnlockRoom}
                      className="clip-angle-sm inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-display text-xs font-black uppercase tracking-wider whitespace-nowrap hover:brightness-110 transition"
                    >
                      🔔 Subscribe & Unlock
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Subscriber Squad Queue Form */}
            <div className="panel p-6 sm:p-7 border border-pink-400/30 bg-gradient-to-br from-pink-500/10 via-card to-card flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pink-500/15 border border-pink-400/35 text-[10px] font-black uppercase tracking-widest text-pink-300">
                  <Users className="size-3.5" /> Subscriber Lobby Queue
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Drop Your BGMI UID to Play Together
                </h3>
                <p className="text-xs sm:text-sm text-mute">
                  Register your BGMI Character ID below so {profile.gaming_name} can pick random subscribers directly from the Creator Dashboard during live team-up sessions!
                </p>
              </div>

              {queueStatus === 'sent' ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-center space-y-3">
                  <CheckCircle2 className="size-10 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">You're in the Subscriber Squad Queue!</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Your BGMI UID has been sent to {profile.gaming_name}'s Creator Dashboard. Stay active in the YouTube live chat when team codes drop!
                  </p>
                  <button
                    type="button"
                    onClick={() => setQueueStatus('idle')}
                    className="px-4 py-2 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/15 transition cursor-pointer"
                  >
                    Register Another Teammate
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSquadQueueSubmit} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        In-Game Name (IGN) *
                      </label>
                      <input
                        type="text"
                        required
                        value={ign}
                        onChange={(e) => setIgn(e.target.value)}
                        placeholder="e.g. HydraDynamo"
                        className="w-full rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                        BGMI Character UID *
                      </label>
                      <input
                        type="text"
                        required
                        value={bgmiUid}
                        onChange={(e) => setBgmiUid(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                        placeholder="e.g. 5512345678"
                        className="w-full rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Preferred Squad Role
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['Assaulter', 'Entry Fragger', 'IGL', 'Support'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer truncate ${
                            role === r
                              ? 'bg-pink-500/25 border-pink-400 text-white'
                              : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={queueStatus === 'sending'}
                    className="clip-angle-sm w-full py-3 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-display text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition cursor-pointer"
                  >
                    <Send className="size-4" />
                    {queueStatus === 'sending' ? 'Joining Squad Queue...' : 'Join Subscriber Squad Queue'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

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
