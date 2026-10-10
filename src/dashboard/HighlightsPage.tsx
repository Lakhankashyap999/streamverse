import { useState, type FormEvent } from 'react';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useAsync, usePageMeta } from '../hooks';
import { highlightService } from '../services/contentServices';
import type { Highlight, HighlightCategory } from '../types';
import { HIGHLIGHT_CATEGORIES } from '../types';
import { parseYouTubeUrl, ytThumb, ytWatchUrl } from '../utils/youtube';
import { friendlyError } from '../utils/misc';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, Toggle } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { SafeImage } from '../components/ui/Display';
import { LoadingState, EmptyState } from '../components/ui/States';
import { Badge } from '../components/ui/Card';

export function HighlightsPage() {
  usePageMeta('Manage Highlights');
  const toast = useToast();

  const { data: highlights, loading, reload } = useAsync(() => highlightService.listAll(), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Highlight | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category: 'Best Clutches' as HighlightCategory,
    thumbnail_url: '',
    is_featured: false,
    is_published: true,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingHighlight(null);
    setForm({
      title: '',
      description: '',
      youtube_url: '',
      category: 'Best Clutches',
      thumbnail_url: '',
      is_featured: false,
      is_published: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (h: Highlight) => {
    setEditingHighlight(h);
    setForm({
      title: h.title,
      description: h.description || '',
      youtube_url: h.youtube_video_id ? ytWatchUrl(h.youtube_video_id) : '',
      category: (h.category as HighlightCategory) || 'Best Clutches',
      thumbnail_url: h.thumbnail_url || '',
      is_featured: h.is_featured,
      is_published: h.is_published,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Please enter a clip title.');
      return;
    }

    let videoId = '';
    if (form.youtube_url.trim()) {
      const parsed = parseYouTubeUrl(form.youtube_url);
      if (parsed.ok) {
        videoId = parsed.id;
      }
    }

    const thumb = form.thumbnail_url.trim() || (videoId ? ytThumb(videoId) : null);

    setSaving(true);
    try {
      if (editingHighlight) {
        await highlightService.update(editingHighlight.id, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          youtube_video_id: videoId || editingHighlight.youtube_video_id,
          category: form.category,
          thumbnail_url: thumb,
          is_featured: form.is_featured,
          is_published: form.is_published,
        });
        toast('Highlight updated!', 'success');
      } else {
        await highlightService.create({
          title: form.title.trim(),
          description: form.description.trim() || null,
          youtube_video_id: videoId,
          category: form.category,
          thumbnail_url: thumb,
          is_featured: form.is_featured,
          is_published: form.is_published,
        });
        toast('Highlight clip added!', 'success');
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(friendlyError(err, 'Failed to save highlight.'));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (h: Highlight) => {
    try {
      await highlightService.update(h.id, { is_published: !h.is_published });
      toast(h.is_published ? 'Clip hidden from public' : 'Clip published', 'info');
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Failed to update visibility'), 'error');
    }
  };

  const toggleFeatured = async (h: Highlight) => {
    try {
      await highlightService.update(h.id, { is_featured: !h.is_featured });
      toast(h.is_featured ? 'Removed from featured' : 'Featured on top', 'info');
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Failed to update featured'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await highlightService.remove(deleteTarget.id);
      toast('Highlight deleted.', 'info');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not delete highlight'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const highlightList = highlights ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <p className="hud-label">Clutch Reel</p>
          <h1 className="text-3xl font-bold font-display mt-1">Manage Highlights</h1>
          <p className="text-sm text-mute mt-1">
            Publish best clutches, squad wipes, and funny stream clips.
          </p>
        </div>
        <Button onClick={openAddModal} icon={<Plus className="size-4" />}>
          Add Highlight Clip
        </Button>
      </div>

      {loading ? (
        <LoadingState count={3} variant="row" />
      ) : highlightList.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-8 text-mute" />}
          title="No highlights yet"
          message="Create and categorize top clips for your fans."
          action={<Button onClick={openAddModal}>Add First Highlight</Button>}
        />
      ) : (
        <div className="space-y-3">
          {highlightList.map((h) => (
            <div
              key={h.id}
              className="panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <SafeImage
                  src={h.thumbnail_url}
                  alt=""
                  className="w-24 sm:w-28 aspect-video rounded-xl object-cover shrink-0 bg-surface"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone="accent">{h.category || 'Clips'}</Badge>
                    {h.is_featured && <Badge tone="gold">Featured</Badge>}
                    {!h.is_published && <Badge tone="neutral">Unpublished</Badge>}
                  </div>
                  <h3 className="text-base font-bold truncate mt-1 text-ink">{h.title}</h3>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => toggleFeatured(h)}
                  className={`p-2 rounded-xl transition ${
                    h.is_featured ? 'text-gold bg-gold/15' : 'text-mute hover:text-ink hover:bg-white/5'
                  }`}
                  title="Toggle featured"
                >
                  <Star className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => togglePublish(h)}
                  className={`p-2 rounded-xl transition ${
                    h.is_published ? 'text-green-300 hover:bg-white/5' : 'text-mute hover:text-ink'
                  }`}
                  title="Toggle publish"
                >
                  {h.is_published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(h)}
                  className="p-2 text-mute hover:text-ink hover:bg-white/5 rounded-xl transition"
                  title="Edit highlight"
                >
                  <Edit2 className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(h)}
                  className="p-2 text-red-300 hover:bg-bad/15 rounded-xl transition"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHighlight ? 'Edit Highlight' : 'Add Highlight Clip'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Clip Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 1v4 Final Circle Clutch with M416"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as HighlightCategory })}
            >
              {HIGHLIGHT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Input
              label="YouTube Video Link or Shorts Link"
              value={form.youtube_url}
              onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
              placeholder="https://youtu.be/... or /shorts/..."
            />
          </div>

          <Input
            label="Custom Thumbnail URL"
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            placeholder="Image URL or creator asset"
          />

          <Textarea
            label="Description (Optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="pt-2 space-y-3">
            <Toggle
              label="Published"
              description="Show clip on highlights page."
              checked={form.is_published}
              onChange={(v) => setForm({ ...form, is_published: v })}
            />

            <Toggle
              label="Featured Clip"
              description="Pin clip to the top highlights row."
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
              {editingHighlight ? 'Save Changes' : 'Add Clip'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Highlight"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Clip"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
