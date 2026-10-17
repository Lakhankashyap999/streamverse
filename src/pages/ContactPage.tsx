import { useRef, useState, type FormEvent } from 'react';
import { Mail, Send, CheckCircle2, ShieldAlert, Sparkles, MessageSquare, BarChart3, Tv, Trophy, Video, Cpu, ArrowDownRight } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { contactService } from '../services/communityService';
import { validateContact, hasErrors, type ContactInput } from '../utils/validation';
import { friendlyError } from '../utils/misc';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { SectionHeading } from '../components/ui/Display';
import { ENQUIRY_TYPES } from '../types';
import { SocialIconRow } from '../components/layout/SocialLinks';

type EnquiryType = (typeof ENQUIRY_TYPES)[number];

interface CollabFormat {
  title: string;
  tag: string;
  enquiryType: EnquiryType;
  description: string;
  template: string;
  accent: string;
  icon: typeof Tv;
}

const COLLAB_FORMATS: CollabFormat[] = [
  {
    title: 'Live Stream Brand Overlay & Shoutouts',
    tag: '6–8 Hr Daily Live Reach',
    enquiryType: 'Sponsorship',
    description: 'On-screen brand logo overlay, pinned live chat CTA link, and verbal shoutouts during marathon BGMI rank-push broadcasts.',
    template: 'Hi KhushiYT Team, we would like to discuss a Live Stream Brand Overlay & Pinned Chat Sponsorship for upcoming BGMI broadcasts.',
    accent: '#fbbf24',
    icon: Tv,
  },
  {
    title: 'Sponsored BGMI Custom Room Tournaments',
    tag: '100 Players / Lobby + Live Viewers',
    enquiryType: 'Event / Tournament',
    description: 'Host branded Erangel Squad or TDM Custom Room lobbies where hundreds of active BGMI players compete live on stream.',
    template: 'Hi KhushiYT Team, we want to sponsor a branded BGMI Custom Room Tournament / Event on your YouTube channel.',
    accent: '#f472b6',
    icon: Trophy,
  },
  {
    title: 'Instagram Reels & YouTube Shorts Campaign',
    tag: '@igkhusi + @khusiytlive',
    enquiryType: 'Collaboration',
    description: 'High-retention gaming reels, creator lifestyle integrations, and YouTube Shorts cross-promoted to 37K+ combined followers.',
    template: 'Hi KhushiYT Team, we are interested in a dedicated Instagram Reel (@igkhusi) & YouTube Shorts brand collaboration.',
    accent: '#a855f7',
    icon: Video,
  },
  {
    title: 'Gaming Gear, App & Peripheral Endorsement',
    tag: 'Hardware & Gaming Apps',
    enquiryType: 'Sponsorship',
    description: 'Authentic hands-on showcase of gaming smartphones, IEMs/headsets, finger sleeves, or gaming platforms.',
    template: 'Hi KhushiYT Team, we would love to send our gaming product / app for an official review and stream endorsement.',
    accent: '#38bdf8',
    icon: Cpu,
  },
];

export function ContactPage() {
  const { profile } = useProfile();
  usePageMeta('Business & Media Kit', `Official Brand Media Kit, sponsorship metrics, and business inquiries for ${profile.gaming_name}.`);

  const formRef = useRef<HTMLDivElement>(null);

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

  const handleSelectPackage = (pkg: CollabFormat) => {
    setForm((prev) => ({
      ...prev,
      enquiry_type: pkg.enquiryType,
      message: prev.message.trim() ? prev.message : pkg.template,
    }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        eyebrow="Brand Partnerships & Media Kit"
        title="Work With"
        highlight={profile.gaming_name}
        description="Official Creator Media Kit, verified audience reach, sponsorship formats, and direct business inquiry desk."
      />

      <PageContainer className="py-12 space-y-16">
        {/* 1. Official Creator Media Kit & Verified Reach */}
        <section aria-labelledby="media-kit-heading">
          <SectionHeading
            eyebrow="Official Media Kit // 2026"
            title="Verified Reach &"
            highlight="Sponsorship Formats"
            id="media-kit-heading"
            description="Key channel metrics and high-conversion partnership formats for gaming brands, esports organizers, and agencies."
          />

          <div className="space-y-6">
            {/* 4 Key Reach Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              <div className="panel p-4 sm:p-6 border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-card space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                  <BarChart3 className="size-3.5" /> YouTube Subscribers
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {profile.stats_snapshot?.subscribers || '27.6K'}+
                </div>
                <div className="text-xs text-slate-400">Official Channel: @khusiytlive</div>
              </div>

              <div className="panel p-4 sm:p-6 border border-pink-400/30 bg-gradient-to-br from-pink-500/10 to-card space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-pink-300 flex items-center gap-1.5">
                  <Tv className="size-3.5" /> Total Channel Views
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {profile.stats_snapshot?.views || '1.96M+'}
                </div>
                <div className="text-xs text-slate-400">High-retention BGMI live & shorts</div>
              </div>

              <div className="panel p-4 sm:p-6 border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-card space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                  <Trophy className="size-3.5" /> Live Broadcasts
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {profile.stats_snapshot?.videos || '1.1K'}+
                </div>
                <div className="text-xs text-slate-400">6–8 Hr daily marathon sessions</div>
              </div>

              <div className="panel p-4 sm:p-6 border border-sky-400/30 bg-gradient-to-br from-sky-500/10 to-card space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-sky-300 flex items-center gap-1.5">
                  <Video className="size-3.5" /> Instagram Reach
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {profile.stats_snapshot?.instagram_followers || '9,416'}+
                </div>
                <div className="text-xs text-slate-400">Official Handle: @igkhusi</div>
              </div>
            </div>

            {/* 4 Click-to-Select Collaboration Format Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {COLLAB_FORMATS.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <div
                    key={pkg.title}
                    className="panel p-5 sm:p-6 border border-white/10 hover:border-amber-400/40 transition flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                          style={{ color: pkg.accent }}
                        >
                          <Icon className="size-3.5" /> {pkg.tag}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[10px] font-bold text-slate-300">
                          {pkg.enquiryType}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white">{pkg.title}</h3>
                      <p className="text-xs sm:text-sm text-mute leading-relaxed">{pkg.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Click to pre-fill inquiry form
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectPackage(pkg)}
                        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-300 hover:text-amber-200 transition cursor-pointer"
                      >
                        Select Format <ArrowDownRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Direct Business Inquiry Form & Guidelines */}
        <div ref={formRef} className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-start scroll-mt-24">
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
