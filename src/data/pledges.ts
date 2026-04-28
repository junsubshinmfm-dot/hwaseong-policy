import type { Suggestion } from '@/types/suggestion';
import type { CategoryKey, RegionKey } from './categories';

/**
 * 정명근 공약 더미 데이터 (placeholder).
 * 실제 50개 공약 데이터 도착 시 이 파일을 교체.
 *
 * 분배:
 *  - 권역: 만세 11 / 효행 10 / 병점 12 / 동탄 17 (합 50)
 *  - 카테고리: 9개 카테고리에 round-robin 분배
 */

const REGION_DISTRIBUTION: Array<[RegionKey, number]> = [
  ['manse', 11],
  ['hyohaeng', 10],
  ['byeongjeom', 12],
  ['dongtan', 17],
];

const CATEGORY_KEYS: CategoryKey[] = [
  'housing',
  'traffic',
  'welfare',
  'education',
  'economy',
  'environment',
  'safety',
  'culture',
  'admin',
];

const PLACEHOLDER_CONTENT = '5월 21일 정식 공개됩니다.';
const PLACEHOLDER_REASON = '정명근의 공약은 5월 21일 화성특례시 시민 여러분께 정식 공개됩니다.';
const PLACEHOLDER_EFFECT = '50대 공약 전체가 한꺼번에 공개됩니다.';

export const PLEDGES_FALLBACK: Suggestion[] = (() => {
  const list: Suggestion[] = [];
  let categoryIdx = 0;
  let id = 1;
  const baseTimestamp = new Date('2026-05-21T00:00:00+09:00').getTime();

  for (const [region, count] of REGION_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      const category = CATEGORY_KEYS[categoryIdx % CATEGORY_KEYS.length];
      categoryIdx++;
      list.push({
        id: `pledge-${String(id).padStart(2, '0')}`,
        title: `정명근 공약 #${String(id).padStart(2, '0')}`,
        content: PLACEHOLDER_CONTENT,
        reason: PLACEHOLDER_REASON,
        expectedEffect: PLACEHOLDER_EFFECT,
        nickname: '정명근',
        realName: '',
        phone: '',
        region,
        category,
        status: 'approved',
        createdAt: baseTimestamp,
        likes: 0,
        password: '',
        reports: 0,
      });
      id++;
    }
  }

  return list;
})();

export function pledgesByRegion(region: RegionKey): Suggestion[] {
  return PLEDGES_FALLBACK.filter((p) => p.region === region);
}

/**
 * 권역별 공약 갯수 — PLEDGES_FALLBACK에서 자동 계산.
 * 실제 50개 공약 데이터 도착 시 PLEDGES_FALLBACK만 교체하면 이 카운트도 자동 갱신.
 */
export const PLEDGE_COUNT_BY_REGION: Record<RegionKey, number> = (() => {
  const counts = { manse: 0, hyohaeng: 0, byeongjeom: 0, dongtan: 0 } as Record<RegionKey, number>;
  PLEDGES_FALLBACK.forEach((p) => {
    counts[p.region] = (counts[p.region] || 0) + 1;
  });
  return counts;
})();
