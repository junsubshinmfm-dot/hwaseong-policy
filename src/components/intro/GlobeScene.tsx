'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import StaticFallback from './StaticFallback';

// 타이밍 (ms)
const ZOOM_PHASE1 = 3000;      // 지구 → 한반도 줌인
const SLOGAN_DELAY = 800;       // 줌인 시작 후 슬로건 등장
const SLOGAN_HOLD = 2500;       // 슬로건 유지 시간
const CLOUD_DELAY = SLOGAN_DELAY + SLOGAN_HOLD;  // 구름 진입
const CLOUD_DURATION = 1800;    // 구름 연출 시간
const NAVIGATE_DELAY = CLOUD_DELAY + CLOUD_DURATION + 400;

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export default function GlobeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const router = useRouter();

  const [phase, setPhase] = useState<
    'loading' | 'idle' | 'zooming' | 'slogan' | 'clouds' | 'fadeout' | 'fallback'
  >('loading');
  const [webglSupported, setWebglSupported] = useState(true);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // ── 줌인 시퀀스 ──
  const handleZoomIn = useCallback(() => {
    if (phase !== 'idle' || !globeRef.current) return;
    setPhase('zooming');

    const globe = globeRef.current;
    globe.controls().autoRotate = false;

    // 한반도(화성시 근처)로 줌인
    globe.pointOfView(
      { lat: 37.2, lng: 126.83, altitude: 0.15 },
      ZOOM_PHASE1,
    );

    // 슬로건 표시
    scheduleTimer(() => setPhase('slogan'), SLOGAN_DELAY);

    // 구름 진입 효과
    scheduleTimer(() => setPhase('clouds'), CLOUD_DELAY);

    // 페이지 전환
    scheduleTimer(() => {
      setPhase('fadeout');
      scheduleTimer(() => router.push('/main'), 600);
    }, NAVIGATE_DELAY);
  }, [phase, router, scheduleTimer]);

  // ── 건너뛰기 ──
  const handleSkip = useCallback(() => {
    setPhase('fadeout');
    scheduleTimer(() => router.push('/main'), 500);
  }, [router, scheduleTimer]);

  // ── Globe 초기화 ──
  useEffect(() => {
    if (!containerRef.current) return;

    if (!detectWebGL()) {
      setWebglSupported(false);
      setPhase('fallback');
      return;
    }

    let mounted = true;

    import('globe.gl').then((GlobeModule) => {
      if (!mounted || !containerRef.current) return;

      const Globe = GlobeModule.default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globe = (Globe as any)()(containerRef.current!)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .atmosphereColor('#2B55B2')
        .atmosphereAltitude(0.18)
        .width(containerRef.current!.clientWidth)
        .height(containerRef.current!.clientHeight);

      // 초기 시점 (아시아 쪽을 향하도록)
      globe.pointOfView({ lat: 25, lng: 100, altitude: 2.2 });

      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;

      globeRef.current = globe;
      setPhase('idle');
    });

    const handleResize = () => {
      if (globeRef.current && containerRef.current) {
        globeRef.current
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (globeRef.current) {
        globeRef.current._destructor?.();
        globeRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Globe 클릭 바인딩
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.onGlobeClick(() => handleZoomIn());
    }
  }, [handleZoomIn]);

  if (!webglSupported) {
    return <StaticFallback onSkip={handleSkip} />;
  }

  const isAnimating = phase === 'zooming' || phase === 'slogan' || phase === 'clouds' || phase === 'fadeout';
  const showSlogan = phase === 'slogan' || phase === 'clouds';
  const showClouds = phase === 'clouds';

  return (
    <div className="relative w-full h-full bg-[#0D1F4D]">
      {/* Globe 컨테이너 */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-pointer"
        onClick={handleZoomIn}
      />


      {/* 로딩 스피너 */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D1F4D] z-20"
          >
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-white/40 text-sm">지구를 불러오는 중...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 클릭 유도 안내 */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="mb-4"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </motion.div>
            <p className="text-white text-base md:text-lg font-semibold tracking-wide"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
              지구를 클릭하세요
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 줌인 시 어두운 오버레이 (배경 흐려짐 방지 + 가독성) ── */}
      <AnimatePresence>
        {isAnimating && phase !== 'fadeout' && (
          <motion.div
            key="dim-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-[#0D1F4D] pointer-events-none z-[6]"
          />
        )}
      </AnimatePresence>

      {/* ── 슬로건 ── */}
      <AnimatePresence>
        {showSlogan && (
          <motion.div
            key="slogan"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.4 } }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-[8]"
          >
            <div className="text-center px-6">
              {/* 배경 글로우 */}
              <div
                className="absolute inset-0 -m-20 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(11,20,51,0.7) 0%, transparent 70%)',
                }}
              />

              <div className="relative">
                {/* 상단 라인 */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '5rem' }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="h-px bg-gradient-to-r from-transparent via-[#F58220] to-transparent mx-auto mb-6"
                />

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-[#F58220] text-sm md:text-base tracking-[0.3em] uppercase mb-3 font-bold"
                  style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                >
                  정명근
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-3 leading-tight"
                  style={{ textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.6)' }}
                >
                  100가지 약속
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-[#F58220] text-xl md:text-2xl lg:text-3xl font-medium"
                  style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                >
                  화성의 미래
                </motion.p>

                {/* 하단 라인 */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '5rem' }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="h-px bg-gradient-to-r from-transparent via-[#F58220] to-transparent mx-auto mt-6"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 구름 효과 (지구→화성지도 전환) ── */}
      <AnimatePresence>
        {showClouds && (
          <>
            {/* 구름 레이어 1: 좌→우 */}
            <motion.div
              key="cloud-1"
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: '0%' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-0 pointer-events-none z-[12]"
              style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,255,255,0.9) 0%, transparent 70%),
                  radial-gradient(ellipse 60% 50% at 60% 30%, rgba(255,255,255,0.7) 0%, transparent 60%),
                  radial-gradient(ellipse 70% 40% at 40% 70%, rgba(255,255,255,0.6) 0%, transparent 65%)
                `,
              }}
            />
            {/* 구름 레이어 2: 우→좌 */}
            <motion.div
              key="cloud-2"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: '0%' }}
              transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.15 }}
              className="absolute inset-0 pointer-events-none z-[12]"
              style={{
                background: `
                  radial-gradient(ellipse 70% 50% at 70% 50%, rgba(255,255,255,0.85) 0%, transparent 65%),
                  radial-gradient(ellipse 50% 60% at 30% 60%, rgba(255,255,255,0.6) 0%, transparent 60%),
                  radial-gradient(ellipse 80% 40% at 50% 25%, rgba(255,255,255,0.5) 0%, transparent 70%)
                `,
              }}
            />
            {/* 구름 레이어 3: 전체 안개 */}
            <motion.div
              key="cloud-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeIn', delay: 0.4 }}
              className="absolute inset-0 pointer-events-none z-[13]"
              style={{
                background: 'linear-gradient(to bottom, rgba(240,242,248,0.3) 0%, rgba(240,242,248,0.95) 50%, rgba(240,242,248,1) 100%)',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── 최종 페이드 (구름 → 메인 페이지 배경색) ── */}
      <AnimatePresence>
        {phase === 'fadeout' && (
          <motion.div
            key="fadeout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            className="absolute inset-0 z-[30]"
            style={{ background: '#F0F2F8' }}
          />
        )}
      </AnimatePresence>

      {/* 건너뛰기 버튼 */}
      <AnimatePresence>
        {!isAnimating && phase !== 'loading' && (
          <motion.button
            key="skip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 z-20
                       text-white/40 hover:text-white/90
                       text-sm border border-white/15 hover:border-white/40
                       px-5 py-2.5 rounded-full
                       transition-all duration-300
                       backdrop-blur-sm bg-white/5 hover:bg-white/10"
          >
            건너뛰기
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 하단 비네팅 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D1F4D] to-transparent pointer-events-none z-[5]" />
    </div>
  );
}
