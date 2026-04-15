'use client';

import { motion } from 'framer-motion';
import MiniatureMap from '@/components/main/MiniatureMap';
import SidePanel from '@/components/main/SidePanel';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';
import ProfileBanner from '@/components/main/ProfileBanner';

export default function MainPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      <Navbar />

      <div className="absolute top-16 left-0 right-0 h-[180px] z-0 hidden md:block">
        <GeoPattern variant="header" className="w-full h-full" />
      </div>
      <GeoPattern variant="corner-tl" className="w-[250px] h-[250px] z-0 opacity-80 hidden lg:block" />
      <GeoPattern variant="corner-br" className="w-[300px] h-[300px] z-0 opacity-80 hidden lg:block" />

      {/* 모바일: 프로필 배너 → 지도 → 분야별 공약 세로 배치 */}
      {/* 데스크톱: 지도 + 사이드 패널 가로 배치 */}
      <div className="relative z-10 pt-16 md:pt-20">

        {/* 모바일 전용: 프로필 가로 배너 */}
        <div className="lg:hidden">
          <ProfileBanner />
        </div>

        <div className="min-h-screen flex flex-col lg:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex-1 p-2 sm:p-4 lg:p-8 lg:pl-12"
          >
            <MiniatureMap />
          </motion.div>

          {/* 데스크톱 전용: 사이드 패널 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:block w-[340px] xl:w-[380px] shrink-0 p-6 pt-0 pr-8"
          >
            <SidePanel />
          </motion.div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 text-center text-navy/30 text-sm font-medium pb-6 -mt-4"
      >
        미니어처를 클릭하면 해당 권역의 공약을 볼 수 있습니다
      </motion.p>

      <div className="relative z-10">
        <GeoPattern variant="strip" className="w-full h-12" />
      </div>
    </main>
  );
}
