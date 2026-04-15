'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 행성 텍스처 (무료 소스)
const TEX = {
  sun: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/600px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
  mercury: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/600px-Mercury_in_true_color.jpg',
  venus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Venus_from_Mariner_10.jpg/600px-Venus_from_Mariner_10.jpg',
  earth: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flipped.jpg/600px-Mars_-_August_30_2021_-_Flipped.jpg',
  jupiter: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/600px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
  saturn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/600px-Saturn_during_Equinox.jpg',
  stars: '//unpkg.com/three-globe/example/img/night-sky.png',
};

interface PlanetDef {
  name: string;
  label: string;
  texture: string;
  size: number;
  distance: number;
  speed: number;
  tilt: number;
  hasRing?: boolean;
  isEarth?: boolean;
}

const PLANETS: PlanetDef[] = [
  { name: 'mercury', label: '수성', texture: TEX.mercury, size: 0.3,  distance: 4,  speed: 4.0, tilt: 0.03 },
  { name: 'venus',   label: '금성', texture: TEX.venus,   size: 0.6,  distance: 6,  speed: 2.5, tilt: 0.05 },
  { name: 'earth',   label: '지구', texture: TEX.earth,   size: 0.65, distance: 9,  speed: 2.0, tilt: 0.41, isEarth: true },
  { name: 'mars',    label: '화성', texture: TEX.mars,     size: 0.45, distance: 12, speed: 1.5, tilt: 0.44 },
  { name: 'jupiter', label: '목성', texture: TEX.jupiter,  size: 1.8,  distance: 18, speed: 0.8, tilt: 0.05 },
  { name: 'saturn',  label: '토성', texture: TEX.saturn,   size: 1.5,  distance: 24, speed: 0.5, tilt: 0.47, hasRing: true },
];

