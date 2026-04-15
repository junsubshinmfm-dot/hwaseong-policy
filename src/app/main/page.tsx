'use client';

import { motion } from 'framer-motion';
import MiniatureMap from '@/components/main/MiniatureMap';
import SidePanel from '@/components/main/SidePanel';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';
import ProfileBanner from '@/components/main/ProfileBanner';
import CategoryChart from '@/components/main/CategoryChart';

export default function MainPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      <Navbar />

      <div className="absolute top-16 left-0 right-0 h-[180px] z-0 hidden md:block">
        <GeoPattern variant="header" className="w-full h-full" />
      </div>
      <GeoPattern variant="corner-tl" className="w-[250px] h-[250px] z-0 opacity-80 hidden lg:block" />
      <GeoPattern variant="corner-br" className="w-[300px] h-[300px] z-0 opacity-80 hidden lg:block" />

      <div className="relative z-10 pt-16 md:pt-20">

        {/* PC 전용: 브랜드 배너 */}
        <div className="hidden lg:block mx-8 xl:mx-12 mb-6 relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #1A3B8F 0%, #152F73 50%, #0D1F4D 100%)' }}>
          {/* 기하학 장식 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-[4px] border-white/[0.06]" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full border-[4px] border-orange/10" />
          <div className="absolute top-4 right-20 w-10 h-10 rounded-xl bg-orange/10" />
          <div className="absolute bottom-3 right-40 w-6 h-6 rounded-full bg-white/[0.04]" />
          {/* 동심원호 */}
          <svg className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.08]" viewBox="0 0 100 100" fill="none">
            <path d="M50 10 A40 40 0 0 1 90 50" stroke="#F58220" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 20 A30 30 0 0 1 80 50" stroke="#F58220" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 30 A20 20 0 0 1 70 50" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="relative flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15">
                <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                  <path d="M10 38 A20 20 0 0 1 30 18" stroke="#F58220" strokeWidth="4" strokeLinecap="round" />
                  <path d="M10 38 A12 12 0 0 1 22 26" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                  <rect x="30" y="10" width="10" height="10" rx="2.5" fill="#F58220" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-black text-xl">정명근</h2>
                <p className="text-orange-light font-bold text-sm">&ldquo;100가지 약속, 화성의 미래&rdquo;</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-orange text-4xl font-black">{20}</span>
                <span className="text-white/50 text-sm ml-1">개 공약</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-white/40 text-xs leading-relaxed">
                <p>화성특례시장 후보</p>
                <p className="text-orange/60 font-bold">HWASEONG SPECIAL CITY</p>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 전용: 프로필 배너 */}
        <div className="lg:hidden">
          <ProfileBanner />
        </div>

        <div className="flex flex-col lg:flex-row lg:min-h-screen">
          {/* 지도 + 모바일 분야별 공약 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex-1 p-2 sm:p-4 lg:p-8 lg:pl-12"
          >
            <MiniatureMap />

            {/* 모바일: 지도 바로 아래 분야별 공약 */}
            <div className="lg:hidden mt-3">
              <CategoryChart />
            </div>
          </motion.div>

          {/* 데스크톱: 사이드 패널 */}
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
        className="relative z-10 text-center text-navy/30 text-sm font-medium py-4"
      >
        미니어처를 클릭하면 해당 권역의 공약을 볼 수 있습니다
      </motion.p>

      <div className="relative z-10">
        <GeoPattern variant="strip" className="w-full h-12" />
      </div>
    </main>
  );
}
