'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'welcome_popup_seen';

export default function WelcomePopup() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 세션당 1회만 표시
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // 살짝 딜레이 후 표시
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEY, 'true');
    window.dispatchEvent(new Event('welcome_popup_closed'));
  };

  const handlePropose = () => {
    handleClose();
    router.push('/suggestions/new');
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* 팝업 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 상단 그라데이션 */}
              <div className="relative bg-gradient-to-br from-navy via-navy-light to-orange p-6 text-center overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border-[4px] border-white/10" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full border-[3px] border-orange/30" />
                <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-orange/20" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-3"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </motion.div>
                <h2 className="text-white text-2xl font-black drop-shadow mb-1 relative">환영합니다!</h2>
                <p className="text-white/80 text-sm font-medium relative">화성특례시 시민 정책제안 플랫폼</p>
              </div>

              {/* 본문 */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-orange text-base">✨</span>
                    </div>
                    <div>
                      <p className="text-navy font-bold text-sm mb-0.5">여러분의 목소리를 들려주세요</p>
                      <p className="text-navy/50 text-xs leading-relaxed">
                        화성시에 필요한 정책을 직접 제안해주세요.
                        작은 아이디어도 큰 변화의 시작이 됩니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-navy text-base">📋</span>
                    </div>
                    <div>
                      <p className="text-navy font-bold text-sm mb-0.5">실제 공약에 반영됩니다</p>
                      <p className="text-navy/50 text-xs leading-relaxed">
                        좋은 제안은 <b className="text-orange">정명근 화성특례시장 예비후보</b>의
                        공약에 반영하여 반드시 실현하겠습니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-green-600 text-base">💬</span>
                    </div>
                    <div>
                      <p className="text-navy font-bold text-sm mb-0.5">함께 의견을 나눠보세요</p>
                      <p className="text-navy/50 text-xs leading-relaxed">
                        다른 분들의 제안에 좋아요를 누르고, 댓글로 의견을 남기며
                        함께 만들어가는 화성의 미래를 꿈꿔보세요.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-navy/[0.06] via-orange/[0.05] to-orange/[0.08] border border-orange/20 px-3 py-2.5 flex items-start gap-2.5">
                    <span className="text-base shrink-0 mt-0.5">⏰</span>
                    <p className="text-navy text-xs font-bold leading-relaxed">
                      상단 시계를 오른쪽 끝까지 끌면<br />
                      <span className="text-orange">정명근 공약 사이트</span>로 바뀝니다
                    </p>
                  </div>
                </div>

                {/* CTA 버튼 */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handlePropose}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange to-orange-dark text-white font-bold text-sm hover:shadow-lg hover:scale-[1.01] transition-all"
                  >
                    지금 정책 제안하기 →
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-xl text-navy/40 text-xs font-medium hover:bg-navy-50 transition-colors"
                  >
                    둘러보기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
