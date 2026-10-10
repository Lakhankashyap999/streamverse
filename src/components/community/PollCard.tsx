import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, CheckCircle2, Lock, Vote } from 'lucide-react';
import type { Poll, PollResult } from '../../types';
import { canSeeResults, isPollOpen, pollService } from '../../services/pollService';
import { formatDateTime } from '../../utils/date';
import { cn, friendlyError } from '../../utils/misc';
import { Badge, SampleBadge } from '../ui/Card';
import { Button } from '../ui/Button';

export function PollCard({ poll, compact = false }: { poll: Poll; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [myVote, setMyVote] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [results, setResults] = useState<PollResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = isPollOpen(poll);

  const loadResults = useCallback(
    async (vote: string | null) => {
      if (!canSeeResults(poll, vote)) return setResults(null);
      try {
        setResults(await pollService.results(poll.id));
      } catch {
        setResults(null);
      }
    },
    [poll],
  );

  useEffect(() => {
    let alive = true;
    pollService.myVote(poll.id).then((v) => {
      if (!alive) return;
      setMyVote(v);
      void loadResults(v);
    });
    return () => {
      alive = false;
    };
  }, [poll.id, loadResults]);

  const submit = async () => {
    if (!selected) return setError('Pick an option first.');
    setBusy(true);
    setError(null);
    try {
      await pollService.vote(poll.id, selected);
      setMyVote(selected);
      await loadResults(selected);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const total = results?.reduce((n, r) => n + r.votes, 0) ?? 0;
  const showResults = results !== null && (Boolean(myVote) || !open || poll.results_visibility === 'always');
  const legendId = `poll-${poll.id}`;

  return (
    <article className={cn('panel relative flex flex-col gap-5 overflow-hidden', compact ? 'p-5' : 'p-6 sm:p-7')}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={open ? 'success' : 'neutral'} icon={open ? <Vote className="size-3" aria-hidden /> : <Lock className="size-3" aria-hidden />}>
          {open ? 'Poll open' : 'Poll closed'}
        </Badge>
        {poll.is_sample && <SampleBadge />}
      </div>
      <h3 id={legendId} className="text-xl font-bold leading-snug">
        {poll.question}
      </h3>

      {showResults ? (
        <ul className="space-y-3" aria-label="Poll results">
          {poll.options.map((o) => {
            const votes = results!.find((r) => r.option_id === o.id)?.votes ?? 0;
            const pct = total ? Math.round((votes / total) * 100) : 0;
            const mine = myVote === o.id;
            return (
              <li key={o.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className={cn('flex items-center gap-1.5', mine && 'font-semibold text-ink')}>
                    {mine && <CheckCircle2 className="size-4 text-ok" aria-label="Your vote" />}
                    {o.label}
                  </span>
                  <span className="font-display tabular-nums text-mute">
                    {pct}% <span className="sr-only">({votes} votes)</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className={cn('h-full rounded-full', mine ? 'bg-[linear-gradient(90deg,#fbbf24,#f472b6)]' : 'bg-ultra/70')}
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </li>
            );
          })}
          <li className="pt-1 text-xs text-mute">
            {total} {total === 1 ? 'vote' : 'votes'} recorded on this website
          </li>
        </ul>
      ) : myVote ? (
        <p className="flex items-center gap-2 rounded-xl bg-ok/10 p-4 text-sm text-green-200">
          <CheckCircle2 className="size-5" aria-hidden /> Thanks for voting! Results will be shown when the poll closes.
        </p>
      ) : open ? (
        <fieldset aria-labelledby={legendId} className="space-y-2.5">
          {poll.options.map((o) => (
            <label
              key={o.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition',
                selected === o.id ? 'border-blush bg-neon/10' : 'border-line bg-surface/60 hover:border-white/25',
              )}
            >
              <input
                type="radio"
                name={legendId}
                value={o.id}
                checked={selected === o.id}
                onChange={() => setSelected(o.id)}
                className="size-4 accent-fuchsia-500"
              />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="flex items-center gap-2 text-sm text-mute">
          <BarChart3 className="size-4" aria-hidden /> Results for this poll are private.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        {poll.ends_at && <p className="text-xs text-mute">{open ? 'Closes' : 'Closed'} {formatDateTime(poll.ends_at)}</p>}
        {open && !myVote && (
          <Button onClick={submit} loading={busy} disabled={!selected} size="sm">
            Submit vote
          </Button>
        )}
      </div>
    </article>
  );
}
