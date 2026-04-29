'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaticFallbackProps {
  onSkip: () => void;
}

export default function StaticFallback({ onSkip }: StaticFallbackProps) {
  const [showSlogan, setShowSlogan] = useState(false);
  const [fading, setFading] = useState(false);

  const handleClick = () => {
    if (showSlogan) return;
    setShowSlogan(true);
    setTimeout(() => setFading(true), 3000);
    setTimeout(() => onSkip(), 3500);
  };

  return (
    <div
      className="relative w-full h-full bg-[#0D1F4D] cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {/* 별 배경 */}
      <div className="absolute inset-0">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* 정적 지구 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative"
        >
          <div
            className="w-64 h-64 md:w-96 md:h-96 rounded-full shadow-2xl"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #2B55B2 0%, #1A3B8F 30%, #152F73 50%, #0D1F4D 80%, #060C21 100%)',
              boxShadow:
                '0 0 80px rgba(26, 59, 143, 0.4), inset -20px -20px 60px rgba(0, 0, 0, 0.5)',
            }}
          />
          <div
            className="absolute inset-[-8px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, transparent 48%, rgba(43, 85, 178, 0.2) 50%, transparent 52%)',
            }}
          />
        </motion.div>
      </div>

      {/* 클릭 유도 */}
      <AnimatePresence>
        {!showSlogan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ marginTop: '280px' }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg className="w-8 h-8 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </motion.div>
            <p className="text-white/50 text-base">클릭하세요</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 슬로건 */}
      <AnimatePresence>
        {showSlogan && (
          <motion.div
            key="slogan"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="text-center px-6">
              <p className="text-[#F58220] text-sm tracking-[0.3em] uppercase mb-3 font-bold"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                정명근
              </p>
              <h1 className="text-white text-3xl md:text-5xl font-bold mb-3 leading-tight"
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>
                시민제안으로 만드는
              </h1>
              <p className="text-[#F58220] text-xl md:text-2xl font-bold"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                2030 정명근의 약속
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 페이드 아웃 */}
      <AnimatePresence>
        {fading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-[#0D1F4D] z-30"
          />
        )}
      </AnimatePresence>

      {/* 건너뛰기 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
        className="absolute bottom-8 right-8 z-20
                   text-white/40 hover:text-white/90
                   text-sm border border-white/15 hover:border-white/40
                   px-5 py-2.5 rounded-xl
                   transition-all duration-300
                   backdrop-blur-sm bg-white/5 hover:bg-white/10"
      >
        건너뛰기 &rarr;
      </motion.button>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D1F4D] to-transparent pointer-events-none" />
    </div>
  );
}
