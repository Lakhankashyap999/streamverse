import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Play, Star } from 'lucide-react';
import { cn } from '../../utils/misc';
import { formatDate } from '../../utils/date';
import { isValidVideoId, ytThumb, ytWatchUrl, ytEmbedUrl } from '../../utils/youtube';
import { safeExternalUrl } from '../../utils/links';
import { Badge, SampleBadge } from '../ui/Card';
import { SafeImage } from '../ui/Display';
import { Modal } from '../ui/Modal';
import { ExternalButton } from '../ui/Button';

export interface MediaItem {
  id: string;
  title: string;
  youtubeId?: string | null;
  thumbnail?: string | null;
  /** Used when no video ID is available (e.g. channel streams page). */
  fallbackUrl?: string | null;
  category?: string | null;
  date?: string | null;
  duration?: string | null;
  description?: string | null;
  isSample?: boolean;
  featured?: boolean;
}

export function VideoCard({ item, onPlay, priority = false }: { item: MediaItem; onPlay(item: MediaItem): void; priority?: boolean }) {
  const reduce = useReducedMotion();
  const hasVideo = isValidVideoId(item.youtubeId);
  const thumb = item.thumbnail || (hasVideo ? ytThumb(item.youtubeId!) : null);
  const external = !hasVideo ? safeExternalUrl(item.fallbackUrl, ['youtube.com', 'youtu.be']) : null;

  const content = (
    <>
      <div className="relative aspect-video overflow-hidden bg-surface">
        <SafeImage
          src={thumb}
          alt=""
          className="size-full transition-transform duration-500 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          width={480}
          height={270}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base/90 via-base/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.isSample && <SampleBadge />}
          {item.featured && (
            <Badge tone="gold" icon={<Star className="size-3" aria-hidden />}>
              Featured
            </Badge>
          )}
        </div>
        {item.duration && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-1.5 py-0.5 font-display text-xs font-semibold">
            {item.duration}
          </span>
        )}
        <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full bg-white/15 opacity-0 backdrop-blur transition group-hover:scale-100 group-hover:opacity-100 group-focus-visible:opacity-100">
          {hasVideo ? <Play className="ml-0.5 size-6 fill-white" aria-hidden /> : <ExternalLink className="size-6" aria-hidden />}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs">
          {item.category && <span className="font-gaming font-bold uppercase tracking-wider text-pink-400 text-xs">{item.category}</span>}
          {item.category && item.date && <span className="text-white/40">•</span>}
          {item.date && <time dateTime={item.date} className="text-slate-300 font-medium">{formatDate(item.date)}</time>}
        </div>
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-white group-hover:text-amber-300 transition-colors">{item.title}</h3>
        <span className="mt-auto pt-1 text-sm font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          {hasVideo ? 'Watch now' : external ? 'Watch on YouTube' : 'Video link coming soon'}
          <span aria-hidden> →</span>
        </span>
      </div>
    </>
  );

  const cls =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card/80 text-left transition-[border-color,box-shadow] hover:border-blush/40 hover:shadow-glow';

  return (
    <motion.article whileHover={reduce ? undefined : { y: -4 }} transition={{ duration: 0.2 }} className="h-full winter-icicle-container">
      {hasVideo ? (
        <button type="button" onClick={() => onPlay(item)} className={cn(cls, 'w-full')} aria-label={`Play: ${item.title}`}>
          {content}
        </button>
      ) : external ? (
        <a href={external} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${item.title} (opens YouTube in a new tab)`}>
          {content}
        </a>
      ) : (
        <div className={cls}>{content}</div>
      )}
    </motion.article>
  );
}

/** Mobile-exclusive compact ZigZag card layout */
function MobileZigzagVideoCard({
  item,
  index,
  onPlay,
  priority = false,
}: {
  item: MediaItem;
  index: number;
  onPlay(item: MediaItem): void;
  priority?: boolean;
}) {
  const isEven = index % 2 === 0;
  const hasVideo = isValidVideoId(item.youtubeId);
  const thumb = item.thumbnail || (hasVideo ? ytThumb(item.youtubeId!) : null);
  const external = !hasVideo ? safeExternalUrl(item.fallbackUrl, ['youtube.com', 'youtu.be']) : null;

  const thumbBox = (
    <div className="relative w-32 xs:w-36 shrink-0 aspect-[16/10] rounded-xl overflow-hidden bg-surface border border-line shadow-inner">
      <SafeImage
        src={thumb}
        alt=""
        className="size-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        width={240}
        height={150}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent" />
      {item.duration && (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow">
          {item.duration}
        </span>
      )}
      <span className="absolute left-1/2 top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
        {hasVideo ? <Play className="ml-0.5 size-3.5 fill-white text-white" aria-hidden /> : <ExternalLink className="size-3.5 text-white" aria-hidden />}
      </span>
    </div>
  );

  const infoBox = (
    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
      <div>
        <div className="flex items-center gap-1.5 text-[10px] mb-1">
          <span className={cn('font-gaming font-bold uppercase tracking-wider', isEven ? 'text-pink-400' : 'text-amber-400')}>
            {item.category || 'Live Stream'}
          </span>
          {item.date && (
            <>
              <span className="text-white/40">•</span>
              <time dateTime={item.date} className="text-slate-300 font-medium">
                {formatDate(item.date)}
              </time>
            </>
          )}
        </div>
        <h4 className="font-display text-xs font-bold leading-snug text-white line-clamp-2">
          {item.title}
        </h4>
      </div>
      <div className="pt-2 flex items-center justify-between">
        <span className={cn('font-mono text-[10px] font-bold flex items-center gap-1', isEven ? 'text-amber-300' : 'text-pink-300')}>
          {hasVideo ? 'Play Now ➔' : 'Watch on YT ➔'}
        </span>
      </div>
    </div>
  );

  const containerCls = cn(
    'group flex items-center gap-3 p-2.5 rounded-2xl bg-card/90 border border-line transition shadow-md active:scale-[0.99]',
    isEven ? 'border-l-4 border-l-pink-500' : 'border-r-4 border-r-amber-400',
  );

  return (
    <div className="winter-icicle-container">
      {hasVideo ? (
        <button type="button" onClick={() => onPlay(item)} className={cn(containerCls, 'w-full text-left')} aria-label={`Play: ${item.title}`}>
          {isEven ? (
            <>
              {thumbBox}
              {infoBox}
            </>
          ) : (
            <>
              {infoBox}
              {thumbBox}
            </>
          )}
        </button>
      ) : (
        <a href={external ?? '#'} target="_blank" rel="noopener noreferrer" className={containerCls} aria-label={`${item.title} (opens YouTube)`}>
          {isEven ? (
            <>
              {thumbBox}
              {infoBox}
            </>
          ) : (
            <>
              {infoBox}
              {thumbBox}
            </>
          )}
        </a>
      )}
    </div>
  );
}

/** Click-to-load player: the iframe is only created after the visitor presses play. */
export function VideoPlayerModal({ item, onClose }: { item: MediaItem | null; onClose(): void }) {
  const [failed, setFailed] = useState(false);
  const id = item?.youtubeId;
  return (
    <Modal open={Boolean(item)} onClose={onClose} title={item?.title ?? 'Video'} size="xl">
      {item && isValidVideoId(id) && (
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            {!failed ? (
              <iframe
                src={ytEmbedUrl(id)}
                title={item.title}
                className="absolute inset-0 size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onError={() => setFailed(true)}
              />
            ) : (
              <div className="grid size-full place-items-center p-6 text-center text-mute">This video is unavailable.</div>
            )}
          </div>
          {item.description && <p className="text-mute">{item.description}</p>}
          <ExternalButton href={ytWatchUrl(id)} hosts={['youtube.com']} variant="secondary" size="sm" icon={<ExternalLink className="size-4" aria-hidden />}>
            Open on YouTube
          </ExternalButton>
        </div>
      )}
    </Modal>
  );
}

export function VideoGrid({ items, columns = 3, priorityCount = 0 }: { items: MediaItem[]; columns?: 2 | 3 | 4; priorityCount?: number }) {
  const [playing, setPlaying] = useState<MediaItem | null>(null);
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns];
  return (
    <>
      {/* Mobile-optimized Zigzag layout (hidden on sm+) */}
      <div className="flex flex-col gap-3 sm:hidden">
        {items.map((item, i) => (
          <MobileZigzagVideoCard key={item.id} item={item} index={i} onPlay={setPlaying} priority={i < priorityCount} />
        ))}
      </div>

      {/* Tablet & Desktop Grid (hidden on mobile) */}
      <div className={cn('hidden sm:grid gap-5', cols)}>
        {items.map((item, i) => (
          <VideoCard key={item.id} item={item} onPlay={setPlaying} priority={i < priorityCount} />
        ))}
      </div>
      <VideoPlayerModal item={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
