import React, { useMemo, useState } from 'react';
import { Download, Sparkles, ShieldCheck, Award, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { SITE } from '../../config/site';

type CardThemeId = 'gold' | 'sakura' | 'glacier';

interface CardTheme {
  id: CardThemeId;
  label: string;
  primary: string;
  secondary: string;
  bgStart: string;
  bgEnd: string;
  badgeBg: string;
  textAccent: string;
}

const CARD_THEMES: Record<CardThemeId, CardTheme> = {
  gold: {
    id: 'gold',
    label: 'Conqueror Gold',
    primary: '#f59e0b',
    secondary: '#ec4899',
    bgStart: '#120c07',
    bgEnd: '#070912',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    textAccent: '#fbbf24',
  },
  sakura: {
    id: 'sakura',
    label: 'Sakura Neon',
    primary: '#ec4899',
    secondary: '#a855f7',
    bgStart: '#160714',
    bgEnd: '#080914',
    badgeBg: 'rgba(236, 72, 153, 0.16)',
    textAccent: '#f472b6',
  },
  glacier: {
    id: 'glacier',
    label: 'Glacier Subzero',
    primary: '#38bdf8',
    secondary: '#6366f1',
    bgStart: '#061322',
    bgEnd: '#060913',
    badgeBg: 'rgba(56, 189, 248, 0.16)',
    textAccent: '#7dd3fc',
  },
};

const ROLES = ['Assaulter', 'Entry Fragger', 'IGL // Tactician', 'Sniper Specialist', 'Squad Support'] as const;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const SquadIdCardGenerator: React.FC = () => {
  const toast = useToast();
  const [memberName, setMemberName] = useState('CONQUEROR FAN');
  const [memberUid, setMemberUid] = useState('5582910472');
  const [memberRole, setMemberRole] = useState<string>(ROLES[0]);
  const [themeId, setThemeId] = useState<CardThemeId>('gold');
  const [downloading, setDownloading] = useState(false);

  const theme = CARD_THEMES[themeId];

  // Deterministic serial badge code derived from name + UID
  const serialCode = useMemo(() => {
    const clean = `${memberName}${memberUid}`.trim();
    let hash = 2026;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash * 31 + clean.charCodeAt(i)) % 9000;
    }
    return `KHYT-${String(1000 + Math.abs(hash)).slice(0, 4)}`;
  }, [memberName, memberUid]);

  const displayPlayerName = memberName.trim() || 'KHUSHI SQUAD FAN';
  const displayUid = memberUid.trim() || '5112658248';

  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const W = 1080;
      const H = 640;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 1. Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, theme.bgStart);
      bgGrad.addColorStop(1, theme.bgEnd);
      drawRoundedRect(ctx, 0, 0, W, H, 36);
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // 2. Ambient Glow Circles
      const glowLeft = ctx.createRadialGradient(180, 140, 10, 180, 140, 380);
      glowLeft.addColorStop(0, `${theme.primary}44`);
      glowLeft.addColorStop(1, 'transparent');
      ctx.fillStyle = glowLeft;
      ctx.fillRect(0, 0, W, H);

      const glowRight = ctx.createRadialGradient(W - 180, H - 140, 10, W - 180, H - 140, 380);
      glowRight.addColorStop(0, `${theme.secondary}44`);
      glowRight.addColorStop(1, 'transparent');
      ctx.fillStyle = glowRight;
      ctx.fillRect(0, 0, W, H);

      // 3. Outer Neon Border
      const borderGrad = ctx.createLinearGradient(0, 0, W, H);
      borderGrad.addColorStop(0, theme.primary);
      borderGrad.addColorStop(0.5, '#ffffff');
      borderGrad.addColorStop(1, theme.secondary);
      drawRoundedRect(ctx, 14, 14, W - 28, H - 28, 28);
      ctx.lineWidth = 4;
      ctx.strokeStyle = borderGrad;
      ctx.stroke();

      // 4. Top Header Strip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      drawRoundedRect(ctx, 44, 42, W - 88, 86, 18);
      ctx.fill();

      // Brand Badge Circle
      const badgeGrad = ctx.createLinearGradient(68, 58, 122, 112);
      badgeGrad.addColorStop(0, theme.primary);
      badgeGrad.addColorStop(1, theme.secondary);
      drawRoundedRect(ctx, 64, 57, 56, 56, 14);
      ctx.fillStyle = badgeGrad;
      ctx.fill();

      ctx.fillStyle = '#05070e';
      ctx.font = '900 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('K', 92, 96);

      ctx.textAlign = 'left';
      ctx.fillStyle = theme.textAccent;
      ctx.font = '800 16px sans-serif';
      ctx.fillText('OFFICIAL VIP SQUAD PASS // VERIFIED MEMBER', 138, 78);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px sans-serif';
      ctx.fillText(`${SITE.communityName.toUpperCase()} 🌸`, 138, 108);

      // Serial Pill on Top Right
      ctx.textAlign = 'right';
      ctx.fillStyle = theme.textAccent;
      ctx.font = '800 15px monospace';
      ctx.fillText(`PASS ID: #${serialCode}`, W - 68, 82);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px sans-serif';
      ctx.fillText('STATUS: ELITE SQUAD', W - 68, 105);

      // 5. Main Member Name & Details
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 15px sans-serif';
      ctx.fillText('SQUAD OPERATIVE CALLSIGN', 56, 195);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 58px sans-serif';
      ctx.fillText(displayPlayerName.toUpperCase().slice(0, 20), 56, 258);

      // 6. Info Boxes Row (BGMI UID, Role, Creator Squad)
      const boxes = [
        { label: 'BGMI CHARACTER UID', val: displayUid },
        { label: 'COMBAT SPECIALTY', val: memberRole.toUpperCase() },
        { label: 'COMMANDER', val: 'KHUSHI YT (@khusiytlive)' },
      ];

      boxes.forEach((b, idx) => {
        const bx = 56 + idx * 326;
        const by = 305;
        const bw = 304;
        const bh = 112;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        drawRoundedRect(ctx, bx, by, bw, bh, 16);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.stroke();

        ctx.fillStyle = theme.textAccent;
        ctx.font = '800 13px sans-serif';
        ctx.fillText(b.label, bx + 20, by + 38);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px sans-serif';
        ctx.fillText(b.val.slice(0, 22), bx + 20, by + 78);
      });

      // 7. Bottom Footer Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      drawRoundedRect(ctx, 44, H - 108, W - 88, 64, 14);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 16px sans-serif';
      ctx.fillText('🌐 khushiyt.live   •   📺 YouTube: @khusiytlive   •   📸 IG: @igkhusi', 68, H - 69);

      ctx.textAlign = 'right';
      ctx.fillStyle = theme.textAccent;
      ctx.font = '900 16px sans-serif';
      ctx.fillText('★ CONQUEROR SQUAD VERIFIED ★', W - 68, H - 69);

      // Trigger PNG Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeFile = displayPlayerName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'squad';
      link.download = `khushiyt-vip-pass-${safeFile}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast('VIP Squad Card downloaded! Share it on your IG Story & tag @igkhusi 🌸', 'success');
    } catch {
      toast('Could not generate card image. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyShareCaption = async () => {
    const text = `Proud member of the Official ${SITE.communityName} 🌸! My Pass ID: #${serialCode} (${memberRole}) — Generate yours at https://khushiyt.live/community @igkhusi`;
    try {
      await navigator.clipboard.writeText(text);
      toast('IG Story caption copied!', 'success');
    } catch {
      toast('Could not copy caption', 'error');
    }
  };

  return (
    <div className="panel p-5 sm:p-8 border border-amber-400/25 bg-gradient-to-br from-slate-950/95 via-[#0b0e1a] to-slate-950/95">
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        {/* LEFT COLUMN: Customizer Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-400/35 text-[10px] font-black uppercase tracking-widest text-amber-300">
              <Award className="size-3.5" /> Instant Fan Pass Generator
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Create Your Official <span className="text-gradient">VIP Squad ID Card</span>
            </h3>
            <p className="text-xs sm:text-sm text-mute leading-relaxed">
              Customize your official <strong className="text-white">{SITE.communityName}</strong> pass, download the HD card, and share it on your Instagram Story tagging <strong className="text-pink-400">@igkhusi</strong>!
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Your Name / In-Game Callsign
              </label>
              <input
                type="text"
                maxLength={18}
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Enter your name or IGN"
                className="w-full rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-sm font-bold text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Your BGMI UID
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={memberUid}
                  onChange={(e) => setMemberUid(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 5582910472"
                  className="w-full rounded-xl bg-black/60 border border-white/15 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Squad Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2.5 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-slate-950 text-white">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Card Theme Switcher */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Select Holographic Card Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.values(CARD_THEMES) as CardTheme[]).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeId(t.id)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      themeId === t.id
                        ? 'border-white bg-white/10 text-white shadow-md'
                        : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
                    />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={downloading}
                className="clip-angle-sm flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-display text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition cursor-pointer"
              >
                <Download className="size-4 shrink-0" />
                {downloading ? 'Generating HD Pass...' : 'Download HD VIP Pass'}
              </button>

              <button
                type="button"
                onClick={handleCopyShareCaption}
                className="clip-angle-sm py-3 px-3.5 bg-white/[0.06] border border-white/15 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-white/10 transition cursor-pointer"
                title="Copy Instagram Story Caption"
              >
                <Copy className="size-3.5" /> Copy IG Tag
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Holographic VIP Card Preview */}
        <div className="lg:col-span-7">
          <div
            className="relative rounded-2xl p-4 sm:p-6 overflow-hidden border-2 shadow-2xl transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`,
              borderColor: `${theme.primary}88`,
              boxShadow: `0 16px 45px -10px ${theme.primary}33`,
            }}
          >
            {/* Ambient Background Glows */}
            <div
              className="pointer-events-none absolute -top-20 -left-20 size-56 rounded-full blur-2xl opacity-35"
              style={{ background: theme.primary }}
            />
            <div
              className="pointer-events-none absolute -bottom-20 -right-20 size-56 rounded-full blur-2xl opacity-35"
              style={{ background: theme.secondary }}
            />

            {/* Top Card Header */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 sm:size-11 rounded-xl grid place-items-center font-display font-black text-lg text-slate-950 shadow-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  }}
                >
                  K
                </div>
                <div>
                  <div
                    className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] flex items-center gap-1"
                    style={{ color: theme.textAccent }}
                  >
                    <ShieldCheck className="size-3.5 shrink-0" /> OFFICIAL VIP SQUAD PASS
                  </div>
                  <div className="text-sm sm:text-base font-black text-white tracking-tight">
                    {SITE.communityName} 🌸
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className="font-mono text-xs sm:text-sm font-black tracking-wider"
                  style={{ color: theme.textAccent }}
                >
                  #{serialCode}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  VERIFIED OPERATIVE
                </div>
              </div>
            </div>

            {/* Center Operative Callsign */}
            <div className="relative z-10 py-5 sm:py-6 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                SQUAD OPERATIVE CALLSIGN
              </div>
              <div className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase truncate">
                {displayPlayerName}
              </div>
            </div>

            {/* 3 Tactical Info Chips */}
            <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-black/55 border border-white/10">
                <div
                  className="text-[9px] font-black uppercase tracking-wider truncate"
                  style={{ color: theme.textAccent }}
                >
                  BGMI UID
                </div>
                <div className="mt-0.5 font-mono text-xs sm:text-sm font-black text-white truncate">
                  {displayUid}
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-black/55 border border-white/10">
                <div
                  className="text-[9px] font-black uppercase tracking-wider truncate"
                  style={{ color: theme.textAccent }}
                >
                  COMBAT ROLE
                </div>
                <div className="mt-0.5 text-xs sm:text-sm font-black text-white truncate">
                  {memberRole}
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-black/55 border border-white/10">
                <div
                  className="text-[9px] font-black uppercase tracking-wider truncate"
                  style={{ color: theme.textAccent }}
                >
                  COMMANDER
                </div>
                <div className="mt-0.5 text-xs sm:text-sm font-black text-white truncate">
                  KhushiYT 👑
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-bold text-slate-300">
              <span>🌐 khushiyt.live • 📸 @igkhusi</span>
              <span
                className="font-black uppercase tracking-wider flex items-center gap-1"
                style={{ color: theme.textAccent }}
              >
                <Sparkles className="size-3" /> CONQUEROR SQUAD
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="size-3 text-amber-400" /> Live Preview updates automatically as you type
            </span>
            <span className="text-pink-400 font-bold">1080×640 HD PNG</span>
          </div>
        </div>
      </div>
    </div>
  );
};
