'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { REGIONS, CATEGORIES, type RegionKey, type CategoryKey } from '@/data/categories';
import policiesData from '@/data/policies.json';

/**
 * 각 구청 소재지 + 관할 읍면동 중심 좌표 (Mapcarta/경기도 공공데이터 기반)
 * 만세구: 향남읍 (우정·향남·남양·마도·송산·서신·팔탄·장안·양감·새솔동)
 * 효행구: 봉담읍 (봉담·매송·비봉·정남·기배동)
 * 병점구: 병점동 (진안·병점1·2·반월·화산동)
 * 동탄구: 동탄   (동탄1~9동)
 */
const REGION_CENTERS: Record<RegionKey, { lat: number; lng: number }> = {
  manse:      { lat: 37.138, lng: 126.925 },
  hyohaeng:   { lat: 37.185, lng: 126.933 },
  byeongjeom: { lat: 37.207, lng: 127.042 },
  dongtan:    { lat: 37.187, lng: 127.098 },
};

// 화성시 대략적 경계 (이 범위 밖이면 화성시 외 지역)
const HWASEONG_BOUNDS = {
  latMin: 37.05, latMax: 37.30,
  lngMin: 126.65, lngMax: 127.15,
};

/** 위도/경도 보정된 거리 계산 (km 근사치) */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const LAT_KM = 111.0;  // 위도 1도 ≈ 111km
  const LNG_KM = 88.8;   // 한국(37도) 기준 경도 1도 ≈ 88.8km
  const dLat = (lat1 - lat2) * LAT_KM;
  const dLng = (lng1 - lng2) * LNG_KM;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function isInHwaseong(lat: number, lng: number): boolean {
  return lat >= HWASEONG_BOUNDS.latMin && lat <= HWASEONG_BOUNDS.latMax
    && lng >= HWASEONG_BOUNDS.lngMin && lng <= HWASEONG_BOUNDS.lngMax;
}

function findClosestRegion(lat: number, lng: number): { region: RegionKey; distance: number } {
  let closest: RegionKey = 'dongtan';
  let minDist = Infinity;

  (Object.entries(REGION_CENTERS) as [RegionKey, { lat: number; lng: number }][]).forEach(([id, center]) => {
    const dist = distanceKm(lat, lng, center.lat, center.lng);
    if (dist < minDist) {
      minDist = dist;
      closest = id;
    }
  });

  return { region: closest, distance: minDist };
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        if (!isInHwaseong(latitude, longitude)) {
          // 화성시 밖이지만 가장 가까운 권역은 표시
          const result = findClosestRegion(latitude, longitude);
          setRegion(result.region);
          setDistance(Math.round(result.distance));
          setStatus('outside');
          return;
        }

        const result = findClosestRegion(latitude, longitude);
        setRegion(result.region);
        setDistance(Math.round(result.distance * 10) / 10);
        setStatus('found');
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
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

  // found 또는 outside
  return (
    <div className="brand-card p-4">
      <h3 className="text-navy font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        우리동네 공약
      </h3>

      {/* 화성시 외 지역 안내 */}
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
            <span className="text-navy/30 text-xs">내 위치 기준 ({distance}km)</span>
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
