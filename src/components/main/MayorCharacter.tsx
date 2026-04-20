'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 정명근 도트 캐릭터 — 지도 위를 자유롭게 뛰어다님
 * - 8~12초마다 랜덤 위치로 이동 (느리게)
 * - 방향에 따라 좌우 반전
 * - 걷기 애니메이션 (위아래 살짝 튐)
 * - 클릭 시 말풍선 (선택 오버레이 열리면 비활성)
 */

const QUOTES = [
  '안녕하세요, 정명근입니다!',
  '시민과 함께 만드는 화성의 미래!',
  '여러분의 정책 제안을 기다리고 있어요!',
  '화성특례시, 제가 이루겠습니다',
  '아이디어가 있다면 꼭 남겨주세요!',
  '모든 제안을 소중히 검토하겠습니다',
];

interface MayorCharacterProps {
  disabled?: boolean;
}

export default function MayorCharacter({ disabled = false }: MayorCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);
  const [quote, setQuote] = useState('');

  // 랜덤 위치로 이동
  useEffect(() => {
    const move = () => {
      const newX = 10 + Math.random() * 80;
      const newY = 20 + Math.random() * 60;

      setDirection(newX > position.x ? 'right' : 'left');
      setIsWalking(true);
      setPosition({ x: newX, y: newY });

      // 이동 시간 6초 이후 멈춤
      setTimeout(() => setIsWalking(false), 6000);
    };

    const interval = setInterval(move, 8000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [position.x]);

  const handleClick = () => {
    if (disabled) return;
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 3500);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-[5]"
    >
      <motion.div
        className={`absolute w-7 h-10 sm:w-9 sm:h-12 lg:w-10 lg:h-14 ${disabled ? 'pointer-events-none' : 'pointer-events-auto'} cursor-pointer`}
        animate={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          x: '-50%',
          y: '-100%',
        }}
        transition={{
          left: { duration: 6, ease: 'easeInOut' },
          top: { duration: 6, ease: 'easeInOut' },
        }}
        onClick={handleClick}
      >
        {/* 말풍선 */}
        <AnimatePresence>
          {showSpeech && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.8 }}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ top: -44 }}
            >
              <div className="relative px-3 py-1.5 rounded-xl bg-white shadow-xl border border-navy/20">
                <p className="text-navy text-[11px] font-bold">{quote}</p>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-navy/20 rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 캐릭터 */}
        <motion.div
          animate={isWalking ? {
            y: [0, -2, 0, -2, 0],
          } : {
            y: [0, -1, 0],
          }}
          transition={{
            duration: isWalking ? 0.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            opacity: disabled ? 0.5 : 1,
            transition: 'opacity 0.3s',
          }}
        >
          <CharacterSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * 정명근 도트 캐릭터 SVG (픽셀 아트)
 * - 검은 머리 (깔끔한 2:8 가르마)
 * - 안경
 * - 네이비 수트, 흰 셔츠, 민주당 블루 넥타이
 */
