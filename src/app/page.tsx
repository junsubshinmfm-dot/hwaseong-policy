'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const GlobeScene = dynamic(() => import('@/components/intro/GlobeScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#0D1F4D] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mb-6" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/30 text-sm tracking-wider"
      >
        화성특례시 100대 공약
      </motion.p>
    </div>
  ),
});

export default function IntroPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#0D1F4D]">
      <GlobeScene />
    </main>
  );
}
