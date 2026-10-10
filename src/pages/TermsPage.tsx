import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { SITE } from '../config/site';

export function TermsPage() {
  const { profile } = useProfile();
  usePageMeta('Terms of Use', `Terms and guidelines for using the ${profile.gaming_name} website.`);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Guidelines & Rules"
        title="Terms of"
        highlight="Use"
        description="Community conduct, platform usage guidelines, and intellectual property notices."
      />

      <PageContainer className="py-12 max-w-4xl space-y-8 text-mute leading-relaxed">
        <div className="panel p-6 sm:p-10 space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">1. Acceptance of Terms</h2>
            <p>
              By accessing this website, you agree to comply with these terms, community standards, and applicable local laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">2. Community Standards</h2>
            <p>
              When interacting with the platform (voting in polls, submitting suggestions, or participating in challenges):
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Do not submit abusive, harassing, defamatory, or hateful content.</li>
              <li>Do not post unsolicited advertisements, spam, game cheats, or phishing links.</li>
              <li>Respect fellow members of the community and the creator at all times.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">3. Intellectual Property and Disclaimers</h2>
            <p>
              All video content, gameplay audio, and livestreams remain the property of their respective creators and YouTube.
            </p>
            <p>
              <strong>Disclaimer:</strong> {SITE.disclaimer} All game names, marks, and related imagery are trademarks of their respective owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">4. Fan-Made Concept Notice</h2>
            <p>
              This website is an unofficial showcase and portfolio concept until officially adopted or endorsed by the creator.
            </p>
          </section>

          <p className="text-xs text-mute/80 pt-4 border-t border-line">
            Last updated: October 2026.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
