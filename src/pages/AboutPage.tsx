import { useState } from 'react';
import { Trophy, Heart, Monitor, Calendar, MapPin, Copy, Crosshair, Sliders, Sparkles, Crown, Flame, CheckCircle2, ExternalLink } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { PageHeader, PageContainer } from '../components/layout/PageContainer';
import { SafeImage, SectionHeading } from '../components/ui/Display';
import { SocialIconRow } from '../components/layout/SocialLinks';
import { useToast } from '../components/ui/Toast';
import { SITE, youtubeSubscribeUrl } from '../config/site';
import { PubgCareerStats } from '../components/home/PubgCareerStats';
import { MythicCharacterShowcase } from '../components/about/MythicCharacterShowcase';

const SENSI_CODE = '7307-1085-6780-4282-435';
const CONTROL_CODE = '7275-1790-4192-8810-092';

export function AboutPage() {
  const { profile } = useProfile();
  usePageMeta('About Me', `Learn more about ${profile.gaming_name} — BGMI streamer, sensitivity code, rank pusher, setup details and gaming journey.`);
  const toast = useToast();

  const [cheers, setCheers] = useState<{ love: number; dinner: number; clutch: number }>(() => {
    try {
      const saved = localStorage.getItem('khushi-fan-cheers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { love: 14824, dinner: 9452, clutch: 11296 };
  });
  const [activeBurst, setActiveBurst] = useState<'love' | 'dinner' | 'clutch' | null>(null);

  const handleCheer = (key: 'love' | 'dinner' | 'clutch', label: string) => {
    setCheers((prev) => {
      const next = { ...prev, [key]: prev[key] + 1 };
      try {
        localStorage.setItem('khushi-fan-cheers', JSON.stringify(next));
      } catch {}
      return next;
    });
    setActiveBurst(key);
    setTimeout(() => setActiveBurst(null), 500);
    toast(`${label} sent to ${profile.gaming_name}!`, 'success');
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label} copied!`, 'success');
    } catch {
      toast(`Couldn't copy ${label}`, 'error');
    }
  };

  const copyId = () => {
    if (!profile.game_id) return;
    copyText(profile.game_id, 'BGMI Game ID');
  };

  const upiId = profile.upi_id || '95997292@ybl';
  const membershipUrl = profile.membership_url || 'https://www.youtube.com/@khusiytlive/join';

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Profile Dossier"
        title="About"
        highlight={profile.gaming_name}
        description="The story behind the streams, pro BGMI sensitivity & control codes, rank push philosophy, and our growing gaming family."
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
                    className="clip-angle-sm group flex items-center gap-3 border border-gold/30 bg-gold/5 px-5 py-2.5 transition hover:bg-gold/10 cursor-pointer"
                    aria-label={`Copy BGMI ID ${profile.game_id}`}
                  >
                    <div className="text-left">
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

        {/* 1.5 Compact In-Game Mythic Character Showcase */}
        <section aria-labelledby="mythic-avatar-heading">
          <SectionHeading
            eyebrow="In-Game Character"
            title="Mythic X-Suit"
            highlight="Showcase"
            id="mythic-avatar-heading"
            description="KhushiYT's 7-Star Sovereign Hydro-Pharaoh X-Suit with official BGMI X-Laboratory upgrade & fragment breakdown."
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
                'Creating on YouTube since 22 March 2017. Today the channel is home to marathon BGMI livestreams — six-to-eight hour rank-push sessions full of rush gameplay, squad fights and fun with viewers.'}
            </p>
          </div>
        </section>

        {/* 3.5 Favourite Modes & Playstyle */}
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

        {/* 4. Pro BGMI Sensitivity, Control Codes & Gaming Setup */}
        <section aria-labelledby="setup-heading">
          <SectionHeading
            eyebrow="Pro Settings & Hardware"
            title="Sensitivity, Controls &"
            highlight="Gaming Setup"
            id="setup-heading"
            description="1-click copy KhushiYT's official BGMI sensitivity code, 4-finger claw control layout, and livestream hardware specs."
          />

          <div className="space-y-6">
            {/* 1-Click Copy Sensitivity & Control Code Vault */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="panel p-5 sm:p-6 border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-card to-card flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-[10px] font-black uppercase tracking-widest text-amber-300">
                    <Crosshair className="size-3" /> Zero-Recoil Gyro Sensitivity
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Official BGMI Sensitivity Code
                  </h3>
                  <p className="text-xs sm:text-sm text-mute">
                    Tuned for M416 + 4x/6x laser sprays & close-range AKM/UMP45 hipfire (Full Gyroscope Always On).
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <code className="px-3 py-2 rounded-xl bg-black/60 border border-amber-400/30 font-mono text-sm sm:text-base font-black text-amber-300 tracking-wider select-all">
                    {SENSI_CODE}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText(SENSI_CODE, 'BGMI Sensitivity Code')}
                    className="clip-angle-sm inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-display text-xs sm:text-sm font-black uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
                  >
                    <Copy className="size-4" /> Copy Sensi Code
                  </button>
                </div>
              </div>

              <div className="panel p-5 sm:p-6 border border-pink-400/30 bg-gradient-to-br from-pink-500/10 via-card to-card flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-pink-500/15 border border-pink-400/30 text-[10px] font-black uppercase tracking-widest text-pink-300">
                    <Sliders className="size-3" /> 4-Finger Claw HUD
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    4-Finger Claw Control Code
                  </h3>
                  <p className="text-xs sm:text-sm text-mute">
                    Fast jiggle movement, instant crouch-peek & fire, and quick scope-in layout for rush squad fights.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <code className="px-3 py-2 rounded-xl bg-black/60 border border-pink-400/30 font-mono text-sm sm:text-base font-black text-pink-300 tracking-wider select-all">
                    {CONTROL_CODE}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText(CONTROL_CODE, '4-Finger Control Code')}
                    className="clip-angle-sm inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
                  >
                    <Copy className="size-4" /> Copy Control Code
                  </button>
                </div>
              </div>
            </div>

            {/* Hardware & In-Game Config Grid */}
            <div className="panel p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 text-blush">
                <Monitor className="size-6" />
                <h3 className="text-xl font-bold">Stream Gear & In-Game Configuration</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Graphics & FPS</span>
                  <p className="text-base font-bold text-white">Smooth + Extreme+ (90/120 FPS)</p>
                  <p className="text-xs text-mute">Colorful Style • 130% Brightness • Anti-Aliasing 2x</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Gyroscope Tuning</span>
                  <p className="text-base font-bold text-white">Always On (300%–400%)</p>
                  <p className="text-xs text-mute">Red Dot: 320% • 3x: 265% • 4x: 210% • 6x: 145%</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Audio & Comms</span>
                  <p className="text-base font-bold text-white">Pro Gaming IEMs + Ultra Audio</p>
                  <p className="text-xs text-mute">Pinpoint footstep tracking & clear squad voice comms</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Live Broadcast</span>
                  <p className="text-base font-bold text-white">1080p 60FPS Zero-Lag Stream</p>
                  <p className="text-xs text-mute">6–8 Hr marathon TOP 100 rank-push setup</p>
                </div>
              </div>

              {profile.setup && !profile.setup.includes('Editable from') && (
                <p className="text-mute text-sm sm:text-base leading-relaxed pt-2 border-t border-white/10">
                  {profile.setup}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 5. Milestones & Achievements */}
        <section aria-labelledby="achievements-heading">
          <SectionHeading
            eyebrow="Medal Case"
            title="Milestones &"
            highlight="Achievements"
            id="achievements-heading"
            description="Major career & channel milestones unlocked together with the KhushiYT Family."
          />
          <div className="panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 text-gold">
              <Trophy className="size-6" />
              <h3 className="text-xl font-bold">Competitive & Channel Highlights</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">YouTube Squad</span>
                <p className="text-2xl font-black text-white">{profile.stats_snapshot?.subscribers || '27.6K'}+</p>
                <p className="text-xs text-slate-300">Active subscribers & daily live stream family</p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-400/25 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-300">Total Channel Views</span>
                <p className="text-2xl font-black text-white">{profile.stats_snapshot?.views || '1.96M+'}</p>
                <p className="text-xs text-slate-300">Across high-kill clutches, shorts & rank push streams</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-400/25 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">Broadcast Library</span>
                <p className="text-2xl font-black text-white">{profile.stats_snapshot?.videos || '1.1K'}+</p>
                <p className="text-xs text-slate-300">Full livestreams & competitive gameplay uploads</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Peak BGMI Tier</span>
                <p className="text-2xl font-black text-white">CONQUEROR</p>
                <p className="text-xs text-slate-300">TOP 100 Squad Rank Pusher & 7★ X-Suit Collector</p>
              </div>
            </div>

            {profile.achievements && !profile.achievements.includes('Editable from') && (
              <p className="text-mute text-sm sm:text-base leading-relaxed pt-2 border-t border-white/10">
                {profile.achievements}
              </p>
            )}
          </div>
        </section>

        {/* 5.5 Direct Creator Support // UPI Superchat & VIP Channel Membership */}
        <section aria-labelledby="support-heading">
          <SectionHeading
            eyebrow="Support the Stream"
            title="VIP Membership &"
            highlight="Direct Support"
            id="support-heading"
            description="Support KhushiYT directly during marathon rank-push streams or join the official YouTube VIP Membership squad."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Direct UPI Support Card */}
            <div className="panel p-6 sm:p-7 border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-card to-card flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  <CheckCircle2 className="size-3" /> 100% Direct Creator Support (0% Cut)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Flame className="size-5 text-amber-400" /> Direct UPI Stream Tip / Shoutout
                </h3>
                <p className="text-sm text-mute leading-relaxed">
                  YouTube takes a 30% cut on Superchats. Supporting via official UPI sends 100% directly to{' '}
                  <strong className="text-white">{profile.gaming_name}</strong> — drop your name in live chat for an instant stream shoutout!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    Official UPI ID
                  </span>
                  <span className="font-mono text-base sm:text-lg font-black text-white select-all">
                    {upiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(upiId, 'Official UPI ID')}
                  className="clip-angle-sm inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-display text-xs sm:text-sm font-black uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
                >
                  <Copy className="size-4" /> Copy UPI ID
                </button>
              </div>
            </div>

            {/* YouTube Channel Membership & Subscribe Card */}
            <div className="panel p-6 sm:p-7 border border-pink-400/30 bg-gradient-to-br from-pink-500/10 via-card to-card flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pink-500/15 border border-pink-400/30 text-[10px] font-black uppercase tracking-widest text-pink-300">
                  <Crown className="size-3" /> Exclusive Loyalty Badges & Emotes
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-5 text-pink-400" /> Join {SITE.communityName} VIP
                </h3>
                <p className="text-sm text-mute leading-relaxed">
                  Unlock custom chat loyalty badges, priority squad invites during subscriber custom rooms, and exclusive member-only streams on YouTube.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                <a
                  href={membershipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clip-angle-sm inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-display text-xs sm:text-sm font-black uppercase tracking-wider hover:brightness-110 transition"
                >
                  <Crown className="size-4" /> Join Membership <ExternalLink className="size-3.5" />
                </a>
                <a
                  href={youtubeSubscribeUrl(profile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clip-angle-sm inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] border border-white/15 text-white font-display text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition"
                >
                  Subscribe on YouTube
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Message to the Community + Interactive Fan Cheer Bar */}
        <section aria-labelledby="message-heading">
          <div className="gradient-border rounded-3xl bg-gradient-to-r from-card to-card-2 p-6 sm:p-12 text-center space-y-6">
            <Heart className="size-10 text-blush mx-auto animate-pulse" />
            <div className="space-y-3">
              <h2 id="message-heading" className="text-2xl sm:text-3xl font-bold">
                Message to the <span className="text-gradient font-script italic">{SITE.communityName}</span>
              </h2>
              <p className="max-w-2xl mx-auto text-mute sm:text-lg leading-relaxed">
                "{profile.community_message || 'Thank you for watching, chatting, and being part of the family! See you in the next stream!'}"
              </p>
            </div>

            {/* Interactive Cheer & Reaction Bar */}
            <div className="pt-4 border-t border-white/10 max-w-2xl mx-auto space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Tap to Send Live Cheer to {profile.gaming_name}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleCheer('love', '🌸 Family Love')}
                  className={`relative py-3 px-4 rounded-2xl border bg-pink-500/10 border-pink-400/35 hover:bg-pink-500/20 transition flex items-center justify-between gap-2 cursor-pointer active:scale-95 ${
                    activeBurst === 'love' ? 'ring-2 ring-pink-400 scale-[1.03]' : ''
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
                    <span className="text-lg">🌸</span> Send Love
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/50 border border-pink-400/30 font-mono text-xs font-black text-pink-300 tabular-nums">
                    {cheers.love.toLocaleString()}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheer('dinner', '🍗 Chicken Dinner GG')}
                  className={`relative py-3 px-4 rounded-2xl border bg-amber-500/10 border-amber-400/35 hover:bg-amber-500/20 transition flex items-center justify-between gap-2 cursor-pointer active:scale-95 ${
                    activeBurst === 'dinner' ? 'ring-2 ring-amber-400 scale-[1.03]' : ''
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
                    <span className="text-lg">🍗</span> Chicken Dinner
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/50 border border-amber-400/30 font-mono text-xs font-black text-amber-300 tabular-nums">
                    {cheers.dinner.toLocaleString()}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheer('clutch', '🔥 OP 1v4 Clutch')}
                  className={`relative py-3 px-4 rounded-2xl border bg-purple-500/10 border-purple-400/35 hover:bg-purple-500/20 transition flex items-center justify-between gap-2 cursor-pointer active:scale-95 ${
                    activeBurst === 'clutch' ? 'ring-2 ring-purple-400 scale-[1.03]' : ''
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
                    <span className="text-lg">🔥</span> OP Clutch
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/50 border border-purple-400/30 font-mono text-xs font-black text-purple-300 tabular-nums">
                    {cheers.clutch.toLocaleString()}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
