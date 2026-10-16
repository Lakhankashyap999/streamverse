export function PubgAirdropDivider() {
  return (
    <div className="relative my-8 sm:my-14 overflow-hidden py-4 sm:py-6" aria-hidden="true">
      {/* Ambient Red Smoke Flare Glow (Zero-Blur Radial Gradient) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-20 sm:h-28 rounded-full [background:radial-gradient(ellipse_at_center,rgba(220,38,38,0.18)_0%,transparent_70%)]" />

      <div className="container-x relative flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Tactical Laser Line */}
        <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/40 to-red-500/80" />

        {/* Center PUBG Supply Crate Badge */}
        <div className="shrink-0 flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2 rounded-2xl bg-[#0f1325] border border-red-500/30 shadow-lg">
          <div className="relative">
            <svg className="size-6 sm:size-7 text-red-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 9M12 2L20 9M12 2V9" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 1" />
              <rect x="4" y="9" width="16" height="13" rx="2" fill="#b91c1c" stroke="#fca5a5" strokeWidth="1" />
              <rect x="3.5" y="8" width="17" height="4" rx="1.5" fill="#2563eb" stroke="#93c5fd" strokeWidth="0.8" />
              <line x1="8.5" y1="9" x2="8.5" y2="22" stroke="#fbbf24" strokeWidth="1.2" />
              <line x1="15.5" y1="9" x2="15.5" y2="22" stroke="#fbbf24" strokeWidth="1.2" />
              <line x1="4" y1="15" x2="20" y2="15" stroke="#fbbf24" strokeWidth="1.2" />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-bold text-red-400 tracking-widest uppercase">
              <span className="size-1.5 rounded-full bg-red-500" />
              <span>SUPPLY AIRDROP INCOMING</span>
            </div>
            <span className="font-gaming text-xs sm:text-sm font-bold text-white tracking-wide">
              LEVEL 3 GEAR <span className="text-amber-400 font-mono">·</span> OCEAN ODYSSEY (SCHOOL APARTMENTS)
            </span>
          </div>
        </div>

        {/* Right Tactical Laser Line */}
        <div className="flex-1 h-[1.5px] bg-gradient-to-r from-red-500/80 via-red-500/40 to-transparent" />
      </div>
    </div>
  );
}
