'use client';

import { useSuggestions } from '@/hooks/useSuggestions';

export default function ProfileBanner() {
  const { suggestions } = useSuggestions();

  return (
    <div className="mx-2 sm:mx-4 mt-2 mb-3 relative overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(135deg, #1A3B8F 0%, #152F73 60%, #0D1F4D 100%)' }}>
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full border-[3px] border-white/[0.08]" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full border-[3px] border-orange/15" />
      <div className="absolute top-2 right-3 w-6 h-6 rounded-lg bg-orange/15" />

      <div className="relative flex items-center gap-3 px-4 py-3">
        <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/15">
          <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
            <path d="M10 38 A20 20 0 0 1 30 18" stroke="#F58220" strokeWidth="4" strokeLinecap="round" />
            <path d="M10 38 A12 12 0 0 1 22 26" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <rect x="30" y="10" width="10" height="10" rx="2.5" fill="#F58220" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-white font-extrabold text-base">정명근</span>
            <span className="text-white/40 text-xs">화성특례시장 후보</span>
          </div>
          <p className="text-orange-light text-xs font-bold truncate">
            &ldquo;시민과 함께 만드는 화성의 미래&rdquo;
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-orange text-2xl font-black">{suggestions.length}</span>
          <span className="text-white/40 text-xs ml-0.5">제안</span>
        </div>
      </div>
    </div>
  );
}
