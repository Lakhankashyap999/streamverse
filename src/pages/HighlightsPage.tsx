import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAsync, usePageMeta } from '../hooks';
import { highlightService } from '../services/contentServices';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { VideoGrid } from '../components/videos/VideoGrid';
import { highlightToMedia } from '../components/videos/mappers';
import { HighlightFilters } from '../components/home/HomeSections';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { SectionHeading } from '../components/ui/Display';
import { HIGHLIGHT_CATEGORIES } from '../types';

export function HighlightsPage() {
  const { profile } = useProfile();
  usePageMeta('Highlights & Clips', `Top gameplay moments, clutch victories, squad fights, and funny clips by ${profile.gaming_name}.`);

  const { data: highlights, loading, error, reload } = useAsync(() => highlightService.listPublic(), []);
  const [selectedCat, setSelectedCat] = useState('All');

  const highlightList = highlights ?? [];

  const filteredMedia = useMemo(() => {
    return highlightList
      .filter((h) => selectedCat === 'All' || h.category === selectedCat)
      .map((h) => highlightToMedia(h, profile.youtube_url));
  }, [highlightList, selectedCat, profile.youtube_url]);

  const featuredClips = useMemo(() => {
    return highlightList
      .filter((h) => h.is_featured)
      .map((h) => highlightToMedia(h, profile.youtube_url));
  }, [highlightList, profile.youtube_url]);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Kill Reel & Moments"
        title="Gaming"
        highlight="Highlights"
        description="Every 1v4 clutch, hilarious fail, and high-adrenaline BGMI play captured in crisp HD clips."
      />

      <PageContainer className="py-12 space-y-16">
        {loading ? (
          <LoadingState count={6} label="Loading highlights" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            {/* Featured Highlights (if any) */}
            {featuredClips.length > 0 && selectedCat === 'All' && (
              <section aria-labelledby="featured-clips-heading">
                <SectionHeading
                  eyebrow="Hall of Fame"
                  title="Editor's"
                  highlight="Picks"
                  id="featured-clips-heading"
                  description="Standout moments handpicked by the creator."
                />
                <VideoGrid items={featuredClips.slice(0, 3)} columns={3} priorityCount={1} />
              </section>
            )}

            {/* Gallery with category filter */}
            <section aria-labelledby="all-clips-heading">
              <SectionHeading
                eyebrow="Clip Vault"
                title="Browse by"
                highlight="Category"
                id="all-clips-heading"
                description="Filter by clutches, squad wipes, funny stream moments, or challenges."
              />

              <HighlightFilters
                categories={[...HIGHLIGHT_CATEGORIES]}
                value={selectedCat}
                onChange={setSelectedCat}
              />

              {filteredMedia.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="size-8 text-gold" />}
                  title="No clips found in this category"
                  message="Try selecting another category or check back after the next livestream."
                />
              ) : (
                <VideoGrid items={filteredMedia} columns={3} />
              )}
            </section>
          </>
        )}
      </PageContainer>
    </div>
  );
}