export default function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    planets: Map<string, { mesh: THREE.Mesh; group: THREE.Group; def: PlanetDef }>;
    animId: number;
  } | null>(null);
  const router = useRouter();

  const [phase, setPhase] = useState<'explore' | 'zooming' | 'slogan' | 'fadeout'>('explore');
  const [hovered, setHovered] = useState<string | null>(null);

  // ── Three.js 초기화 ──
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();

    // 별 배경
    textureLoader.load(TEX.stars, (tex) => {
      scene.background = tex;
    });

    // Camera
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 25);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.enablePan = false;

    // ── 조명 ──
    const ambientLight = new THREE.AmbientLight(0x333340, 1);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff5e0, 2.5, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // ── 태양 ──
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    textureLoader.load(TEX.sun, (tex) => { sunMat.map = tex; sunMat.needsUpdate = true; });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // 태양 글로우
    const glowGeo = new THREE.SphereGeometry(2.6, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.15 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    const glow2Geo = new THREE.SphereGeometry(3.2, 32, 32);
    const glow2Mat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.06 });
    scene.add(new THREE.Mesh(glow2Geo, glow2Mat));

    // ── 행성 생성 ──
    const planetsMap = new Map<string, { mesh: THREE.Mesh; group: THREE.Group; def: PlanetDef }>();

    PLANETS.forEach((p) => {
      // 궤도 링
      const orbitGeo = new THREE.RingGeometry(p.distance - 0.02, p.distance + 0.02, 128);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.06, side: THREE.DoubleSide,
      });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = -Math.PI / 2;
      scene.add(orbitMesh);

      // 행성 그룹 (공전용)
      const group = new THREE.Group();
      scene.add(group);

      // 행성 메시
      const geo = new THREE.SphereGeometry(p.size, 32, 32);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.1 });
      textureLoader.load(p.texture, (tex) => { mat.map = tex; mat.needsUpdate = true; });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = p.distance;
      mesh.rotation.z = p.tilt;
      mesh.name = p.name;
      group.add(mesh);

      // 토성 고리
      if (p.hasRing) {
        const ringGeo = new THREE.RingGeometry(p.size * 1.3, p.size * 2.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xc4a86c, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2.5;
        ring.position.x = p.distance;
        group.add(ring);
      }

      // 지구에 달 추가
      if (p.isEarth) {
        const moonGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(p.distance + 1.2, 0.3, 0);
        group.add(moon);
      }

      planetsMap.set(p.name, { mesh, group, def: p });
    });

    // ── Raycaster (클릭/호버) ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(planetsMap.values()).map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const name = intersects[0].object.name;
        container.style.cursor = name === 'earth' ? 'pointer' : 'help';
        setHovered(name);
      } else {
        container.style.cursor = 'grab';
        setHovered(null);
      }
    };

    container.addEventListener('pointermove', onPointerMove);

    // ── 애니메이션 루프 ──
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 태양 회전
      sunMesh.rotation.y = elapsed * 0.1;
      glow.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.03);

      // 행성 공전 + 자전
      planetsMap.forEach(({ mesh, group, def }) => {
        group.rotation.y = elapsed * def.speed * 0.15;
        mesh.rotation.y = elapsed * 0.5;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = { scene, camera, renderer, controls, planets: planetsMap, animId };

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 지구 클릭 → 줌인 ──
  const handleContainerClick = useCallback(() => {
    if (phase !== 'explore' || hovered !== 'earth' || !sceneRef.current) return;
    setPhase('zooming');

    const { camera, controls, planets } = sceneRef.current;
    const earth = planets.get('earth');
    if (!earth) return;

    controls.enabled = false;

    // 지구 위치 계산
    const earthPos = new THREE.Vector3();
    earth.mesh.getWorldPosition(earthPos);

    // 카메라를 지구 앞으로 부드럽게 이동
    const targetPos = earthPos.clone().add(new THREE.Vector3(0, 0.5, 2.5));
    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 2000;

    const zoomAnimate = () => {
      const t = Math.min((Date.now() - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad

      camera.position.lerpVectors(startPos, targetPos, ease);
      camera.lookAt(earthPos);

      if (t < 1) {
        requestAnimationFrame(zoomAnimate);
      } else {
        setPhase('slogan');
      }
    };
    zoomAnimate();
  }, [phase, hovered]);

  const handleGoToMain = useCallback(() => {
    setPhase('fadeout');
    setTimeout(() => router.push('/main'), 800);
  }, [router]);

  const handleSkip = useCallback(() => {
    setPhase('fadeout');
    setTimeout(() => router.push('/main'), 500);
  }, [router]);

  // 행성 이름 맵
  const planetLabel = PLANETS.find((p) => p.name === hovered);

  return (
    <div className="relative w-full h-full bg-[#050510]">
      {/* Three.js 캔버스 */}
      <div
        ref={containerRef}
        className="w-full h-full"
        onClick={handleContainerClick}
      />

      {/* 행성 호버 라벨 */}
      <AnimatePresence>
        {hovered && planetLabel && phase === 'explore' && (
          <motion.div
            key="planet-label"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-10
                       px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10"
          >
            <span className="text-white font-bold text-lg">{planetLabel.label}</span>
            {planetLabel.isEarth && (
              <span className="ml-3 text-[#F58220] text-sm font-semibold">
                클릭하여 출발!
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 안내 텍스트 */}
      <AnimatePresence>
        {phase === 'explore' && (
          <motion.div
            key="guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10"
          >
            <p className="text-white/30 text-sm font-medium tracking-wider mb-1">
              마우스로 우주를 탐험하세요
            </p>
            <p className="text-[#F58220]/50 text-xs font-bold">
              지구를 클릭하면 화성특례시로 출발합니다
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 슬로건 + 입장 버튼 */}
      <AnimatePresence>
        {phase === 'slogan' && (
          <motion.div
            key="slogan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            {/* 어둡게 */}
            <div className="absolute inset-0 bg-black/50" />

            <div className="relative text-center px-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '5rem' }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="h-px bg-gradient-to-r from-transparent via-[#F58220] to-transparent mx-auto mb-5"
              />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[#F58220] text-sm tracking-[0.3em] uppercase mb-2 font-bold"
              >
                정명근
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white text-4xl md:text-6xl font-black mb-2"
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
              >
                100가지 약속
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-[#F58220] text-xl md:text-2xl font-bold mb-8"
              >
                화성의 미래
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '5rem' }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="h-px bg-gradient-to-r from-transparent via-[#F58220] to-transparent mx-auto mb-8"
              />
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={handleGoToMain}
                className="px-10 py-4 rounded-2xl font-bold text-lg
                           bg-gradient-to-r from-[#F58220] to-[#E88544] text-white
                           hover:shadow-[0_8px_40px_rgba(245,130,32,0.4)] hover:scale-105
                           transition-all duration-300"
              >
                화성특례시 입장
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 페이드아웃 */}
      <AnimatePresence>
        {phase === 'fadeout' && (
          <motion.div
            key="fadeout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-30"
            style={{ background: '#F4F5F9' }}
          />
        )}
      </AnimatePresence>

      {/* 건너뛰기 */}
      {phase === 'explore' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={handleSkip}
          className="absolute bottom-8 right-8 z-20
                     text-white/30 hover:text-white/80
                     text-sm border border-white/10 hover:border-white/30
                     px-5 py-2.5 rounded-xl
                     transition-all duration-300
                     bg-white/5 hover:bg-white/10"
        >
          건너뛰기
        </motion.button>
      )}
    </div>
  );
}
