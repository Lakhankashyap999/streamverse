import { useState, type FormEvent } from 'react';
import { Plus, Edit2, Trash2, Radio, CheckCircle, Archive, AlertCircle, Clock } from 'lucide-react';
import { useAsync, usePageMeta } from '../hooks';
import { streamService } from '../services/contentServices';
import type { Stream, StreamStatus } from '../types';
import { STREAM_STATUSES } from '../types';
import { parseYouTubeUrl, ytThumb, ytWatchUrl } from '../utils/youtube';
import { toLocalInput, fromLocalInput, formatDateTime } from '../utils/date';
import { friendlyError } from '../utils/misc';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, Toggle } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { SafeImage } from '../components/ui/Display';
import { LoadingState, EmptyState } from '../components/ui/States';
import { Badge } from '../components/ui/Card';

export function StreamsPage() {
  usePageMeta('Manage Livestreams');
  const toast = useToast();

  const { data: streams, loading, reload } = useAsync(() => streamService.listAll(), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stream | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    youtube_url: '',
    stream_url: '',
    scheduled_at: '',
    timezone: 'Asia/Kolkata',
    status: 'scheduled' as StreamStatus,
    thumbnail_url: '',
    duration_label: '',
    is_published: true,
    is_featured: false,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingStream(null);
    const tomorrow = new Date(Date.now() + 864e5).toISOString();
    setForm({
      title: '',
      description: '',
      youtube_url: '',
      stream_url: '',
      scheduled_at: toLocalInput(tomorrow),
      timezone: 'Asia/Kolkata',
      status: 'scheduled',
      thumbnail_url: '',
      duration_label: '',
      is_published: true,
      is_featured: false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (s: Stream) => {
    setEditingStream(s);
    setForm({
      title: s.title,
      description: s.description || '',
      youtube_url: s.youtube_video_id ? ytWatchUrl(s.youtube_video_id) : '',
      stream_url: s.stream_url || '',
      scheduled_at: toLocalInput(s.scheduled_at),
      timezone: s.timezone || 'Asia/Kolkata',
      status: s.status,
      thumbnail_url: s.thumbnail_url || '',
      duration_label: s.duration_label || '',
      is_published: s.is_published,
      is_featured: s.is_featured,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Please enter a stream title.');
      return;
    }

    let videoId = '';
    if (form.youtube_url.trim()) {
      const parsed = parseYouTubeUrl(form.youtube_url);
      if (parsed.ok) {
        videoId = parsed.id;
      }
    }

    const isoScheduled = fromLocalInput(form.scheduled_at);
    const thumb = form.thumbnail_url.trim() || (videoId ? ytThumb(videoId) : null);

    setSaving(true);
    try {
      if (editingStream) {
        await streamService.update(editingStream.id, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          youtube_video_id: videoId || editingStream.youtube_video_id,
          stream_url: form.stream_url.trim() || null,
          scheduled_at: isoScheduled,
          timezone: form.timezone,
          status: form.status,
          thumbnail_url: thumb,
          duration_label: form.duration_label.trim() || null,
          is_published: form.is_published,
          is_featured: form.is_featured,
        });
        toast('Stream schedule updated!', 'success');
      } else {
        await streamService.create({
          title: form.title.trim(),
          description: form.description.trim() || null,
          youtube_video_id: videoId || null,
          stream_url: form.stream_url.trim() || null,
          scheduled_at: isoScheduled,
          timezone: form.timezone,
          status: form.status,
          thumbnail_url: thumb,
          duration_label: form.duration_label.trim() || null,
          is_published: form.is_published,
          is_featured: form.is_featured,
        });
        toast('Stream scheduled!', 'success');
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(friendlyError(err, 'Failed to save stream.'));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (s: Stream, status: StreamStatus) => {
    try {
      await streamService.update(s.id, { status });
      toast(`Status set to ${status}`, 'success');
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not update status'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await streamService.remove(deleteTarget.id);
      toast('Stream deleted.', 'info');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not delete stream'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const streamList = streams ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <p className="hud-label">Broadcast Schedule</p>
          <h1 className="text-3xl font-bold font-display mt-1">Manage Livestreams</h1>
          <p className="text-sm text-mute mt-1">
            Schedule upcoming streams, update live status, or archive previous sessions.
          </p>
        </div>
        <Button onClick={openAddModal} icon={<Plus className="size-4" />}>
          Schedule Stream
        </Button>
      </div>

      {loading ? (
        <LoadingState count={3} variant="row" />
      ) : streamList.length === 0 ? (
        <EmptyState
          icon={<Radio className="size-8 text-mute" />}
          title="No streams scheduled"
          message="Plan an upcoming stream to announce dates to your viewers."
          action={<Button onClick={openAddModal}>Schedule First Stream</Button>}
        />
      ) : (
        <div className="space-y-3">
          {streamList.map((s) => (
            <div
              key={s.id}
              className="panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <SafeImage
                  src={s.thumbnail_url}
                  alt=""
                  className="w-24 sm:w-28 aspect-video rounded-xl object-cover shrink-0 bg-surface"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        s.status === 'live'
                          ? 'danger'
                          : s.status === 'scheduled'
                          ? 'upcoming'
                          : s.status === 'completed'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {s.status.toUpperCase()}
                    </Badge>
                    {s.is_featured && <Badge tone="gold">Featured</Badge>}
                  </div>
                  <h3 className="text-base font-bold truncate mt-1 text-ink">{s.title}</h3>
                  <p className="text-xs text-mute mt-0.5 flex items-center gap-2">
                    <Clock className="size-3" />
                    <span>{formatDateTime(s.scheduled_at)}</span>
                  </p>
                </div>
              </div>

              {/* Status quick toggles & actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {s.status === 'scheduled' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(s, 'live')}
                    className="px-2.5 py-1.5 rounded-lg bg-bad/15 text-red-300 border border-bad/30 hover:bg-bad/25 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Radio className="size-3" /> Go Live
                  </button>
                )}

                {s.status === 'live' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(s, 'completed')}
                    className="px-2.5 py-1.5 rounded-lg bg-ok/15 text-green-300 border border-ok/30 hover:bg-ok/25 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <CheckCircle className="size-3" /> Mark Finished
                  </button>
                )}

                {s.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(s, 'archived')}
                    className="p-2 text-mute hover:text-ink hover:bg-white/5 rounded-xl transition"
                    title="Archive stream"
                  >
                    <Archive className="size-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openEditModal(s)}
                  className="p-2 text-mute hover:text-ink hover:bg-white/5 rounded-xl transition"
                  title="Edit details"
                >
                  <Edit2 className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(s)}
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

      {/* Add / Edit Stream Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStream ? 'Edit Stream' : 'Schedule New Stream'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Stream Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. TOP 100 Rank Push — Rush Gameplay Live"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date & Time (Your Local Time)"
              type="datetime-local"
              required
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            />

            <Select
              label="Broadcast Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as StreamStatus })}
            >
              {STREAM_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="YouTube Video Link or ID"
              value={form.youtube_url}
              onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              hint="Paste YouTube live/stream link"
            />

            <Input
              label="Custom Stream URL (Optional)"
              value={form.stream_url}
              onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
              placeholder="Defaults to channel /live"
            />
          </div>

          <Input
            label="Custom Thumbnail URL (Optional)"
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
            placeholder="Auto-derived if YouTube ID is provided"
          />

          <Textarea
            label="Description (Optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Rank targets, squad teammates, etc."
          />

          <div className="pt-2 space-y-3">
            <Toggle
              label="Published"
              description="Visible on streams calendar."
              checked={form.is_published}
              onChange={(v) => setForm({ ...form, is_published: v })}
            />

            <Toggle
              label="Featured on Homepage"
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
              {editingStream ? 'Save Changes' : 'Schedule Stream'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Stream"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Stream"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
