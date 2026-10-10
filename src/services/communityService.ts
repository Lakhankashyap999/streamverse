import type { ContactMessage, Suggestion, SuggestionType } from '../types';
import { FriendlyError, uid } from '../utils/misc';
import { createCrudService, logDev } from './crud';
import { demoDelay, demoStore } from './demoStore';
import { ensureVisitorSession, supabase } from './supabaseClient';

const SUGGESTION_COLUMNS = 'id,type,message,display_name,status,is_published,created_at,reviewed_at';

const suggestionCrud = createCrudService<Suggestion>({
  table: 'suggestions',
  label: 'suggestions',
  columns: SUGGESTION_COLUMNS,
  order: { column: 'created_at', ascending: false },
  publicQuery: (q) => q.eq('status', 'approved').eq('is_published', true),
  publicFilter: (s) => s.status === 'approved' && s.is_published,
});

function mapSubmitError(msg: string): never {
  if (msg.includes('rate_limited')) throw new FriendlyError("You've sent a few already — please try again in a little while.");
  if (msg.includes('invalid')) throw new FriendlyError('Please check your message and try again.');
  throw new FriendlyError("We couldn't send that right now. Please try again later.");
}

export const suggestionService = {
  ...suggestionCrud,

  /** Submissions are stored as `pending` and are never public until approved AND published. */
  async submit(input: { type: SuggestionType; message: string; display_name: string }): Promise<void> {
    if (!supabase) {
      await demoDelay(400);
      const row: Suggestion = {
        id: uid(),
        type: input.type,
        message: input.message.trim(),
        display_name: input.display_name.trim() || null,
        status: 'pending',
        is_published: false,
        created_at: new Date().toISOString(),
        reviewed_at: null,
      };
      demoStore.write('suggestions', [row, ...demoStore.read<Suggestion>('suggestions')]);
      return;
    }
    await ensureVisitorSession();
    const { error } = await supabase.rpc('submit_suggestion', {
      p_type: input.type,
      p_message: input.message.trim(),
      p_display_name: input.display_name.trim() || null,
    });
    if (error) {
      logDev(error);
      mapSubmitError(error.message ?? '');
    }
  },

  async review(id: string, status: Suggestion['status'], is_published = false) {
    return suggestionCrud.update(id, { status, is_published: status === 'approved' && is_published, reviewed_at: new Date().toISOString() });
  },
};

const contactCrud = createCrudService<ContactMessage>({
  table: 'contact_messages',
  label: 'messages',
  order: { column: 'created_at', ascending: false },
});

export const contactService = {
  listAll: contactCrud.listAll,
  update: contactCrud.update,
  remove: contactCrud.remove,

  /** Resolves only when the message has actually been stored. */
  async submit(input: { name: string; email: string; enquiry_type: string; message: string }): Promise<void> {
    if (!supabase) {
      await demoDelay(500);
      const row: ContactMessage = { ...input, id: uid(), status: 'new', created_at: new Date().toISOString() };
      demoStore.write('contact_messages', [row, ...demoStore.read<ContactMessage>('contact_messages')]);
      return;
    }
    await ensureVisitorSession();
    const { error } = await supabase.rpc('submit_contact', {
      p_name: input.name.trim(),
      p_email: input.email.trim(),
      p_enquiry_type: input.enquiry_type,
      p_message: input.message.trim(),
    });
    if (error) {
      logDev(error);
      mapSubmitError(error.message ?? '');
    }
  },
};
