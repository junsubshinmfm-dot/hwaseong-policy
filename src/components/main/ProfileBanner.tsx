'use client';

import { useRouter } from 'next/navigation';
import { useSuggestions } from '@/hooks/useSuggestions';

export default function ProfileBanner() {
  const router = useRouter();
  const { suggestions } = useSuggestions();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <div className="mx-2 sm:mx-4 mt-2 mb-3 rounded-2xl overflow-hidden shadow-sm bg-navy">
      {/* 세로형 프로필 이미지 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${basePath}/images/jmg-profile-vertical.png`}
        alt="정명근 · 대한민국 1등 도시 화성"
        className="block w-full h-auto"
      />

      {/* 제안 카운터 (이미지 아래 네이비 섹션, 카드 세로 길이 확장) */}
      <div className="px-5 pt-4 pb-5">
        <div className="text-white/80 text-xs font-bold tracking-wider mb-1.5">
          시민제안
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-orange text-[7rem] font-black leading-none drop-shadow-[0_2px_10px_rgba(245,130,32,0.45)]">
            {suggestions.length}
          </span>
          <span className="text-white text-2xl font-extrabold">개</span>
        </div>
      </div>

      {/* 정책제안하기 버튼 */}
      <button
        onClick={() => router.push('/suggestions/new')}
        className="w-full py-3 text-sm font-bold text-white bg-orange
                   hover:bg-orange/90 active:bg-orange/80 transition-colors
                   flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        정책 제안하기
      </button>
    </div>
  );
}
