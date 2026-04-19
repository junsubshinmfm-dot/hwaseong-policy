import type { CategoryKey, RegionKey } from '@/data/categories';

export interface Suggestion {
  id: string;
  title: string;
  content: string;
  reason: string;
  expectedEffect: string;
  nickname: string;
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
  region: RegionKey;
  category: CategoryKey;
  password: string;
}
