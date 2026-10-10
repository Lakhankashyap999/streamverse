import { useRef, useState, type FormEvent } from 'react';
import { Mail, Send, CheckCircle2, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { contactService } from '../services/communityService';
import { validateContact, hasErrors, type ContactInput } from '../utils/validation';
import { friendlyError } from '../utils/misc';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { ENQUIRY_TYPES } from '../types';
import { SocialIconRow } from '../components/layout/SocialLinks';

export function ContactPage() {
  const { profile } = useProfile();
  usePageMeta('Business Contact', `Official business inquiries, brand sponsorships, and event invitations for ${profile.gaming_name}.`);

  const [form, setForm] = useState<ContactInput & { honeypot: string }>({
    name: '',
    email: '',
    enquiry_type: 'Sponsorship',
    message: '',
    consent: false,
    honeypot: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const startedAt = useRef(Date.now());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateContact(form);
    setErrors(errs);
    if (hasErrors(errs)) return;

    // Spam defense: honeypot + fast-submit check
    if (form.honeypot || Date.now() - startedAt.current < 2000) {
      setServerError('Please take a moment before submitting.');
      setState('error');
      return;
    }

    setState('sending');
    setServerError('');

    try {
      await contactService.submit({
        name: form.name,
        email: form.email,
        enquiry_type: form.enquiry_type,
        message: form.message,
      });
      setState('success');
    } catch (err) {
      setServerError(friendlyError(err, 'Could not send message. Please try again.'));
      setState('error');
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Direct Comms"
        title="Business"
        highlight="Inquiries"
        description="For brand partnerships, gaming sponsorships, event invitations, or creator collaborations."
      />

      <PageContainer className="py-12 space-y-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-start">
          {/* Left: Contact Form */}
          <div className="panel p-6 sm:p-10 space-y-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="size-6 text-gold" /> Send a Business Message
              </h2>
              <p className="text-sm text-mute mt-1">
                All business messages are logged securely in the creator's inbox.
              </p>
            </div>

            {state === 'success' ? (
              <div
                role="status"
                className="flex flex-col items-center gap-4 rounded-2xl border border-ok/40 bg-ok/10 p-8 text-center"
              >
                <CheckCircle2 className="size-12 text-ok" aria-hidden />
                <h3 className="text-2xl font-bold text-ink">Message Sent Successfully!</h3>
                <p className="max-w-md text-mute">
                  Thank you, <strong className="text-ink">{form.name}</strong>. Your inquiry has been delivered to the creator's management inbox.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setForm({
                      name: '',
                      email: '',
                      enquiry_type: 'Sponsorship',
                      message: '',
                      consent: false,
                      honeypot: '',
                    });
                    startedAt.current = Date.now();
                    setState('idle');
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Your Name / Organization"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g. Rahul Sharma / Brand Name"
                    autoComplete="name"
                  />
                  <Input
                    label="Business Email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>

                <Select
                  label="Inquiry Type"
                  required
                  value={form.enquiry_type}
                  onChange={(e) => setForm({ ...form, enquiry_type: e.target.value })}
                  error={errors.enquiry_type}
                >
                  {ENQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>

                <Textarea
                  label="Your Message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  error={errors.message}
                  hint={`${form.message.length}/2000 characters`}
                  placeholder="Tell us about the project, timelines, and collaboration details..."
                />

                {/* Consent checkbox */}
                <div className="space-y-1">
                  <label className="flex items-start gap-3 cursor-pointer text-sm text-mute">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      className="mt-1 size-4 accent-fuchsia-500 rounded"
                    />
                    <span>
                      I consent to having this information used exclusively for the purpose of responding to this business inquiry.
                    </span>
                  </label>
                  {errors.consent && (
                    <p role="alert" className="text-xs text-red-300">
                      {errors.consent}
                    </p>
                  )}
                </div>

                {/* Hidden Honeypot field */}
                <div className="hidden" aria-hidden>
                  <label>
                    Leave this empty
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.honeypot}
                      onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                    />
                  </label>
                </div>

                {state === 'error' && (
                  <p role="alert" className="text-sm text-red-300 flex items-center gap-2">
                    <ShieldAlert className="size-4 shrink-0" /> {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={state === 'sending'}
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<Send className="size-4" />}
                >
                  Send Inquiry
                </Button>
              </form>
            )}
          </div>

          {/* Right: Info & Guidelines */}
          <div className="space-y-8">
            <div className="panel p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gold">
                <Sparkles className="size-5" /> Official Business Guidelines
              </h3>
              <ul className="space-y-3 text-sm text-mute">
                <li className="flex gap-2">
                  <span className="text-gold font-bold">✓</span>
                  Gaming brand sponsorships & hardware endorsements
                </li>
                <li className="flex gap-2">
                  <span className="text-gold font-bold">✓</span>
                  BGMI esports tournament invites & caster collaborations
                </li>
                <li className="flex gap-2">
                  <span className="text-gold font-bold">✓</span>
                  Content collaborations with verified creator channels
                </li>
                <li className="flex gap-2 text-bad">
                  <span className="font-bold">✗</span>
                  No account recovery, UC selling, or game cheat solicitations
                </li>
              </ul>
            </div>

            <div className="panel p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-blush">
                <MessageSquare className="size-5" /> Connect on Socials
              </h3>
              <p className="text-sm text-mute">
                For fan messages and chat, connect during live streams or on official community channels:
              </p>
              <SocialIconRow profile={profile} size="md" />
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
