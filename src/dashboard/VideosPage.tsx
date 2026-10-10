import { useState, type FormEvent } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Video as VideoIcon, AlertCircle } from 'lucide-react';
import { useAsync, usePageMeta } from '../hooks';
import { videoService } from '../services/contentServices';
import type { Video } from '../types';
import { VIDEO_CATEGORIES } from '../types';
import { parseYouTubeUrl, youTubeErrorMessage, ytThumb, ytWatchUrl } from '../utils/youtube';
import { friendlyError } from '../utils/misc';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, Toggle } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { SafeImage } from '../components/ui/Display';
import { LoadingState, EmptyState } from '../components/ui/States';
import { formatDate } from '../utils/date';

export function VideosPage() {
  usePageMeta('Manage Videos');
  const toast = useToast();

  const { data: videos, loading, reload } = useAsync(() => videoService.listAll(), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category: 'Rush Gameplay',
    thumbnail_url: '',
    duration_label: '',
    is_published: true,
    is_featured: false,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingVideo(null);
    setForm({
      title: '',
      description: '',
      youtube_url: '',
      category: 'Rush Gameplay',
      thumbnail_url: '',
      duration_label: '',
      is_published: true,
      is_featured: false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (v: Video) => {
    setEditingVideo(v);
    setForm({
      title: v.title,
      description: v.description || '',
      youtube_url: v.youtube_video_id ? ytWatchUrl(v.youtube_video_id) : '',
      category: v.category || 'Rush Gameplay',
      thumbnail_url: v.thumbnail_url || '',
      duration_label: v.duration_label || '',
      is_published: v.is_published,
      is_featured: v.is_featured,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Please provide a video title.');
      return;
    }

    let videoId = '';
    if (form.youtube_url.trim()) {
      const parsed = parseYouTubeUrl(form.youtube_url);
      if (!parsed.ok) {
        setFormError(youTubeErrorMessage(parsed.reason));
        return;
      }
      videoId = parsed.id;
    }

    const thumb = form.thumbnail_url.trim() || (videoId ? ytThumb(videoId) : null);

    setSaving(true);
    try {
      if (editingVideo) {
        await videoService.update(editingVideo.id, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          youtube_video_id: videoId || editingVideo.youtube_video_id,
          category: form.category,
          thumbnail_url: thumb,
          duration_label: form.duration_label.trim() || null,
          is_published: form.is_published,
          is_featured: form.is_featured,
        });
        toast('Video updated!', 'success');
      } else {
        await videoService.create({
          title: form.title.trim(),
          description: form.description.trim() || null,
          youtube_video_id: videoId,
          category: form.category,
          thumbnail_url: thumb,
          duration_label: form.duration_label.trim() || null,
          is_published: form.is_published,
          is_featured: form.is_featured,
          published_at: new Date().toISOString(),
        });
        toast('Video added!', 'success');
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(friendlyError(err, 'Failed to save video.'));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (v: Video) => {
    try {
      await videoService.update(v.id, { is_published: !v.is_published });
      toast(v.is_published ? 'Video unpublished' : 'Video published', 'info');
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not update publication state'), 'error');
    }
  };

  const toggleFeatured = async (v: Video) => {
    try {
      await videoService.update(v.id, { is_featured: !v.is_featured });
      toast(v.is_featured ? 'Removed from featured' : 'Marked as featured', 'info');
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not update featured state'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await videoService.remove(deleteTarget.id);
      toast('Video deleted.', 'info');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not delete video'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const videoList = videos ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <p className="hud-label">Media Vault</p>
          <h1 className="text-3xl font-bold font-display mt-1">Manage Videos</h1>
          <p className="text-sm text-mute mt-1">
            Add YouTube streams, replays and videos to the public gallery.
          </p>
        </div>
        <Button onClick={openAddModal} icon={<Plus className="size-4" />}>
          Add Video
        </Button>
      </div>

      {loading ? (
        <LoadingState count={3} variant="row" />
      ) : videoList.length === 0 ? (
        <EmptyState
          icon={<VideoIcon className="size-8 text-mute" />}
          title="No videos added yet"
          message="Click 'Add Video' to link a YouTube stream or video."
          action={<Button onClick={openAddModal}>Add First Video</Button>}
        />
      ) : (
        <div className="space-y-3">
          {videoList.map((v) => (
            <div
              key={v.id}
              className="panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <SafeImage
                  src={v.thumbnail_url}
                  alt=""
                  className="w-24 sm:w-28 aspect-video rounded-xl object-cover shrink-0 bg-surface"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                      {v.category || 'Video'}
                    </span>
                    {v.is_featured && (
                      <span className="px-2 py-0.5 rounded text-[0.65rem] bg-gold/15 text-gold border border-gold/30 font-semibold flex items-center gap-1">
                        <Star className="size-3" /> Featured
                      </span>
                    )}
                    {!v.is_published && (
                      <span className="px-2 py-0.5 rounded text-[0.65rem] bg-white/10 text-mute">
                        Draft / Unpublished
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold truncate mt-1 text-ink">{v.title}</h3>
                  <p className="text-xs text-mute mt-0.5">
                    {v.duration_label && <span className="mr-2">⏱ {v.duration_label}</span>}
                    {v.published_at && <span>{formatDate(v.published_at)}</span>}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => toggleFeatured(v)}
                  className={`p-2 rounded-xl transition ${
                    v.is_featured ? 'text-gold bg-gold/15' : 'text-mute hover:text-ink hover:bg-white/5'
                  }`}
                  title={v.is_featured ? 'Unfeature' : 'Mark as featured'}
                  aria-label="Toggle featured"
                >
                  <Star className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => togglePublish(v)}
                  className={`p-2 rounded-xl transition ${
                    v.is_published ? 'text-green-300 hover:bg-white/5' : 'text-mute hover:text-ink'
                  }`}
                  title={v.is_published ? 'Unpublish' : 'Publish'}
                  aria-label="Toggle publish"
                >
                  {v.is_published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(v)}
                  className="p-2 text-mute hover:text-ink hover:bg-white/5 rounded-xl transition"
                  title="Edit details"
                  aria-label="Edit video"
                >
                  <Edit2 className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(v)}
                  className="p-2 text-red-300 hover:bg-bad/15 rounded-xl transition"
                  title="Delete"
                  aria-label="Delete video"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVideo ? 'Edit Video Details' : 'Add New Video'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Video Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. TOP 100 RankPush With Rush Gameplay | BGMI"
          />

          <Input
            label="YouTube Video Link or ID"
            value={form.youtube_url}
            onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
            hint="Supports watch, live, shorts, and standard youtube links."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {VIDEO_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Input
              label="Duration Label (Optional)"
              value={form.duration_label}
              onChange={(e) => setForm({ ...form, duration_label: e.target.value })}
              placeholder="e.g. 6:04:53"
            />
          </div>

          <Input
            label="Custom Thumbnail URL (Optional)"
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            placeholder="Auto-fetched from YouTube if left empty"
          />

          <Textarea
            label="Description (Optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Notes or stream context..."
          />

          <div className="pt-2 space-y-3">
            <Toggle
              label="Publish Video"
              description="Make visible on public videos list."
              checked={form.is_published}
              onChange={(v) => setForm({ ...form, is_published: v })}
            />

            <Toggle
              label="Featured Video"
              description="Pins this video near the top of the homepage."
              checked={form.is_featured}
              onChange={(v) => setForm({ ...form, is_featured: v })}
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-300 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" /> {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingVideo ? 'Save Changes' : 'Add Video'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Video"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Video"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
