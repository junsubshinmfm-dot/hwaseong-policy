export const CATEGORIES = {
  traffic:     { label: '교통',     color: '#2B6FD4', icon: '🚇' },
  welfare:     { label: '복지',     color: '#E88544', icon: '🏥' },
  education:   { label: '교육',     color: '#38A169', icon: '📚' },
  economy:     { label: '경제/산업', color: '#8B5FBF', icon: '💰' },
  environment: { label: '환경',     color: '#2F9E60', icon: '🌳' },
  safety:      { label: '안전',     color: '#2B55B2', icon: '🛡️' },
  culture:     { label: '문화',     color: '#F58220', icon: '🎭' },
  housing:     { label: '주거',     color: '#D94B7B', icon: '🏠' },
  admin:       { label: '행정',     color: '#7B8BA2', icon: '🏛️' },
  ai:          { label: 'AI',       color: '#06B6D4', icon: '🤖' },
  basic:       { label: '기본사회', color: '#BE185D', icon: '🤝' },
  sports:      { label: '체육',     color: '#16A34A', icon: '⚽' },
} as const;

export const REGIONS = {
  common:      { label: '전체',   color: '#0D1F4D' },
  dongtan:     { label: '동탄구', color: '#2B6FD4' },
  byeongjeom:  { label: '병점구', color: '#E88544' },
  manse:       { label: '만세구', color: '#38A169' },
  hyohaeng:    { label: '효행구', color: '#7B5FBF' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
export type RegionKey = keyof typeof REGIONS;
