'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  // 인트로 / 어드민 패턴(/admin, /control-*) 페이지에서는 표시하지 않음
  if (pathname === '/' || pathname.startsWith('/admin') || pathname.startsWith('/control-')) return null;

  return (
    <footer className="relative z-10 border-t border-navy-100/30 bg-white/60 backdrop-blur-sm py-4 px-4">
      <div className="max-w-6xl mx-auto text-center text-navy/50 text-xs sm:text-sm leading-relaxed">
        <p>
          문의 및 오류 사항 : 제작자 신준섭{' '}
          <a href="tel:01056176517" className="hover:text-navy font-medium">
            (010-5617-6517)
          </a>
        </p>
        <p className="mt-0.5">
          이메일 :{' '}
          <a href="mailto:junsubshin@naver.com" className="hover:text-navy font-medium">
            junsubshin@naver.com
          </a>
        </p>
      </div>
    </footer>
  );
}
