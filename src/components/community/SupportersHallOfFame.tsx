import React from 'react';
import { Crown, Trophy, Shield, Heart, Sparkles, Copy, ExternalLink } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../ui/Toast';
import { SITE } from '../../config/site';

interface HallMember {
  rank: string;
  name: string;
  title: string;
  badge: string;
  contribution: string;
  accent: string;
  bgClass: string;
  borderClass: string;
}

const TOP_VIP_PODIUM: HallMember[] = [
  {
    rank: '01 // SOVEREIGN MVP',
    name: 'KhushiYT Royal VIPs',
    title: 'Diamond Crown Supporters',
    badge: '🥇 GOLD TIER',
    contribution: 'Top Live Stream Superchat & Raid Leaders',
    accent: '#fbbf24',
    bgClass: 'from-amber-500/20 via-amber-500/5 to-card',
    borderClass: 'border-amber-400/45',
  },
  {
    rank: '02 // CONQUEROR GUARD',
    name: 'OG Stream Moderators',
    title: 'Channel Guardians & Custom Room Hosts',
    badge: '🥈 SILVER TIER',
    contribution: '6–8 Hr Daily Live Chat Moderation & Lobby Management',
    accent: '#38bdf8',
    bgClass: 'from-sky-500/15 via-sky-500/5 to-card',
    borderClass: 'border-sky-400/35',
  },
  {
    rank: '03 // LOYAL SQUAD',
    name: 'YouTube Channel Members',
    title: 'Verified KhushiYT Family Badge Holders',
    badge: '🥉 BRONZE TIER',
    contribution: 'Day-1 Subscribers, Poll Voters & Custom Room Champions',
    accent: '#f472b6',
    bgClass: 'from-pink-500/15 via-pink-500/5 to-card',
    borderClass: 'border-pink-400/35',
  },
];

const HONOUR_BADGES = [
  { label: '⚡ Daily First Likers', role: 'Stream Hype Squad' },
  { label: '🛡️ Nightbot & Chat Mods', role: 'Safe Zone Guardians' },
  { label: '🏆 Custom Room Winners', role: 'Erangel & TDM MVPs' },
  { label: '💎 YouTube Join Members', role: 'Loyalty Badge Crew' },
  { label: '🌸 Instagram @igkhusi Fam', role: 'Story Share Squad' },
  { label: '🔥 Top Popularity Gifters', role: 'BGMI Lobby Legends' },
];

export const SupportersHallOfFame: React.FC = () => {
  const { profile } = useProfile();
  const toast = useToast();

  const upiId = profile.upi_id || '95997292@ybl';
  const membershipUrl = profile.membership_url || 'https://www.youtube.com/@khusiytlive/join';

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      toast(`Official UPI ID (${upiId}) copied!`, 'success');
    } catch {
      toast('Could not copy UPI ID', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 3 VIP Podium Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {TOP_VIP_PODIUM.map((item) => (
          <div
            key={item.rank}
            className={`panel p-5 sm:p-6 border ${item.borderClass} bg-gradient-to-br ${item.bgClass} flex flex-col justify-between gap-4 relative overflow-hidden`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: item.accent }}
                >
                  {item.rank}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/50 border border-white/15 text-[10px] font-black text-white">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Crown className="size-5 shrink-0" style={{ color: item.accent }} />
                <span>{item.name}</span>
              </h3>

              <p className="text-xs font-bold text-slate-300">{item.title}</p>
              <p className="text-xs text-mute leading-relaxed">{item.contribution}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">Status</span>
              <span className="flex items-center gap-1" style={{ color: item.accent }}>
                <Sparkles className="size-3" /> Hall of Fame Verified
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Honour Roll Strip + How to Get Featured CTA */}
      <div className="panel p-5 sm:p-7 border border-white/10 bg-black/40 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5">
              <Trophy className="size-3.5" /> COMMUNITY HONOUR ROLL
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Special Shoutout to Every Pillar of the {SITE.communityName}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="clip-angle-sm inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400/20 border border-amber-400/45 text-amber-200 font-display text-xs font-black uppercase tracking-wider hover:bg-amber-400/30 transition cursor-pointer"
            >
              <Copy className="size-3.5" /> Support via UPI ({upiId})
            </button>
            <a
              href={membershipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="clip-angle-sm inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-display text-xs font-black uppercase tracking-wider hover:brightness-110 transition"
            >
              <Heart className="size-3.5" /> Join VIP Membership <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {HONOUR_BADGES.map((b) => (
            <div
              key={b.label}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-pink-400/40 transition"
            >
              <div className="text-xs font-bold text-white truncate">{b.label}</div>
              <div className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">{b.role}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
          <Shield className="size-4 text-emerald-400 shrink-0" />
          <span>
            Want your name featured on the <strong className="text-white">Top Supporters Podium</strong>? Send BGMI Popularity to ID{' '}
            <strong className="text-amber-300">{profile.game_id || '5112658248'}</strong> or support during live streams!
          </span>
        </div>
      </div>
    </div>
  );
};
