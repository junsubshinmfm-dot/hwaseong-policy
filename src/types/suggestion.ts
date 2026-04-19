import type { CategoryKey, RegionKey } from '@/data/categories';

export interface Suggestion {
  id: string;
  title: string;
  content: string;
  reason: string;
  expectedEffect: string;
  nickname: string;
  realName: string;     // 실명 (admin만 조회)
  phone: string;        // 전화번호 (admin만 조회)
  region: RegionKey;
  category: CategoryKey;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: number;
  likes: number;
  password: string;
  reports: number;
}

export interface SuggestionFormData {
  title: string;
  content: string;
  reason: string;
  expectedEffect: string;
  nickname: string;
  realName: string;
  phone: string;
  region: RegionKey;
  category: CategoryKey;
  password: string;
}

export interface Comment {
  id: string;
  suggestionId: string;
  nickname: string;
  content: string;
  createdAt: number;
  password: string;     // 본인만 삭제 가능
}
