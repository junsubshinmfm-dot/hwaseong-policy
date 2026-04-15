'use client';

import { useState, useEffect } from 'react';

export type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'fog' | 'drizzle' | 'thunderstorm';

interface WeatherInfo {
  type: WeatherType;
  label: string;
  temp: number | null;
  description: string;
}

const API_KEY_STORAGE = 'openweathermap-api-key';
// 화성시 좌표
const HWASEONG_LAT = 37.1994;
const HWASEONG_LON = 126.831;

function mapWeatherCode(id: number): WeatherType {
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'fog';
  if (id === 800) return 'clear';
  return 'clouds';
}

const WEATHER_LABELS: Record<WeatherType, string> = {
  clear: '맑음',
  clouds: '흐림',
  rain: '비',
  snow: '눈',
  fog: '안개',
  drizzle: '이슬비',
  thunderstorm: '천둥번개',
};

/**
 * 화성시 실시간 날씨 조회
 * - API 키가 없으면 시간대 기반 기본값 사용
 * - localStorage에 'openweathermap-api-key' 키로 저장 가능
 */
export function useWeather(): WeatherInfo {
  const [weather, setWeather] = useState<WeatherInfo>({
    type: 'clear',
    label: '맑음',
    temp: null,
    description: '날씨 정보 로딩 중',
  });

  useEffect(() => {
    const apiKey = typeof window !== 'undefined'
      ? localStorage.getItem(API_KEY_STORAGE) || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      : null;

    if (!apiKey) {
      // API 키 없으면 기본값
      setWeather({
        type: 'clear',
        label: '맑음',
        temp: null,
        description: 'API 키 미설정 (기본값)',
      });
      return;
    }

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${HWASEONG_LAT}&lon=${HWASEONG_LON}&appid=${apiKey}&units=metric&lang=kr`
        );
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const weatherId = data.weather[0]?.id ?? 800;
        const type = mapWeatherCode(weatherId);

        setWeather({
          type,
          label: WEATHER_LABELS[type],
          temp: Math.round(data.main.temp),
          description: data.weather[0]?.description || '',
        });
      } catch {
        setWeather({
          type: 'clear',
          label: '맑음',
          temp: null,
          description: '날씨 정보 불러오기 실패',
        });
      }
    };

    fetchWeather();
    // 30분마다 갱신
    const interval = setInterval(fetchWeather, 1800000);
    return () => clearInterval(interval);
  }, []);

  return weather;
}
