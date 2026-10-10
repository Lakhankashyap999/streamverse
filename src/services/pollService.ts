import type { Poll, PollResult } from '../types';
import { FriendlyError } from '../utils/misc';
import { validatePollOptions } from '../utils/validation';
import { createCrudService, logDev } from './crud';
import { demoDelay, demoStore } from './demoStore';
import { ensureVisitorSession, supabase } from './supabaseClient';

const crud = createCrudService<Poll>({
  table: 'polls',
  label: 'polls',
  order: { column: 'created_at', ascending: false },
  publicQuery: (q) => q.in('status', ['active', 'closed']),
  publicFilter: (p) => p.status === 'active' || p.status === 'closed',
});

interface DemoVote {
  id: string;
  poll_id: string;
  option_id: string;
  created_at: string;
}

export function isPollOpen(p: Poll): boolean {
  if (p.status !== 'active') return false;
  const now = Date.now();
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
  if (p.ends_at && new Date(p.ends_at).getTime() <= now) return false;
  return true;
}

export function canSeeResults(p: Poll, votedOption: string | null, isCreator = false): boolean {
  if (isCreator) return true;
  if (p.results_visibility === 'always') return true;
  if (p.results_visibility === 'after_vote') return Boolean(votedOption) || !isPollOpen(p);
  return !isPollOpen(p);
}

export const pollService = {
  ...crud,

  async create(input: Partial<Poll>) {
    const err = validatePollOptions((input.options ?? []).map((o) => o.label));
    if (err) throw new FriendlyError(err);
    return crud.create(input);
  },

  async update(id: string, patch: Partial<Poll>) {
    if (patch.options) {
      const err = validatePollOptions(patch.options.map((o) => o.label));
      if (err) throw new FriendlyError(err);
    }
    return crud.update(id, patch);
  },

  /** Returns the option this visitor already voted for, if any. */
  async myVote(pollId: string): Promise<string | null> {
    if (!supabase) {
      return demoStore.read<DemoVote>('poll_votes').find((v) => v.poll_id === pollId)?.option_id ?? null;
    }
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) return null;
    const { data, error } = await supabase.rpc('my_poll_vote', { p_poll_id: pollId });
    if (error) {
      logDev(error);
      return null;
    }
    return (data as string | null) ?? null;
  },

  /** Server-enforced: one vote per visitor session, valid option, poll open. */
  async vote(pollId: string, optionId: string): Promise<void> {
    if (!supabase) {
      await demoDelay(300);
      const votes = demoStore.read<DemoVote>('poll_votes');
      if (votes.some((v) => v.poll_id === pollId)) throw new FriendlyError("You've already voted in this poll.");
      demoStore.write('poll_votes', [
        ...votes,
        { id: crypto.randomUUID(), poll_id: pollId, option_id: optionId, created_at: new Date().toISOString() },
      ]);
      return;
    }
    const ok = await ensureVisitorSession();
    if (!ok) throw new FriendlyError('Voting is temporarily unavailable. Please try again later.');
    const { error } = await supabase.rpc('cast_vote', { p_poll_id: pollId, p_option_id: optionId });
    if (error) {
      logDev(error);
      const msg = error.message ?? '';
      if (msg.includes('already_voted')) throw new FriendlyError("You've already voted in this poll.");
      if (msg.includes('poll_closed')) throw new FriendlyError('This poll is no longer accepting votes.');
      if (msg.includes('rate_limited')) throw new FriendlyError('Too many attempts. Please wait a moment.');
      throw new FriendlyError("Your vote couldn't be recorded. Please try again.");
    }
  },

  /** Results are only returned by the server when the poll's visibility rules allow it. */
  async results(pollId: string): Promise<PollResult[]> {
    if (!supabase) {
      const votes = demoStore.read<DemoVote>('poll_votes').filter((v) => v.poll_id === pollId);
      const counts = new Map<string, number>();
      votes.forEach((v) => counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1));
      return [...counts].map(([option_id, votes]) => ({ option_id, votes }));
    }
    const { data, error } = await supabase.rpc('get_poll_results', { p_poll_id: pollId });
    if (error) {
      logDev(error);
      throw new FriendlyError("Results aren't available right now.");
    }
    return ((data ?? []) as { option_id: string; votes: number | string }[]).map((r) => ({
      option_id: r.option_id,
      votes: Number(r.votes),
    }));
  },
};