function CharacterSVG() {
  return (
    <svg viewBox="0 0 32 42" width="100%" height="100%" shapeRendering="crispEdges">
      {/* 머리카락 (검은색) */}
      <rect x="8" y="2" width="16" height="2" fill="#1a1a1a" />
      <rect x="6" y="4" width="20" height="2" fill="#1a1a1a" />
      <rect x="6" y="6" width="20" height="2" fill="#1a1a1a" />
      <rect x="6" y="8" width="2" height="2" fill="#1a1a1a" />
      <rect x="24" y="8" width="2" height="2" fill="#1a1a1a" />

      {/* 이마 가르마 (살짝) */}
      <rect x="14" y="4" width="2" height="2" fill="#2a2a2a" />

      {/* 얼굴 (살색) */}
      <rect x="8" y="8" width="16" height="2" fill="#F4C2A1" />
      <rect x="6" y="10" width="20" height="2" fill="#F4C2A1" />
      <rect x="6" y="12" width="20" height="2" fill="#F4C2A1" />
      <rect x="6" y="14" width="20" height="2" fill="#F4C2A1" />
      <rect x="6" y="16" width="20" height="2" fill="#F4C2A1" />
      <rect x="8" y="18" width="16" height="2" fill="#F4C2A1" />

      {/* 눈썹 */}
      <rect x="9" y="11" width="3" height="1" fill="#1a1a1a" />
      <rect x="20" y="11" width="3" height="1" fill="#1a1a1a" />

      {/* 안경 프레임 (검은색 뿔테) */}
      {/* 왼쪽 렌즈 */}
      <rect x="8" y="12" width="6" height="1" fill="#1a1a1a" />
      <rect x="8" y="15" width="6" height="1" fill="#1a1a1a" />
      <rect x="8" y="13" width="1" height="2" fill="#1a1a1a" />
      <rect x="13" y="13" width="1" height="2" fill="#1a1a1a" />
      {/* 오른쪽 렌즈 */}
      <rect x="18" y="12" width="6" height="1" fill="#1a1a1a" />
      <rect x="18" y="15" width="6" height="1" fill="#1a1a1a" />
      <rect x="18" y="13" width="1" height="2" fill="#1a1a1a" />
      <rect x="23" y="13" width="1" height="2" fill="#1a1a1a" />
      {/* 코다리 */}
      <rect x="14" y="13" width="4" height="1" fill="#1a1a1a" />

      {/* 눈 (안경 안) */}
      <rect x="10" y="13" width="2" height="2" fill="#1a1a1a" />
      <rect x="20" y="13" width="2" height="2" fill="#1a1a1a" />

      {/* 코 */}
      <rect x="15" y="16" width="2" height="1" fill="#D4A582" />

      {/* 입 (살짝 미소) */}
      <rect x="13" y="18" width="6" height="1" fill="#8B4A3A" />

      {/* 목 */}
      <rect x="13" y="20" width="6" height="2" fill="#E8B594" />

      {/* 수트 (네이비) */}
      <rect x="8" y="22" width="16" height="2" fill="#1A3B8F" />
      <rect x="6" y="24" width="20" height="2" fill="#1A3B8F" />
      <rect x="6" y="26" width="20" height="2" fill="#1A3B8F" />
      <rect x="6" y="28" width="20" height="2" fill="#1A3B8F" />
      <rect x="6" y="30" width="20" height="2" fill="#1A3B8F" />

      {/* 셔츠 (흰색) V자 */}
      <rect x="14" y="22" width="4" height="2" fill="#FFFFFF" />
      <rect x="15" y="24" width="2" height="2" fill="#FFFFFF" />

      {/* 민주당 블루 넥타이 */}
      <rect x="15" y="22" width="2" height="1" fill="#004EA2" />
      <rect x="15" y="25" width="2" height="3" fill="#004EA2" />
      <rect x="14" y="27" width="4" height="2" fill="#004EA2" />
      <rect x="14" y="29" width="4" height="1" fill="#003B7A" />

      {/* 팔 */}
      <rect x="4" y="24" width="2" height="6" fill="#1A3B8F" />
      <rect x="26" y="24" width="2" height="6" fill="#1A3B8F" />
      {/* 손 */}
      <rect x="4" y="30" width="2" height="2" fill="#F4C2A1" />
      <rect x="26" y="30" width="2" height="2" fill="#F4C2A1" />

      {/* 다리 (네이비 바지) */}
      <rect x="10" y="32" width="4" height="6" fill="#0D1F4D" />
      <rect x="18" y="32" width="4" height="6" fill="#0D1F4D" />

      {/* 신발 (검은색) */}
      <rect x="9" y="38" width="5" height="2" fill="#1a1a1a" />
      <rect x="18" y="38" width="5" height="2" fill="#1a1a1a" />
    </svg>
  );
}
