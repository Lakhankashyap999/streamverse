import { useState } from 'react';
import { Lightbulb, Check, X, Trash2, Eye, EyeOff, Clock } from 'lucide-react';
import { useAsync, usePageMeta } from '../hooks';
import { suggestionService } from '../services/communityService';
import type { Suggestion } from '../types';
import { formatDateTime } from '../utils/date';
import { friendlyError } from '../utils/misc';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/Modal';
import { LoadingState, EmptyState } from '../components/ui/States';
import { Badge } from '../components/ui/Card';

export function SuggestionsPage() {
  usePageMeta('Moderate Suggestions');
  const toast = useToast();

  const { data: suggestions, loading, reload } = useAsync(() => suggestionService.listAll(), []);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Suggestion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleReview = async (s: Suggestion, status: Suggestion['status'], publish = false) => {
    try {
      await suggestionService.review(s.id, status, publish);
      toast(
        status === 'approved'
          ? publish
            ? 'Idea approved and published to Community Hub!'
            : 'Idea approved (internal only)'
          : 'Idea rejected',
        'success',
      );
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Failed to update suggestion status'), 'error');
    }
  };

  const togglePublic = async (s: Suggestion) => {
    try {
      await suggestionService.update(s.id, { is_published: !s.is_published });
      toast(s.is_published ? 'Removed from public showcase' : 'Published on Community page', 'info');
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not toggle visibility'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await suggestionService.remove(deleteTarget.id);
      toast('Suggestion deleted.', 'info');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not delete suggestion'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const all = suggestions ?? [];
  const filtered = all.filter((s) => (filter === 'all' ? true : s.status === filter));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <p className="hud-label">Community Inbox</p>
          <h1 className="text-3xl font-bold font-display mt-1">Fan Suggestions Moderation</h1>
          <p className="text-sm text-mute mt-1">
            Submissions remain private until explicitly approved and published.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter === f ? 'bg-neon text-white' : 'bg-card text-mute hover:text-ink'
              }`}
            >
              {f} ({f === 'all' ? all.length : all.filter((s) => s.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState count={3} variant="row" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="size-8 text-mute" />}
          title={`No ${filter !== 'all' ? filter : ''} suggestions`}
          message="Viewers submit ideas from the public Community page."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="panel p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    tone={
                      s.status === 'approved'
                        ? 'success'
                        : s.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {s.status.toUpperCase()}
                  </Badge>

                  <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                    {s.type.replace('_', ' ')}
                  </span>

                  {s.is_published && (
                    <Badge tone="accent">Publicly Displayed</Badge>
                  )}
                </div>

                <span className="text-xs text-mute flex items-center gap-1.5">
                  <Clock className="size-3" />
                  {formatDateTime(s.created_at)}
                </span>
              </div>

              <p className="text-base text-ink leading-relaxed">{s.message}</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-line text-xs text-mute">
                <span>Submitted by: <strong className="text-ink">{s.display_name || 'Anonymous Fan'}</strong></span>

                <div className="flex items-center gap-2">
                  {s.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReview(s, 'approved', true)}
                        className="px-3 py-1.5 rounded-lg bg-ok/15 text-green-300 hover:bg-ok/25 flex items-center gap-1 font-semibold transition"
                      >
                        <Check className="size-3.5" /> Approve & Publish
                      </button>
                      <button
                        onClick={() => handleReview(s, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-bad/15 text-red-300 hover:bg-bad/25 flex items-center gap-1 font-semibold transition"
                      >
                        <X className="size-3.5" /> Reject
                      </button>
                    </>
                  )}

                  {s.status === 'approved' && (
                    <button
                      onClick={() => togglePublic(s)}
                      className="px-3 py-1.5 rounded-lg bg-card hover:bg-white/10 flex items-center gap-1 font-semibold transition text-ink"
                    >
                      {s.is_published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      {s.is_published ? 'Hide from public' : 'Publish to hub'}
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="p-1.5 text-red-300 hover:bg-bad/15 rounded-lg transition"
                    title="Delete suggestion"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Suggestion"
        message="Permanently remove this viewer suggestion?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
