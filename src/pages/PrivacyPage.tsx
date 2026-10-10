import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { SITE } from '../config/site';

export function PrivacyPage() {
  const { profile } = useProfile();
  usePageMeta('Privacy Policy', `Privacy policy for ${profile.gaming_name}'s creator website.`);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Legal & Privacy"
        title="Privacy"
        highlight="Policy"
        description="We respect your privacy and process minimal visitor information."
      />

      <PageContainer className="py-12 max-w-4xl space-y-8 text-mute leading-relaxed">
        <div className="panel p-6 sm:p-10 space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">1. Overview</h2>
            <p>
              This website is an unofficial fan-made creator platform concept for <strong>{profile.gaming_name}</strong>.
              We take privacy seriously and adhere to data minimization principles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">2. Information Collected</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Contact Form:</strong> When you submit a business inquiry, we collect your name, email, inquiry type, and message strictly to respond to your request.
              </li>
              <li>
                <strong>Fan Suggestions:</strong> When submitting stream ideas or challenges, we collect your message and optional display name.
              </li>
              <li>
                <strong>Poll Votes:</strong> When voting in community polls, an anonymous session token or local storage identifier is used to prevent duplicate voting. We do not link poll responses to personal identities.
              </li>
              <li>
                <strong>Third-Party Embeds:</strong> YouTube video previews only connect to YouTube's privacy-enhanced domain (<code>youtube-nocookie.com</code>) when you actively click to play a video.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">3. Analytics and Cookies</h2>
            <p>
              We do not use intrusive tracking cookies or sell your personal data. Standard web server logs may temporarily record IP addresses and user-agent strings for security and rate-limiting purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">4. Third-Party Services</h2>
            <p>
              This website provides links to external services such as YouTube, Instagram, and Discord. Each platform operates under its own privacy policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">5. Disclaimer</h2>
            <p>{SITE.disclaimer}</p>
          </section>

          <p className="text-xs text-mute/80 pt-4 border-t border-line">
            Last updated: October 2026.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
