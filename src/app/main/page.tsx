'use client';

import { motion } from 'framer-motion';
import MiniatureMap from '@/components/main/MiniatureMap';
import SidePanel from '@/components/main/SidePanel';
import Navbar from '@/components/shared/Navbar';
import GeoPattern from '@/components/shared/GeoPattern';
import ProfileBanner from '@/components/main/ProfileBanner';
import CategoryChart from '@/components/main/CategoryChart';
import PolicyRanking from '@/components/main/PolicyRanking';
import MyAreaPolicies from '@/components/main/MyAreaPolicies';
import WelcomePopup from '@/components/shared/WelcomePopup';
import TimelineSlider from '@/components/timeline/TimelineSlider';
import TimelineCrossfade from '@/components/timeline/TimelineCrossfade';
import { useTimeline } from '@/hooks/useTimeline';
import { backgroundForSlider } from '@/lib/timeline';

export default function MainPage() {
  const { sliderValue } = useTimeline();
  const pageBg = backgroundForSlider(sliderValue);
  return (
    <main
      className="min-h-screen relative overflow-hidden transition-colors"
      style={{ background: pageBg, transitionDuration: '120ms' }}
    >
      <WelcomePopup />
      <Navbar />
      <TimelineSlider />

      <div className="absolute top-16 left-0 right-0 h-[180px] z-0 hidden md:block">
        <GeoPattern variant="header" className="w-full h-full" />
      </div>
      <GeoPattern variant="corner-tl" className="w-[250px] h-[250px] z-0 opacity-80 hidden lg:block" />
      <GeoPattern variant="corner-br" className="w-[300px] h-[300px] z-0 opacity-80 hidden lg:block" />

      <div className="relative z-10 pt-[190px] md:pt-[230px]">

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

            {/* 모바일: 지도 바로 아래 */}
            <div className="lg:hidden mt-3 space-y-3">
              <MyAreaPolicies />
              <PolicyRanking />
              <CategoryChart />
            </div>
          </motion.div>

          {/* 데스크톱: 사이드 패널 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:block w-[340px] xl:w-[380px] shrink-0 p-6 pt-6 pr-8"
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
        <TimelineCrossfade
          past={<span>미니어처를 클릭하면 해당 권역의 시민제안을 볼 수 있습니다</span>}
          future={<span>미니어처를 클릭하면 해당 권역의 공약을 볼 수 있습니다</span>}
        />
      </motion.p>

      <div className="relative z-10">
        <GeoPattern variant="strip" className="w-full h-12" />
      </div>
    </main>
  );
}
