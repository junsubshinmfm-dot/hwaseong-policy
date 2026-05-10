'use client';

import { useState, useCallback } from 'react';
import type { RegionKey } from '@/data/categories';

const HWASEONG_BOUNDS = {
  latMin: 37.03, latMax: 37.30,
  lngMin: 126.65, lngMax: 127.18,
};

// 'common'은 지리적 좌표가 없는 가상 권역 — 좌표 매핑에서 제외.
const REGION_POINTS: Record<Exclude<RegionKey, 'common'>, { lat: number; lng: number }[]> = {
  manse: [
    { lat: 37.138, lng: 126.925 },
    { lat: 37.210, lng: 126.822 },
    { lat: 37.098, lng: 126.844 },
    { lat: 37.154, lng: 126.790 },
    { lat: 37.200, lng: 126.730 },
    { lat: 37.170, lng: 126.690 },
    { lat: 37.110, lng: 126.950 },
    { lat: 37.060, lng: 126.880 },
    { lat: 37.080, lng: 126.970 },
  ],
  hyohaeng: [
    { lat: 37.185, lng: 126.933 },
    { lat: 37.220, lng: 126.960 },
    { lat: 37.248, lng: 126.885 },
    { lat: 37.145, lng: 126.985 },
  ],
  byeongjeom: [
    { lat: 37.207, lng: 127.042 },
    { lat: 37.215, lng: 127.058 },
    { lat: 37.230, lng: 127.020 },
    { lat: 37.195, lng: 127.020 },
  ],
  dongtan: [
    { lat: 37.187, lng: 127.098 },
    { lat: 37.200, lng: 127.080 },
    { lat: 37.175, lng: 127.110 },
    { lat: 37.165, lng: 127.130 },
    { lat: 37.195, lng: 127.120 },
  ],
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

export type GeoStatus = 'idle' | 'loading' | 'in_hwaseong' | 'outside' | 'denied' | 'error';

export function useGeoLocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [closestRegion, setClosestRegion] = useState<RegionKey | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const handlePosition = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const result = findClosestRegion(latitude, longitude);
      setClosestRegion(result.region);
      setStatus(isInHwaseong(latitude, longitude) ? 'in_hwaseong' : 'outside');
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
  }, []);

  return { status, closestRegion, requestLocation };
}
