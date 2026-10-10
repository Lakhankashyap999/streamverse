import { createCrudService } from './crud';
import type { CommunityPost, Highlight, Stream, Video } from '../types';

export const videoService = createCrudService<Video>({
  table: 'videos',
  label: 'videos',
  order: { column: 'published_at', ascending: false },
  publicQuery: (q) => q.eq('is_published', true),
  publicFilter: (v) => v.is_published,
});

export const streamService = createCrudService<Stream>({
  table: 'streams',
  label: 'streams',
  order: { column: 'scheduled_at', ascending: false },
  publicQuery: (q) => q.eq('is_published', true).neq('status', 'archived'),
  publicFilter: (s) => s.is_published && s.status !== 'archived',
});

export const highlightService = createCrudService<Highlight>({
  table: 'highlights',
  label: 'highlights',
  order: { column: 'created_at', ascending: false },
  publicQuery: (q) => q.eq('is_published', true),
  publicFilter: (h) => h.is_published,
});

export const communityPostService = createCrudService<CommunityPost>({
  table: 'community_posts',
  label: 'community posts',
  order: { column: 'created_at', ascending: false },
  publicQuery: (q) => q.eq('is_published', true),
  publicFilter: (p) => p.is_published,
});
