import { Trophy, Heart, Monitor, Calendar, MapPin, Copy } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { SafeImage, SectionHeading } from '../components/ui/Display';
import { SocialIconRow } from '../components/layout/SocialLinks';
import { useToast } from '../components/ui/Toast';
import { SITE } from '../config/site';
import { PubgCareerStats } from '../components/home/PubgCareerStats';
import { MythicCharacterShowcase } from '../components/about/MythicCharacterShowcase';

export function AboutPage() {
  const { profile } = useProfile();
  usePageMeta('About Me', `Learn more about ${profile.gaming_name} — BGMI streamer, rank pusher, setup details and gaming journey.`);
  const toast = useToast();

  const copyId = async () => {
    if (!profile.game_id) return;
    try {
      await navigator.clipboard.writeText(profile.game_id);
      toast('BGMI Game ID copied!', 'success');
    } catch {
      toast('Failed to copy ID', 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Profile Dossier"
        title="About"
        highlight={profile.gaming_name}
        description="The story behind the streams, rank push philosophy, equipment, and our growing gaming family."
      />

      <PageContainer className="py-12 space-y-16">
        {/* 1. Bio & Overview Grid */}
        <section aria-labelledby="bio-heading">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] items-center">
            <div className="relative max-w-md mx-auto lg:max-w-none w-full">
              <div className="gradient-border hud-corners overflow-hidden rounded-3xl bg-card p-2 shadow-2xl">
                <SafeImage
                  src="/images/creator/khushi-about-hd.jpg"
                  alt={`${profile.gaming_name} official portrait`}
                  className="w-full aspect-[4/5] object-cover object-[center_12%] rounded-2xl filter brightness-105 contrast-105"
                  width={852}
                  height={1024}
                  fetchPriority="high"
                  loading="eager"
                />
              </div>
              {/* Cute Mascot sticker */}
              <div className="absolute -top-3 -left-3 glass px-3 py-1.5 rounded-2xl flex items-center gap-2 border border-pink-400/50 shadow-xl bg-card/90 backdrop-blur-md">
                <img src="/images/art/pink-gamer-teddy.jpg" alt="Mascot" className="size-8 rounded-lg object-cover" />
                <span className="font-display text-xs font-bold text-white flex items-center gap-1">Teddy Buddy 🧸</span>
              </div>
              {profile.country && (
                <div className="absolute -bottom-4 right-6 glass px-4 py-2 rounded-xl flex items-center gap-2 font-display text-sm font-semibold text-ink shadow-xl">
                  <MapPin className="size-4 text-blush" /> {profile.country}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p className="hud-label mb-2">Creator Bio</p>
                <h2 id="bio-heading" className="text-3xl sm:text-4xl font-bold">
                  Hey, I'm <span className="text-gradient-gold">{profile.gaming_name}</span>!
                </h2>
                {profile.tagline && <p className="text-lg text-mute font-medium mt-1">{profile.tagline}</p>}
              </div>

              <p className="text-lg text-mute leading-relaxed">{profile.bio}</p>

              {profile.game_id && (
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={copyId}
                    className="clip-angle-sm group flex items-center gap-3 border border-gold/30 bg-gold/5 px-5 py-2.5 transition hover:bg-gold/10"
                    aria-label={`Copy BGMI ID ${profile.game_id}`}
                  >
                    <div>
                      <span className="block font-display text-[0.62rem] font-semibold uppercase tracking-widest text-gold">
                        Official BGMI ID
                      </span>
                      <span className="font-display text-lg font-bold tabular-nums tracking-wider">{profile.game_id}</span>
                    </div>
                    <Copy className="size-4 text-mute group-hover:text-gold" />
                  </button>
                  <SocialIconRow profile={profile} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 1.5 Compact 3D In-Game Mythic Character Turntable */}
        <section aria-labelledby="mythic-avatar-heading">
          <SectionHeading
            eyebrow="In-Game Character"
            title="Mythic X-Suit"
            highlight="3D Showcase"
            id="mythic-avatar-heading"
            description="Auto-rotating 3D lobby turntable — drag or swipe left/right to inspect Front & Back armor from any angle."
          />
          <MythicCharacterShowcase />
        </section>

        {/* 2. Live Combat Telemetry & Career Stats */}
        <PubgCareerStats />

        {/* 3. Gaming Journey */}
        <section aria-labelledby="journey-heading">
          <SectionHeading
            eyebrow="Battle History"
            title="Gaming"
            highlight="Journey"
            id="journey-heading"
            description="From the first parachute drop to marathon rank pushes on YouTube."
          />
          <div className="panel p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <Calendar className="size-6" />
              <h3 className="text-xl font-bold">The Road to Top 100</h3>
            </div>
            <p className="text-mute text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {profile.journey ||
                'The journey began with a passion for tactical shooters and fast-paced mobile battle-royale action. Streaming regularly, building a friendly, hype community, and pushing the conqueror ranks has made every match memorable.'}
            </p>
          </div>
        </section>

        {/* 3. Favourite Modes & Playstyle */}
        {profile.favourite_modes && profile.favourite_modes.length > 0 && (
          <section aria-labelledby="modes-heading">
            <SectionHeading
              eyebrow="Tactical Specialty"
              title="Favourite"
              highlight="Game Modes"
              id="modes-heading"
              description="Preferred playlists and tactical combat styles in BGMI."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profile.favourite_modes.map((mode, i) => (
                <div key={mode} className="panel p-6 space-y-3">
                  <span className="grid size-12 place-items-center rounded-xl bg-neon/15 text-blush font-display font-bold text-lg">
                    0{i + 1}
                  </span>
                  <h3 className="text-xl font-bold">{mode}</h3>
                  <p className="text-sm text-mute">
                    High intensity, smart positioning, and coordinated squad comms to secure the Chicken Dinner.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Gaming Setup & Gear (if provided) */}
        <section aria-labelledby="setup-heading">
          <SectionHeading
            eyebrow="Loot & Hardware"
            title="Gaming"
            highlight="Setup"
            id="setup-heading"
            description="The stream gear and battle station powering the live broadcasts."
          />
          <div className="panel p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-blush">
              <Monitor className="size-6" />
              <h3 className="text-xl font-bold">Stream Gear & Devices</h3>
            </div>
            <p className="text-mute text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {profile.setup ||
                'Device & stream hardware information will be updated here by the creator. (Editable from the Creator Dashboard > Profile)'}
            </p>
          </div>
        </section>

        {/* 5. Achievements (if provided) */}
        <section aria-labelledby="achievements-heading">
          <SectionHeading
            eyebrow="Medal Case"
            title="Milestones &"
            highlight="Achievements"
            id="achievements-heading"
            description="Major milestones achieved with the support of the community."
          />
          <div className="panel p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <Trophy className="size-6" />
              <h3 className="text-xl font-bold">Competitive & Channel Highlights</h3>
            </div>
            <p className="text-mute text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {profile.achievements ||
                'Tournament entries, Conqueror rank titles, and community growth milestones. (Editable from the Creator Dashboard > Profile)'}
            </p>
          </div>
        </section>

        {/* 6. Message to the Community */}
        <section aria-labelledby="message-heading">
          <div className="gradient-border rounded-3xl bg-gradient-to-r from-card to-card-2 p-8 sm:p-12 text-center space-y-4">
            <Heart className="size-10 text-blush mx-auto animate-pulse" />
            <h2 id="message-heading" className="text-2xl sm:text-3xl font-bold">
              Message to the <span className="text-gradient font-script italic">{SITE.communityName}</span>
            </h2>
            <p className="max-w-2xl mx-auto text-mute sm:text-lg leading-relaxed">
              "{profile.community_message || 'Thank you for watching, chatting, and being part of the family! See you in the next stream!'}"
            </p>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
