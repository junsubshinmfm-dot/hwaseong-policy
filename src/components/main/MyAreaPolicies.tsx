'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { REGIONS, CATEGORIES, type RegionKey, type CategoryKey } from '@/data/categories';
import policiesData from '@/data/policies.json';

/**
 * 각 권역의 관할 읍면동 대표 좌표 (다중 포인트 매칭)
 * 하나의 중심점이 아니라 관할 지역 여러 곳의 좌표로 판단
 */
const REGION_POINTS: Record<RegionKey, { lat: number; lng: number }[]> = {
  // 만세구: 향남읍, 남양읍, 우정읍, 마도면, 송산면, 서신면, 팔탄면, 장안면, 양감면
  manse: [
    { lat: 37.138, lng: 126.925 },  // 향남읍
    { lat: 37.210, lng: 126.822 },  // 남양읍
    { lat: 37.098, lng: 126.844 },  // 우정읍
    { lat: 37.154, lng: 126.790 },  // 마도면
    { lat: 37.200, lng: 126.730 },  // 송산면
    { lat: 37.170, lng: 126.690 },  // 서신면
    { lat: 37.110, lng: 126.950 },  // 팔탄면
    { lat: 37.060, lng: 126.880 },  // 장안면
    { lat: 37.080, lng: 126.970 },  // 양감면
  ],
  // 효행구: 봉담읍, 매송면, 비봉면, 정남면
  hyohaeng: [
    { lat: 37.185, lng: 126.933 },  // 봉담읍
    { lat: 37.220, lng: 126.960 },  // 매송면
    { lat: 37.248, lng: 126.885 },  // 비봉면
    { lat: 37.145, lng: 126.985 },  // 정남면
  ],
  // 병점구: 병점동, 진안동, 반월동, 화산동
  byeongjeom: [
    { lat: 37.207, lng: 127.042 },  // 병점동
    { lat: 37.215, lng: 127.058 },  // 진안동
    { lat: 37.230, lng: 127.020 },  // 반월동
    { lat: 37.195, lng: 127.020 },  // 화산동
  ],
  // 동탄구: 동탄1~9동
  dongtan: [
    { lat: 37.187, lng: 127.098 },  // 동탄 중심
    { lat: 37.200, lng: 127.080 },  // 동탄1신도시
    { lat: 37.175, lng: 127.110 },  // 동탄2신도시 서쪽
    { lat: 37.165, lng: 127.130 },  // 동탄2신도시 동쪽
    { lat: 37.195, lng: 127.120 },  // 동탄 북동
  ],
};

const HWASEONG_BOUNDS = {
  latMin: 37.03, latMax: 37.30,
  lngMin: 126.65, lngMax: 127.18,
};

/** Haversine 공식으로 정확한 거리 계산 (km) */
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

/** 다중 포인트 중 가장 가까운 포인트로 권역 판단 */
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
      if (err.code === 1) {
        setStatus('denied');
      } else {
        setStatus('error');
      }
    };

    // 모바일에서는 highAccuracy가 느릴 수 있으므로 먼저 빠른 결과 시도
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      () => {
        // 빠른 결과 실패 시 → 정밀 GPS로 재시도
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
  const policies = region ? policiesData.filter((p) => p.region === region).slice(0, 5) : [];

  if (status === 'idle') {
    return (
      <div className="brand-card p-4">
        <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          우리동네 공약
        </h3>
        <button onClick={requestLocation}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-navy to-navy-light hover:shadow-lg hover:scale-[1.02] transition-all">
          내 위치로 우리동네 공약 찾기
        </button>
        <p className="text-navy/25 text-[10px] text-center mt-2">위치 정보를 사용하여 가장 가까운 권역을 찾습니다</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="brand-card p-4">
        <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          우리동네 공약
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
          <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          우리동네 공약
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
        <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        우리동네 공약
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

      <div className="space-y-1.5">
        {policies.map((policy, i) => {
          const catColor = CATEGORIES[policy.category as CategoryKey]?.color || '#1A3B8F';
          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/region/${policy.region}?policy=${policy.id}`)}
              className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer hover:bg-navy-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                style={{ backgroundColor: catColor }}>
                {policy.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-navy font-bold text-xs truncate">{policy.title}</p>
                <p className="text-navy/30 text-[10px] truncate">{policy.summary}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {region && (
        <button
          onClick={() => router.push(`/region/${region}`)}
          className="w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
          style={{ backgroundColor: `${regionMeta?.color}15`, color: regionMeta?.color }}
        >
          {regionMeta?.label} 전체 공약 보기
        </button>
      )}
    </div>
  );
}
