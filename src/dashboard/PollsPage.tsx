import { useState, type FormEvent } from 'react';
import { Plus, Trash2, Vote, Lock, BarChart3, AlertCircle, X } from 'lucide-react';
import { useAsync, usePageMeta } from '../hooks';
import { pollService } from '../services/pollService';
import type { Poll, PollOption, ResultsVisibility } from '../types';
import { validatePollOptions } from '../utils/validation';
import { toLocalInput, fromLocalInput, formatDateTime } from '../utils/date';
import { friendlyError } from '../utils/misc';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { LoadingState, EmptyState } from '../components/ui/States';
import { Badge } from '../components/ui/Card';

export function PollsPage() {
  usePageMeta('Manage Polls');
  const toast = useToast();

  const { data: polls, loading, reload } = useAsync(() => pollService.listAll(), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Poll | null>(null);
  const [viewResultsTarget, setViewResultsTarget] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<{ option_id: string; votes: number }[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['Option A', 'Option B']);
  const [endsAt, setEndsAt] = useState('');
  const [resultsVisibility, setResultsVisibility] = useState<ResultsVisibility>('after_vote');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setQuestion('');
    setOptions(['', '']);
    const oneWeek = new Date(Date.now() + 7 * 864e5).toISOString();
    setEndsAt(toLocalInput(oneWeek));
    setResultsVisibility('after_vote');
    setFormError('');
    setModalOpen(true);
  };

  const addOptionField = () => {
    if (options.length >= 6) return;
    setOptions([...options, '']);
  };

  const removeOptionField = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!question.trim()) {
      setFormError('Please enter a poll question.');
      return;
    }

    const optErr = validatePollOptions(options);
    if (optErr) {
      setFormError(optErr);
      return;
    }

    const formattedOptions: PollOption[] = options.map((lbl, i) => ({
      id: `opt-${i + 1}-${Date.now().toString(36)}`,
      label: lbl.trim(),
    }));

    setSaving(true);
    try {
      await pollService.create({
        question: question.trim(),
        options: formattedOptions,
        starts_at: new Date().toISOString(),
        ends_at: fromLocalInput(endsAt),
        status: 'active',
        results_visibility: resultsVisibility,
      });
      toast('Poll created and published!', 'success');
      setModalOpen(false);
      await reload();
    } catch (err) {
      setFormError(friendlyError(err, 'Failed to create poll.'));
    } finally {
      setSaving(false);
    }
  };

  const closePoll = async (p: Poll) => {
    try {
      await pollService.update(p.id, { status: 'closed' });
      toast('Poll closed.', 'info');
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not close poll'), 'error');
    }
  };

  const openResultsModal = async (p: Poll) => {
    setViewResultsTarget(p);
    setPollResults(null);
    try {
      const res = await pollService.results(p.id);
      setPollResults(res);
    } catch (err) {
      toast(friendlyError(err, 'Could not load results'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await pollService.remove(deleteTarget.id);
      toast('Poll deleted.', 'info');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast(friendlyError(err, 'Could not delete poll'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const pollList = polls ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <p className="hud-label">Viewer Engagement</p>
          <h1 className="text-3xl font-bold font-display mt-1">Manage Polls</h1>
          <p className="text-sm text-mute mt-1">
            Create community votes, inspect authentic vote counts, and manage poll statuses.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="size-4" />}>
          Create Poll
        </Button>
      </div>

      {loading ? (
        <LoadingState count={2} variant="row" />
      ) : pollList.length === 0 ? (
        <EmptyState
          icon={<Vote className="size-8 text-mute" />}
          title="No polls created yet"
          message="Ask your viewers what to stream next or what gaming challenge to take on."
          action={<Button onClick={openCreateModal}>Create First Poll</Button>}
        />
      ) : (
        <div className="space-y-4">
          {pollList.map((p) => (
            <div key={p.id} className="panel p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                    {p.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-mute">
                    {p.ends_at ? `Closes ${formatDateTime(p.ends_at)}` : 'No end date'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<BarChart3 className="size-4" />}
                    onClick={() => openResultsModal(p)}
                  >
                    View Results
                  </Button>

                  {p.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Lock className="size-4" />}
                      onClick={() => closePoll(p)}
                    >
                      Close Poll
                    </Button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="p-2 text-red-300 hover:bg-bad/15 rounded-xl transition"
                    title="Delete poll"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-ink">{p.question}</h3>

              <div className="grid gap-2 sm:grid-cols-2">
                {p.options.map((opt, i) => (
                  <div key={opt.id} className="px-3.5 py-2 rounded-xl bg-surface/60 border border-line text-sm flex items-center gap-2">
                    <span className="text-xs text-gold font-bold">{i + 1}.</span>
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Poll Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Poll" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Question"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What drop zone should we land at tomorrow?"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink block">
              Options (2 to 6 options) <span className="text-blush">*</span>
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="field py-2 text-sm"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOptionField(i)}
                    className="p-2 text-mute hover:text-red-300"
                    aria-label="Remove option"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button variant="ghost" size="sm" onClick={addOptionField} icon={<Plus className="size-3.5" />}>
                Add Option
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Poll End Date & Time"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />

            <Select
              label="Results Visibility"
              value={resultsVisibility}
              onChange={(e) => setResultsVisibility(e.target.value as ResultsVisibility)}
            >
              <option value="after_vote">Show results after voting</option>
              <option value="always">Always show results</option>
              <option value="after_close">Show results only when poll closes</option>
            </Select>
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
              Publish Poll
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Results Modal */}
      <Modal
        open={Boolean(viewResultsTarget)}
        onClose={() => setViewResultsTarget(null)}
        title="Live Vote Results"
        size="md"
      >
        {viewResultsTarget && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-ink">{viewResultsTarget.question}</h3>
            {pollResults === null ? (
              <LoadingState count={3} variant="row" />
            ) : (
              <div className="space-y-3">
                {viewResultsTarget.options.map((opt) => {
                  const votes = pollResults.find((r) => r.option_id === opt.id)?.votes ?? 0;
                  const total = pollResults.reduce((sum, r) => sum + r.votes, 0);
                  const pct = total ? Math.round((votes / total) * 100) : 0;
                  return (
                    <div key={opt.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-ink">{opt.label}</span>
                        <span className="text-gold font-bold font-display">
                          {votes} votes ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-pink-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-mute pt-2 border-t border-line">
                  Total genuine website votes recorded: {pollResults.reduce((s, r) => s + r.votes, 0)}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Poll"
        message={`Delete poll "${deleteTarget?.question}"?`}
        confirmLabel="Delete Poll"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
