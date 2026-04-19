'use client';

import { useState, useEffect } from 'react';
import { reportSuggestion, isReported } from '@/lib/suggestions';

interface ReportButtonProps {
  suggestionId: string;
  size?: 'sm' | 'md';
}

export default function ReportButton({ suggestionId, size = 'sm' }: ReportButtonProps) {
  const [reported, setReported] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setReported(isReported(suggestionId));
  }, [suggestionId]);

  const handleReport = async () => {
    const result = await reportSuggestion(suggestionId);
    if (result === -1) {
      setReported(true);
    } else {
      setReported(true);
    }
    setShowConfirm(false);
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-[10px] gap-1'
    : 'px-3 py-1.5 text-xs gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (reported) {
    return (
      <span className={`flex items-center rounded-full text-navy/30 font-medium ${sizeClasses}`}>
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        신고됨
      </span>
    );
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleReport}
          className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[10px] font-bold hover:bg-red-100 transition-colors">
          신고하기
        </button>
        <button onClick={() => setShowConfirm(false)}
          className="px-2 py-1 rounded-lg bg-navy-50 text-navy/40 text-[10px] font-bold hover:bg-navy-100 transition-colors">
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`flex items-center rounded-full font-medium transition-all
                  bg-navy-50 text-navy/40 border border-navy-100/40 hover:bg-red-50 hover:text-red-400 hover:border-red-200 ${sizeClasses}`}
      title="신고"
    >
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
      </svg>
    </button>
  );
}
