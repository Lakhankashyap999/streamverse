import { useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { SUGGESTION_TYPES, type SuggestionType } from '../../types';
import { suggestionService } from '../../services/communityService';
import { hasErrors, validateSuggestion } from '../../utils/validation';
import { friendlyError } from '../../utils/misc';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';

export function SuggestionForm() {
  const [form, setForm] = useState({ type: 'stream_idea' as SuggestionType, message: '', display_name: '', website: '' });
  const [errors, setErrors] = useState<ReturnType<typeof validateSuggestion>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const startedAt = useRef(Date.now());

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateSuggestion(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    // Honeypot + minimum fill time: silently drop obvious bots.
    if (form.website || Date.now() - startedAt.current < 2500) {
      setServerError('Please take a moment and try again.');
      setState('error');
      return;
    }
    setState('sending');
    try {
      await suggestionService.submit(form);
      setState('done');
    } catch (err) {
      setServerError(friendlyError(err));
      setState('error');
    }
  };

  if (state === 'done')
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl border border-ok/30 bg-ok/10 p-8 text-center">
        <CheckCircle2 className="size-10 text-ok" aria-hidden />
        <h3 className="text-xl font-semibold">Suggestion received!</h3>
        <p className="max-w-sm text-mute">It's now waiting for review. Approved ideas may be featured on this page.</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setForm({ type: 'stream_idea', message: '', display_name: '', website: '' });
            startedAt.current = Date.now();
            setState('idle');
          }}
        >
          Send another
        </Button>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Suggestion type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as SuggestionType })}
          error={errors.type}
          required
        >
          {SUGGESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Input
          label="Display name"
          hint="Optional — shown if your idea is featured."
          value={form.display_name}
          maxLength={40}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          error={errors.display_name}
          autoComplete="nickname"
        />
      </div>
      <Textarea
        label="Your idea"
        required
        maxLength={600}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        error={errors.message}
        hint={`${form.message.trim().length}/600 · Please don't include personal information.`}
        placeholder="e.g. A squad rush stream where chat picks the drop spot!"
      />
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </label>
      </div>
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-300">
          {serverError}
        </p>
      )}
      <Button type="submit" loading={state === 'sending'} icon={<Send className="size-4" aria-hidden />}>
        Send suggestion
      </Button>
      <p className="text-xs text-mute">Suggestions are private until reviewed and approved by the creator.</p>
    </form>
  );
}
