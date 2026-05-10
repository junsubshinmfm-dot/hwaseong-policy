'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { REGION_PATHS, SVG_VIEWBOX } from '@/data/region-paths';
import { REGIONS, type RegionKey } from '@/data/categories';
import regionsData from '@/data/regions.json';
import RegionTooltip from './RegionTooltip';

// REGION_PATHS는 지리적 4개 권역만 정의 — 'common'은 가상 분류라 지도 path가 없음.
type GeoRegionKey = Exclude<RegionKey, 'common'>;
const regionEntries = Object.entries(REGION_PATHS) as [
  GeoRegionKey,
  (typeof REGION_PATHS)[GeoRegionKey],
][];

export default function RegionMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<RegionKey | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const handleClick = useCallback(
    (id: RegionKey) => {
      router.push(`/region/${id}`);
    },
    [router],
  );

  return (
    <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
      <svg
        viewBox={SVG_VIEWBOX}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {regionEntries.map(([id]) => {
            const color = REGIONS[id].color;
            return (
              <linearGradient
                key={`grad-${id}`}
                id={`grad-${id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.65} />
                <stop offset="100%" stopColor={color} stopOpacity={0.35} />
              </linearGradient>
            );
          })}
          <filter id="region-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1A3B8F" floodOpacity="0.08" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {regionEntries.map(([id, region]) => {
          const isHovered = hovered === id;
          return (
            <g key={id}>
              {isHovered && (
                <path
                  d={region.path}
                  fill="none"
                  stroke={REGIONS[id].color}
                  strokeWidth={3}
                  filter="url(#glow)"
                  opacity={0.6}
                />
              )}
              <motion.path
                d={region.path}
                fill={`url(#grad-${id})`}
                stroke={isHovered ? '#1A3B8F' : 'rgba(26,59,143,0.12)'}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeLinejoin="round"
                filter={!isHovered ? 'url(#region-shadow)' : undefined}
                className="cursor-pointer transition-all duration-200"
                role="button"
                aria-label={`${region.label} ${regionsData.find((r) => r.id === id)?.policyCount || 0}개 공약`}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleClick(id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ originX: `${region.center.x}px`, originY: `${region.center.y}px` }}
              />
              <text
                x={region.center.x}
                y={region.center.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
                fill="#1A3B8F"
                fontSize={isHovered ? 24 : 20}
                fontWeight={isHovered ? 800 : 700}
                opacity={isHovered ? 1 : 0.9}
              >
                {region.label}
              </text>
              <text
                x={region.center.x}
                y={region.center.y + 26}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
                fill="#1A3B8F"
                fontSize={14}
                fontWeight={500}
                opacity={isHovered ? 0.8 : 0.5}
              >
                {regionsData.find((r) => r.id === id)?.policyCount || 0}개 공약
              </text>
            </g>
          );
        })}
      </svg>

      <RegionTooltip regionId={hovered} mouseX={mouse.x} mouseY={mouse.y} />
    </div>
  );
}
