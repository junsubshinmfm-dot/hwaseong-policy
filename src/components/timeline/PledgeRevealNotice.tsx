'use client';

import { useTimeline } from '@/hooks/useTimeline';

interface PledgeRevealNoticeProps {
  variant?: 'modal' | 'page';
  regionLabel?: string;
}

/**
 * 5/21 이전 공약 영역에 카드 그리드 대신 노출되는 안내 박스.
 * 카드 갯수가 직접 드러나지 않도록 그리드 자체를 대체한다.
 */
export default function PledgeRevealNotice({
  variant = 'page',
  regionLabel,
}: PledgeRevealNoticeProps) {
  const { daysUntilReveal } = useTimeline();
  const isModal = variant === 'modal';

  return (
    <div
      className={`relative flex flex-col items-center justify-center text-center
                  ${isModal
                    ? 'mx-auto w-full max-w-md px-6 py-8 sm:py-10'
                    : 'mx-auto w-full max-w-2xl px-6 py-14 sm:py-20'}
                  rounded-2xl sm:rounded-3xl
                  bg-gradient-to-br from-navy via-navy-light to-navy
                  shadow-2xl border border-orange/30 overflow-hidden`}
    >
      {/* 장식 배경 */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-orange/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-12 w-44 h-44 rounded-full bg-orange/8 blur-3xl" />

      <div className="relative z-10">
        {/* 자물쇠 아이콘 */}
        <div className={`mx-auto rounded-full bg-orange/15 flex items-center justify-center mb-4
                        ${isModal ? 'w-14 h-14' : 'w-20 h-20'}`}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`text-orange ${isModal ? 'w-7 h-7' : 'w-10 h-10'}`}
          >
            <path d="M17 9V7a5 5 0 00-10 0v2H5v13h14V9h-2zm-8-2a3 3 0 016 0v2H9V7zm8 13H7V11h10v9z" />
          </svg>
        </div>

        {regionLabel && (
          <p className={`text-orange/90 font-bold tracking-wider mb-1
                        ${isModal ? 'text-xs' : 'text-sm'}`}>
            {regionLabel}
          </p>
        )}

        <h3 className={`text-white font-black mb-2 leading-tight
                        ${isModal ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
          정명근의 약속,<br />곧 공개됩니다
        </h3>

        <p className={`text-white/70 font-medium mb-5
                       ${isModal ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
          2026년 5월 21일, 화성특례시에 드리는 정식 공약을 발표합니다.
        </p>

        {/* D-카운트다운 */}
        <div className={`inline-flex items-baseline gap-1.5 px-5 py-2.5 rounded-full
                         bg-orange shadow-[0_8px_24px_rgba(245,130,32,0.4)]`}>
          <span className={`text-white font-black ${isModal ? 'text-sm' : 'text-base'}`}>
            D-
          </span>
          <span className={`text-white font-black ${isModal ? 'text-2xl' : 'text-3xl'}`}>
            {daysUntilReveal}
          </span>
        </div>
      </div>
    </div>
  );
}
