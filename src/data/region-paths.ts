// SVG path data for 화성시 4개 구 행정경계
// v1: 대략적 경계 (추후 실제 GeoJSON 데이터로 교체)
// viewBox: 0 0 800 600

export const REGION_PATHS = {
  dongtan: {
    id: 'dongtan',
    path: 'M 450 50 L 550 80 L 620 150 L 650 250 L 600 350 L 520 380 L 450 350 L 420 250 L 430 150 Z',
    center: { x: 530, y: 210 },
    label: '동탄구',
  },
  byeongjeom: {
    id: 'byeongjeom',
    path: 'M 200 50 L 350 60 L 420 100 L 450 50 L 430 150 L 420 250 L 450 350 L 380 400 L 300 380 L 230 300 L 200 200 Z',
    center: { x: 330, y: 220 },
    label: '병점구',
  },
  manse: {
    id: 'manse',
    path: 'M 100 200 L 200 200 L 230 300 L 300 380 L 380 400 L 350 480 L 250 530 L 150 500 L 80 400 L 70 300 Z',
    center: { x: 220, y: 400 },
    label: '만세구',
  },
  hyohaeng: {
    id: 'hyohaeng',
    path: 'M 380 400 L 450 350 L 520 380 L 600 350 L 650 420 L 630 500 L 550 550 L 450 560 L 350 530 L 350 480 Z',
    center: { x: 500, y: 460 },
    label: '효행구',
  },
} as const;

export const SVG_VIEWBOX = '0 0 800 600';
