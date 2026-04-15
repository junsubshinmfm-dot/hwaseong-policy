'use client';

/**
 * 화성특례시 로고 기반 기하학 패턴 컴포넌트
 * - 반원, 원호, 사각형의 조합
 * - 블루(#1A3B8F) + 오렌지(#F58220) + 화이트
 */

interface GeoPatternProps {
  variant?: 'header' | 'strip' | 'corner-tl' | 'corner-br';
  className?: string;
}

export default function GeoPattern({ variant = 'strip', className = '' }: GeoPatternProps) {
  if (variant === 'header') {
    return (
      <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
        <svg viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {/* 좌측 큰 반원 */}
          <path d="M0 200 A100 100 0 0 1 0 0" fill="#1A3B8F" opacity="0.12" />
          <path d="M0 180 A80 80 0 0 1 0 20" fill="none" stroke="#1A3B8F" strokeWidth="4" opacity="0.15" />

          {/* 좌측 동심원호 */}
          <path d="M120 200 A90 90 0 0 1 120 20" fill="none" stroke="#F58220" strokeWidth="5" opacity="0.2" />
          <path d="M120 200 A70 70 0 0 1 120 60" fill="none" stroke="#F58220" strokeWidth="5" opacity="0.15" />
          <path d="M120 200 A50 50 0 0 1 120 100" fill="none" stroke="#F58220" strokeWidth="5" opacity="0.10" />

          {/* 중앙 기하학 블록 */}
          <rect x="300" y="140" width="60" height="60" rx="8" fill="#1A3B8F" opacity="0.07" />
          <rect x="370" y="120" width="40" height="80" rx="6" fill="#F58220" opacity="0.10" />
          <circle cx="480" cy="160" r="30" fill="none" stroke="#1A3B8F" strokeWidth="4" opacity="0.10" />
          <circle cx="480" cy="160" r="18" fill="#1A3B8F" opacity="0.06" />

          {/* 우측 큰 사각+원호 */}
          <rect x="900" y="0" width="100" height="200" rx="0" fill="#F58220" opacity="0.06" />
          <path d="M1000 0 Q1000 100 1100 100" fill="none" stroke="#1A3B8F" strokeWidth="6" opacity="0.12" />
          <path d="M1050 200 A80 80 0 0 1 1050 40" fill="none" stroke="#F58220" strokeWidth="5" opacity="0.15" />

          {/* 우측 끝 장식 반원 */}
          <path d="M1200 0 A100 100 0 0 1 1200 200" fill="#1A3B8F" opacity="0.08" />
          <path d="M1200 20 A80 80 0 0 1 1200 180" fill="none" stroke="#F58220" strokeWidth="4" opacity="0.12" />

          {/* 점선 그리드 */}
          <line x1="600" y1="0" x2="600" y2="200" stroke="#1A3B8F" strokeWidth="1" opacity="0.05" strokeDasharray="4 8" />
          <line x1="800" y1="0" x2="800" y2="200" stroke="#1A3B8F" strokeWidth="1" opacity="0.05" strokeDasharray="4 8" />
        </svg>
      </div>
    );
  }

  if (variant === 'strip') {
    return (
      <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
        <svg viewBox="0 0 1200 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
          {/* 블루 바 */}
          <rect x="0" y="0" width="1200" height="6" fill="#1A3B8F" />
          {/* 오렌지 악센트 */}
          <rect x="0" y="6" width="200" height="4" fill="#F58220" />
          <rect x="250" y="6" width="80" height="4" fill="#F58220" opacity="0.5" />
          {/* 기하학 장식 */}
          <circle cx="24" cy="30" r="12" fill="#1A3B8F" opacity="0.08" />
          <path d="M60 48 A18 18 0 0 1 60 12" fill="none" stroke="#F58220" strokeWidth="3" opacity="0.15" />
          <rect x="1100" y="12" width="30" height="30" rx="6" fill="#1A3B8F" opacity="0.06" />
          <path d="M1160 48 A16 16 0 0 1 1160 16" fill="none" stroke="#F58220" strokeWidth="3" opacity="0.12" />
        </svg>
      </div>
    );
  }

  if (variant === 'corner-tl') {
    return (
      <div className={`absolute top-0 left-0 pointer-events-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M0 0 L80 0 L80 80 A80 80 0 0 1 0 80 Z" fill="#1A3B8F" opacity="0.06" />
          <path d="M0 0 A120 120 0 0 0 120 120" fill="none" stroke="#F58220" strokeWidth="4" opacity="0.15" />
          <path d="M0 0 A80 80 0 0 0 80 80" fill="none" stroke="#F58220" strokeWidth="4" opacity="0.10" />
          <circle cx="30" cy="30" r="8" fill="#1A3B8F" opacity="0.12" />
        </svg>
      </div>
    );
  }

  if (variant === 'corner-br') {
    return (
      <div className={`absolute bottom-0 right-0 pointer-events-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M200 200 L120 200 L120 120 A80 80 0 0 1 200 120 Z" fill="#F58220" opacity="0.07" />
          <path d="M200 200 A120 120 0 0 0 80 80" fill="none" stroke="#1A3B8F" strokeWidth="4" opacity="0.12" />
          <path d="M200 200 A80 80 0 0 0 120 120" fill="none" stroke="#1A3B8F" strokeWidth="4" opacity="0.08" />
          <rect x="160" y="160" width="24" height="24" rx="4" fill="#F58220" opacity="0.10" />
        </svg>
      </div>
    );
  }

  return null;
}
