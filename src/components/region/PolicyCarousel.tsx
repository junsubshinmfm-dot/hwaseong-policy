'use client';

import { useRef, useEffect, type MutableRefObject } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import PolicyCard from './PolicyCard';
import type { CategoryKey } from '@/data/categories';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

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

interface PolicyCarouselProps {
  policies: Policy[];
  activeFilter: CategoryKey | null;
  onCardClick: (policy: Policy) => void;
  /** 외부에서 Swiper 인스턴스를 참조할 수 있도록 ref 전달 */
  swiperRef?: MutableRefObject<SwiperType | null>;
  /** 활성 슬라이드 변경 콜백 (realIndex 기준) */
  onActiveIndexChange?: (index: number) => void;
}

export default function PolicyCarousel({
  policies,
  activeFilter,
  onCardClick,
  swiperRef: externalRef,
  onActiveIndexChange,
}: PolicyCarouselProps) {
  const internalRef = useRef<SwiperType | null>(null);
  const swiperRef = externalRef || internalRef;

  const filtered = activeFilter
    ? policies.filter((p) => p.category === activeFilter)
    : policies;

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0, 300);
    }
  }, [activeFilter, swiperRef]);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-base">
        해당 분야의 공약이 없습니다
      </div>
    );
  }

  return (
    <Swiper
      onSwiper={(s) => {
        swiperRef.current = s;
      }}
      onSlideChange={(s) => {
        onActiveIndexChange?.(s.realIndex);
      }}
      modules={[Navigation, FreeMode]}
      navigation
      freeMode={{ enabled: true, sticky: true }}
      spaceBetween={16}
      slidesPerView={1.15}
      breakpoints={{
        480: { slidesPerView: 1.5, spaceBetween: 16 },
        640: { slidesPerView: 2, spaceBetween: 16 },
        768: { slidesPerView: 2.5, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 20 },
        1280: { slidesPerView: 3.5, spaceBetween: 20 },
      }}
      className="!pb-2"
    >
      {filtered.map((policy) => (
        <SwiperSlide key={policy.id} className="!h-auto">
          <PolicyCard policy={policy} onClick={() => onCardClick(policy)} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
