'use client';

import { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import SuggestionCard from '@/components/suggestion/SuggestionCard';
import type { Suggestion } from '@/types/suggestion';

import 'swiper/css';
import 'swiper/css/free-mode';

interface LikedSuggestionsCarouselProps {
  suggestions: Suggestion[];
  onCardClick: (suggestion: Suggestion) => void;
  /** 최대 노출 개수 */
  limit?: number;
}

export default function LikedSuggestionsCarousel({
  suggestions,
  onCardClick,
  limit = 10,
}: LikedSuggestionsCarouselProps) {
  const topLiked = useMemo(() => {
    return [...suggestions]
      .sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return b.createdAt - a.createdAt;
      })
      .slice(0, limit);
  }, [suggestions, limit]);

  if (topLiked.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-2xl bg-white/50 border border-navy/[0.06] text-navy/30 text-sm">
        아직 등록된 시민제안이 없습니다
      </div>
    );
  }

  return (
    <Swiper
      modules={[Autoplay, FreeMode]}
      autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      freeMode={{ enabled: true, sticky: true }}
      loop={topLiked.length > 2}
      spaceBetween={12}
      slidesPerView={1.2}
      breakpoints={{
        480: { slidesPerView: 1.5, spaceBetween: 14 },
        640: { slidesPerView: 2, spaceBetween: 16 },
        768: { slidesPerView: 2.5, spaceBetween: 18 },
        1024: { slidesPerView: 3, spaceBetween: 20 },
        1280: { slidesPerView: 3.5, spaceBetween: 20 },
      }}
      className="!pb-2"
    >
      {topLiked.map((s) => (
        <SwiperSlide key={s.id} className="!h-auto">
          <SuggestionCard suggestion={s} onClick={() => onCardClick(s)} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
