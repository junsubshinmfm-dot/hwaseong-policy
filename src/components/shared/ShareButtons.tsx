'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyToClipboard } from '@/lib/share';

interface ShareButtonsProps {
  title: string;
  description: string;
  url: string;
  direction?: 'row' | 'column';
}

export default function ShareButtons({ title, description, url, direction = 'row' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const handleCopyLink = async () => {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const { shareNative } = await import('@/lib/share');
    await shareNative(title, description, url);
  };

  const handleFacebookShare = () => {
    const shareUrl = encodeURIComponent(url);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const btnBase =
    'relative p-2.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95';

  return (
    <div className={`flex items-center gap-2 ${direction === 'column' ? 'flex-col' : ''}`}>
      {/* Facebook */}
      <button
        onClick={handleFacebookShare}
        onMouseEnter={() => setTooltip('fb')}
        onMouseLeave={() => setTooltip(null)}
        className={`${btnBase} bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-lg shadow-[#1877F2]/20`}
        aria-label="Facebook 공유"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <Tooltip show={tooltip === 'fb'} label="Facebook" />
      </button>

      {/* 공유 API (모바일) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          onMouseEnter={() => setTooltip('share')}
          onMouseLeave={() => setTooltip(null)}
          className={`${btnBase} bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-lg shadow-gray-200/30`}
          aria-label="공유"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <Tooltip show={tooltip === 'share'} label="공유" />
        </button>
      )}

      {/* 링크 복사 */}
      <button
        onClick={handleCopyLink}
        onMouseEnter={() => setTooltip('copy')}
        onMouseLeave={() => setTooltip(null)}
        className={`${btnBase} text-gray-700 shadow-lg shadow-gray-200/30 ${
          copied
            ? 'bg-green-500/20 border border-green-500/30'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
        aria-label="링크 복사"
      >
        {copied ? (
          <motion.svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </motion.svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
        <Tooltip show={tooltip === 'copy'} label={copied ? '복사 완료!' : '링크 복사'} />
      </button>
    </div>
  );
}

function Tooltip({ show, label }: { show: boolean; label: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                     text-sm text-white bg-gray-800 px-2 py-1 rounded pointer-events-none"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
