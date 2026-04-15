'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikes } from '@/hooks/useLikes';

interface LikeButtonProps {
  policyId: number;
  size?: 'sm' | 'md';
}

export default function LikeButton({ policyId, size = 'md' }: LikeButtonProps) {
  const { count, liked, toggleLike } = useLikes(policyId);
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    if (!liked) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
    }
    toggleLike();
  };

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-sm gap-1.5'
    : 'px-4 py-2 text-base gap-2';

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center rounded-full font-medium transition-all duration-300 ${sizeClasses}
        ${liked
          ? 'bg-orange-50 text-orange border border-orange/30'
          : 'bg-navy-50 text-navy/50 border border-navy-100/40 hover:bg-navy-100 hover:text-navy'
        }`}
    >
      <div className="relative">
        <motion.svg
          className={iconSize}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={animate ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>

        {/* 파티클 효과 */}
        <AnimatePresence>
          {animate && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-orange"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i * 60 * Math.PI) / 180) * 16,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 16,
                    opacity: 0,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <span className="font-medium">{count > 0 ? count : ''}</span>
    </button>
  );
}
