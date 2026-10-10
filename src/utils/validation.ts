/** Form validation helpers shared by public forms and the dashboard. */

export type Errors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (v: string) => EMAIL_RE.test(v.trim()) && v.trim().length <= 254;

export function lengthBetween(v: string, min: number, max: number): boolean {
  const n = v.trim().length;
  return n >= min && n <= max;
}

/** Rejects text that is mostly links — a cheap but effective spam signal. */
export function looksLikeSpam(text: string): boolean {
  const links = (text.match(/https?:\/\//gi) ?? []).length;
  return links > 2 || /(.)\1{14,}/.test(text);
}

export interface ContactInput {
  name: string;
  email: string;
  enquiry_type: string;
  message: string;
  consent: boolean;
}

export function validateContact(v: ContactInput): Errors<keyof ContactInput> {
  const e: Errors<keyof ContactInput> = {};
  if (!lengthBetween(v.name, 2, 80)) e.name = 'Please enter your name (2–80 characters).';
  if (!isEmail(v.email)) e.email = 'Please enter a valid email address.';
  if (!v.enquiry_type) e.enquiry_type = 'Please choose an enquiry type.';
  if (!lengthBetween(v.message, 20, 2000)) e.message = 'Your message should be 20–2000 characters.';
  else if (looksLikeSpam(v.message)) e.message = 'Please remove extra links from your message.';
  if (!v.consent) e.consent = 'Please confirm you agree to be contacted about this enquiry.';
  return e;
}

export function validateSuggestion(v: { type: string; message: string; display_name: string }) {
  const e: Errors<'type' | 'message' | 'display_name'> = {};
  if (!v.type) e.type = 'Pick a suggestion type.';
  if (!lengthBetween(v.message, 10, 600)) e.message = 'Suggestions should be 10–600 characters.';
  else if (looksLikeSpam(v.message)) e.message = 'Links are not allowed in suggestions.';
  if (v.display_name.trim().length > 40) e.display_name = 'Keep your name under 40 characters.';
  return e;
}

/** Poll options must be 2–6 distinct, non-empty labels. */
export function validatePollOptions(labels: string[]): string | null {
  const cleaned = labels.map((l) => l.trim()).filter(Boolean);
  if (cleaned.length < 2) return 'Add at least two options.';
  if (cleaned.length > 6) return 'A poll can have at most six options.';
  if (cleaned.some((l) => l.length > 80)) return 'Each option must be 80 characters or fewer.';
  const lower = cleaned.map((l) => l.toLowerCase().replace(/\s+/g, ' '));
  if (new Set(lower).size !== lower.length) return 'Each option must be different.';
  return null;
}

export const hasErrors = (e: Record<string, unknown>) => Object.values(e).some(Boolean);
