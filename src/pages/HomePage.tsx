import { useProfile } from '../context/ProfileContext';
import { useAsync, usePageMeta } from '../hooks';
import { videoService, streamService, highlightService, communityPostService } from '../services/contentServices';
import { pollService } from '../services/pollService';
import { Ticker } from '../components/ui/Hud';
import {
  Hero,
  CreatorIntro,
  LiveSection,
  LatestVideos,
  FeaturedHighlights,
  UpcomingStreams,
  CommunityPreview,
  SocialSection,
} from '../components/home/HomeSections';
import { PubgCareerStats } from '../components/home/PubgCareerStats';

const TICKER_ITEMS = [
  '👑 WINNER WINNER CHICKEN DINNER (+42 PTS)',
  '🔥 KHUSHIYT ELIMINATED SQUAD WITH M416 [HEADSHOT]',
  '🪂 AIRDROP CRATE IN POCHINKI [AWM & GROZA]',
  '⚡ TOP 100 CONQUEROR RANK PUSH MARATHON',
  '🛡️ LEVEL-3 HELMET & VEST EQUIPPED',
  '🎯 60 FPS · 20MS PING · ASIA SERVER',
  '❤️ KHUSHIYT FAMILY · 27.6K OPERATIVES STRONG',
];

export function HomePage() {
  const { profile } = useProfile();
  usePageMeta(
    `${profile.gaming_name} · BGMI Creator & Livestreamer`,
    `${profile.gaming_name} official creator hub — watch marathon BGMI rank-push livestreams, rush gameplay highlights and join the community.`,
  );

  const { data: videos, loading: vLoading, error: vError, reload: rVideos } = useAsync(() => videoService.listPublic(), []);
  const { data: streams, loading: _sLoading, error: _sError, reload: _rStreams } = useAsync(() => streamService.listPublic(), []);
  const { data: highlights, loading: hLoading, error: hError, reload: rHighlights } = useAsync(() => highlightService.listPublic(), []);
  const { data: polls, loading: pLoading } = useAsync(() => pollService.listPublic(), []);
  const { data: posts, loading: cpLoading } = useAsync(() => communityPostService.listPublic(), []);

  const videoList = videos ?? [];
  const streamList = streams ?? [];
  const highlightList = highlights ?? [];
  const pollList = polls ?? [];
  const postList = posts ?? [];

  return (
    <div className="relative">
      <Hero profile={profile} streams={streamList} videos={videoList} />

      <Ticker items={TICKER_ITEMS} />

      <CreatorIntro profile={profile} />

      <PubgCareerStats />

      <LiveSection profile={profile} streams={streamList} videos={videoList} />

      <LatestVideos
        videos={videoList}
        loading={vLoading}
        error={vError}
        onRetry={rVideos}
        channel={profile.youtube_url}
      />

      <FeaturedHighlights
        highlights={highlightList}
        loading={hLoading}
        error={hError}
        onRetry={rHighlights}
        channel={profile.youtube_url}
      />

      <UpcomingStreams streams={streamList} profile={profile} />

      <CommunityPreview polls={pollList} posts={postList} loading={pLoading || cpLoading} />

      <SocialSection profile={profile} />
    </div>
  );
}
