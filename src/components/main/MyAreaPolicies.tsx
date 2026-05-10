'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { REGIONS, CATEGORIES, type RegionKey, type CategoryKey } from '@/data/categories';
import { useSuggestions } from '@/hooks/useSuggestions';
import TimelineCrossfade from '@/components/timeline/TimelineCrossfade';

// 'common'은 지리적 좌표가 없는 가상 권역 — 지도 좌표 매핑에서 제외.
const REGION_POINTS: Record<Exclude<RegionKey, 'common'>, { lat: number; lng: number }[]> = {
  manse: [
    { lat: 37.138, lng: 126.925 }, { lat: 37.210, lng: 126.822 },
    { lat: 37.098, lng: 126.844 }, { lat: 37.154, lng: 126.790 },
    { lat: 37.200, lng: 126.730 }, { lat: 37.170, lng: 126.690 },
    { lat: 37.110, lng: 126.950 }, { lat: 37.060, lng: 126.880 },
    { lat: 37.080, lng: 126.970 },
  ],
  hyohaeng: [
    { lat: 37.185, lng: 126.933 }, { lat: 37.220, lng: 126.960 },
    { lat: 37.248, lng: 126.885 }, { lat: 37.145, lng: 126.985 },
  ],
  byeongjeom: [
    { lat: 37.207, lng: 127.042 }, { lat: 37.215, lng: 127.058 },
    { lat: 37.230, lng: 127.020 }, { lat: 37.195, lng: 127.020 },
  ],
  dongtan: [
    { lat: 37.187, lng: 127.098 }, { lat: 37.200, lng: 127.080 },
    { lat: 37.175, lng: 127.110 }, { lat: 37.165, lng: 127.130 },
    { lat: 37.195, lng: 127.120 },
  ],
};

const HWASEONG_BOUNDS = {
  latMin: 37.03, latMax: 37.30,
  lngMin: 126.65, lngMax: 127.18,
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInHwaseong(lat: number, lng: number): boolean {
  return lat >= HWASEONG_BOUNDS.latMin && lat <= HWASEONG_BOUNDS.latMax
    && lng >= HWASEONG_BOUNDS.lngMin && lng <= HWASEONG_BOUNDS.lngMax;
}

function findClosestRegion(lat: number, lng: number): { region: RegionKey; distance: number } {
  let closest: RegionKey = 'dongtan';
  let minDist = Infinity;

  (Object.entries(REGION_POINTS) as [RegionKey, { lat: number; lng: number }[]][]).forEach(([id, points]) => {
    for (const pt of points) {
      const dist = haversineKm(lat, lng, pt.lat, pt.lng);
      if (dist < minDist) {
        minDist = dist;
        closest = id;
      }
    }
  });

  return { region: closest, distance: Math.round(minDist * 10) / 10 };
}

export default function MyAreaPolicies() {
  const router = useRouter();
  const { suggestions } = useSuggestions();
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'outside' | 'denied' | 'error'>('idle');
  const [region, setRegion] = useState<RegionKey | null>(null);
  const [distance, setDistance] = useState<number>(0);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const handlePosition = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const result = findClosestRegion(latitude, longitude);
      setRegion(result.region);
      setDistance(result.distance);
      setStatus(isInHwaseong(latitude, longitude) ? 'found' : 'outside');
    };

    const handleError = (err: GeolocationPositionError) => {
      setStatus(err.code === 1 ? 'denied' : 'error');
    };

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      () => {
        navigator.geolocation.getCurrentPosition(
          handlePosition,
          handleError,
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const regionMeta = region ? REGIONS[region] : null;
  const regionSuggestions = useMemo(() => {
    return region ? suggestions.filter((s) => s.region === region).slice(0, 5) : [];
  }, [suggestions, region]);

  const locationIcon = (
    <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  if (status === 'idle') {
    return (
      <div className="brand-card p-4">
        <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          {locationIcon}
          <TimelineCrossfade
            past={<span>우리동네 정책제안</span>}
            future={<span>우리동네 공약</span>}
          />
        </h3>
        <button onClick={requestLocation}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-navy to-navy-light hover:shadow-lg hover:scale-[1.02] transition-all">
          <TimelineCrossfade
            past={<span>내 위치로 우리동네 제안 찾기</span>}
            future={<span>내 위치로 우리동네 공약 찾기</span>}
          />
        </button>
        <p className="text-navy/25 text-[10px] text-center mt-2">위치 정보를 사용하여 가장 가까운 권역을 찾습니다</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="brand-card p-4">
        <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          {locationIcon}
          <TimelineCrossfade
            past={<span>우리동네 정책제안</span>}
            future={<span>우리동네 공약</span>}
          />
        </h3>
        <div className="flex items-center justify-center py-4 gap-2">
          <div className="w-4 h-4 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
          <span className="text-navy/50 text-xs font-medium">위치 확인 중...</span>
        </div>
      </div>
    );
  }

  if (status === 'denied' || status === 'error') {
    return (
      <div className="brand-card p-4">
        <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          {locationIcon}
          <TimelineCrossfade
            past={<span>우리동네 정책제안</span>}
            future={<span>우리동네 공약</span>}
          />
        </h3>
        <p className="text-navy/40 text-xs text-center py-2">
          {status === 'denied' ? '위치 권한이 거부되었습니다' : '위치를 확인할 수 없습니다'}
        </p>
        <button onClick={() => setStatus('idle')}
          className="w-full py-2 rounded-xl text-xs font-bold text-navy border border-navy/10 hover:bg-navy-50 transition-colors">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="brand-card p-4">
      <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        {locationIcon}
        우리동네 정책제안
      </h3>

      {status === 'outside' && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-orange/10 text-orange text-xs font-medium">
          현재 화성시 밖에 계십니다 (약 {distance}km). 가장 가까운 권역을 표시합니다.
        </div>
      )}

      {regionMeta && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: regionMeta.color }} />
          <span className="text-navy font-extrabold text-sm">{regionMeta.label}</span>
          {status === 'found' && (
            <span className="text-navy/30 text-xs">내 위치에서 {distance}km</span>
          )}
        </div>
      )}

      {regionSuggestions.length === 0 ? (
        <div className="text-center py-3">
          <p className="text-navy/30 text-xs mb-2">
            <TimelineCrossfade
              past={<span>아직 이 지역의 제안이 없습니다</span>}
              future={<span>이 지역에 곧 공약이 추가됩니다</span>}
            />
          </p>
          <button
            onClick={() => router.push('/suggestions/new')}
            className="text-orange text-xs font-bold hover:underline"
          >
            <TimelineCrossfade
              past={<span>첫 번째 정책을 제안해보세요!</span>}
              future={<span>전체 공약 둘러보기</span>}
            />
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {regionSuggestions.map((suggestion, i) => {
            const catColor = CATEGORIES[suggestion.category as CategoryKey]?.color || '#1A3B8F';
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/region/${suggestion.region}?suggestion=${suggestion.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-navy-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                  style={{ backgroundColor: catColor }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy font-bold text-xs truncate">{suggestion.title}</p>
                  <p className="text-navy/30 text-[10px] truncate">{suggestion.content}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {region && (
        <button
          onClick={() => router.push(`/region/${region}`)}
          className="w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
          style={{ backgroundColor: `${regionMeta?.color}15`, color: regionMeta?.color }}
        >
          <TimelineCrossfade
            past={<span>{regionMeta?.label} 전체 제안 보기</span>}
            future={<span>{regionMeta?.label} 전체 공약 보기</span>}
          />
        </button>
      )}
    </div>
  );
}
