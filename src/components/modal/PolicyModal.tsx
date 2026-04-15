'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import CategoryTag from '@/components/shared/CategoryTag';
import ShareButtons from '@/components/shared/ShareButtons';
import LikeButton from '@/components/shared/LikeButton';
import { REGIONS, type CategoryKey, type RegionKey } from '@/data/categories';

interface Policy {
  id: number;
  title: string;
  summary: string;
  detail: string;
  region: string;
  category: string;
  videoUrl: string;
  thumbnail: string;
  priority: number;
}

interface PolicyModalProps {
  policy: Policy;
  onClose: () => void;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

const categoryIcons: Record<string, string> = {
  traffic: '🚇', welfare: '🏥', education: '📚', economy: '💰',
  environment: '🌳', safety: '🛡️', culture: '🎭', admin: '🏛️',
};

export default function PolicyModal({ policy, onClose }: PolicyModalProps) {
  const regionMeta = REGIONS[policy.region as RegionKey];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const youtubeId = policy.videoUrl ? extractYouTubeId(policy.videoUrl) : null;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/region/${policy.region}?policy=${policy.id}`
    : '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-navy-dark/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 pointer-events-none"
      >
        <div
          className="pointer-events-auto relative w-full h-full md:h-auto md:max-h-[90vh]
                     md:max-w-3xl md:rounded-2xl
                     bg-white border-0 md:border md:border-navy-100/30
                     overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl
                       bg-white/80 backdrop-blur-sm border border-navy-100/30 shadow-sm
                       flex items-center justify-center
                       text-gray-500 hover:text-navy hover:bg-navy-50
                       transition-all duration-200"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 영상 또는 썸네일 */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-navy-50 to-navy-100/30">
            {/* 기하학 장식 */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[3px] border-white/20 pointer-events-none" />

            {youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&playsinline=1`}
                title={policy.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                // @ts-expect-error -- iOS playsinline attribute
                playsInline
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl opacity-15">
                  {categoryIcons[policy.category] || '📋'}
                </span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-navy text-white shadow-sm
                             flex items-center justify-center text-base font-bold">
                {policy.id}
              </span>
              <CategoryTag category={policy.category as CategoryKey} size="md" />
              {regionMeta && (
                <span
                  className="text-sm px-2.5 py-1 rounded-lg font-semibold"
                  style={{
                    backgroundColor: `${regionMeta.color}15`,
                    color: regionMeta.color,
                  }}
                >
                  {regionMeta.label}
                </span>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6 md:p-8">
            <h2 className="text-navy text-3xl md:text-4xl font-bold mb-2 leading-tight">
              {policy.title}
            </h2>
            <p className="text-gray-500 text-base mb-6">
              {policy.summary}
            </p>

            <div className="h-px bg-navy-100/30 mb-6" />

            <div className="space-y-5 mb-8">
              <DetailSection title="배경" content={policy.detail} />
              <DetailSection
                title="추진 방향"
                content={`${policy.title}을(를) 위한 구체적인 실행 계획을 수립하고 단계적으로 추진합니다. 관련 부서 간 협력 체계를 구축하여 효율적인 사업 추진을 도모합니다.`}
              />
              <DetailSection
                title="기대 효과"
                content={`${regionMeta?.label || '화성시'} 주민의 삶의 질 향상과 지역 발전에 기여하며, 지속 가능한 도시 성장의 기반을 마련합니다.`}
              />
            </div>

            <div className="h-px bg-navy-100/30 mb-6" />

            <div className="flex items-center justify-between">
              <ShareButtons title={policy.title} description={policy.summary} url={shareUrl} />
              <LikeButton policyId={policy.id} size="md" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-navy/50 text-sm font-semibold uppercase tracking-wider mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-base leading-relaxed">
        {content}
      </p>
    </div>
  );
}
