'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import DashCard from './DashCard';

import 'swiper/css';
import 'swiper/css/free-mode';

interface RegionStats {
  population: {
    total: number; male: number; female: number;
    children: number; youth: number; young: number; elderly: number;
    trend: number[];
  };
  economy: {
    employmentRate: number; unemploymentRate: number;
    grdp: number; businesses: number; workers: number;
  };
  education: {
    kindergartens: number; elementary: number; middle: number; high: number;
    students: { elementary: number; middle: number; high: number };
  };
  welfare: {
    hospitals: number; clinics: number; pharmacies: number; healthCenters: number;
  };
  traffic: {
    busRoutes: number; accidents: number; roadLength: number;
  };
  environment: {
    parkArea: number; greenRatio: number; airQuality: number;
  };
}

interface DashboardProps {
  stats: RegionStats;
  regionColor: string;
}

function fmt(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '만';
  if (n >= 1000) return (n / 1000).toFixed(1) + '천';
  return n.toLocaleString();
}

export default function Dashboard({ stats, regionColor }: DashboardProps) {
  const cards = [
    {
      title: '인구',
      icon: '👥',
      color: '#4A90D9',
      chartData: stats.population.trend,
      items: [
        { label: '총 인구', value: fmt(stats.population.total) },
        { label: '남성', value: fmt(stats.population.male) },
        { label: '청년', value: fmt(stats.population.young) },
        { label: '고령', value: fmt(stats.population.elderly) },
      ],
    },
    {
      title: '경제',
      icon: '💰',
      color: '#9B59B6',
      chartData: [stats.economy.grdp * 0.7, stats.economy.grdp * 0.8, stats.economy.grdp * 0.85, stats.economy.grdp * 0.95, stats.economy.grdp],
      items: [
        { label: '고용률', value: stats.economy.employmentRate + '%' },
        { label: '실업률', value: stats.economy.unemploymentRate + '%' },
        { label: 'GRDP', value: stats.economy.grdp + '조' },
        { label: '사업체', value: fmt(stats.economy.businesses) },
      ],
    },
    {
      title: '교육',
      icon: '📚',
      color: '#5CB85C',
      items: [
        { label: '유치원', value: stats.education.kindergartens + '개' },
        { label: '초등학교', value: stats.education.elementary + '개' },
        { label: '중학교', value: stats.education.middle + '개' },
        { label: '고등학교', value: stats.education.high + '개' },
      ],
    },
    {
      title: '복지',
      icon: '🏥',
      color: '#E8734A',
      items: [
        { label: '병원', value: stats.welfare.hospitals + '개' },
        { label: '의원', value: stats.welfare.clinics + '개' },
        { label: '약국', value: stats.welfare.pharmacies + '개' },
        { label: '보건소', value: stats.welfare.healthCenters + '개' },
      ],
    },
    {
      title: '교통',
      icon: '🚇',
      color: regionColor,
      items: [
        { label: '버스 노선', value: stats.traffic.busRoutes + '개' },
        { label: '사고 건수', value: stats.traffic.accidents + '건' },
        { label: '도로 연장', value: stats.traffic.roadLength + 'km' },
        { label: '', value: '' },
      ],
    },
    {
      title: '환경',
      icon: '🌳',
      color: '#27AE60',
      items: [
        { label: '공원 면적', value: stats.environment.parkArea + 'km²' },
        { label: '녹지율', value: stats.environment.greenRatio + '%' },
        { label: '대기질(PM2.5)', value: stats.environment.airQuality + 'μg' },
        { label: '', value: '' },
      ],
    },
  ];

  return (
    <Swiper
      modules={[Autoplay, FreeMode]}
      autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      freeMode={{ enabled: true, sticky: true }}
      loop
      spaceBetween={10}
      slidesPerView={1.8}
      breakpoints={{
        480: { slidesPerView: 1.5, spaceBetween: 16 },
        640: { slidesPerView: 2, spaceBetween: 16 },
        768: { slidesPerView: 2.5, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 20 },
        1280: { slidesPerView: 3.5, spaceBetween: 20 },
      }}
      className="!pb-2"
    >
      {cards.map((card) => (
        <SwiperSlide key={card.title} className="!h-auto">
          <DashCard
            title={card.title}
            icon={card.icon}
            color={card.color}
            items={card.items.filter((i) => i.label)}
            chartData={card.chartData}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
