'use client';

import { useState, useEffect } from 'react';
import { reportSuggestion, isReported } from '@/lib/suggestions';

interface ReportButtonProps {
  suggestionId: string;
}

export default function ReportButton({ suggestionId }: ReportButtonProps) {
  const [reported, setReported] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setReported(isReported(suggestionId));
  }, [suggestionId]);

  const handleReport = async () => {
    const result = await reportSuggestion(suggestionId);
    if (result === -1) {
      // 이미 신고함
      setReported(true);
    } else {
      setReported(true);
    }
    setShowConfirm(false);
  };

  if (reported) {
    return (
      <span className="text-navy/20 text-[10px] font-medium">신고됨</span>
    );
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleReport}
          className="px-2 py-0.5 rounded-md bg-red-50 text-red-400 text-[10px] font-bold hover:bg-red-100 transition-colors">
          확인
        </button>
        <button onClick={() => setShowConfirm(false)}
          className="px-2 py-0.5 rounded-md bg-navy-50 text-navy/40 text-[10px] font-bold hover:bg-navy-100 transition-colors">
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-navy/15 hover:text-red-400 transition-colors"
      title="신고"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    </button>
  );
}
