'use client';

import { useRouter } from 'next/navigation';
import { useSuggestions } from '@/hooks/useSuggestions';

export default function ProfileBanner() {
  const router = useRouter();
  const { suggestions } = useSuggestions();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <div className="mx-2 sm:mx-4 mt-2 mb-3 rounded-2xl overflow-hidden shadow-sm bg-navy">
      {/* 가로형 프로필 이미지 + 제안수 오버레이 (상하 네이비 여백으로 높이 확장) */}
      <div className="relative py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${basePath}/images/jmg-profile-horizontal.png?v=2`}
          alt="정명근 · 대한민국 1등 도시 화성"
          className="block w-full h-auto"
        />

        {/* 제안 카운터 오버레이 (우측) */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-baseline gap-1.5
                        px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25">
          <span className="text-orange text-xl font-black leading-none">
            {suggestions.length}
          </span>
          <span className="text-white/85 text-[11px] font-semibold">개 시민제안</span>
        </div>
      </div>

      {/* 정책제안하기 버튼 */}
      <button
        onClick={() => router.push('/suggestions/new')}
        className="w-full py-2.5 text-sm font-bold text-white bg-orange
                   hover:bg-orange/90 active:bg-orange/80 transition-colors
                   flex items-center justify-center gap-1.5"
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
