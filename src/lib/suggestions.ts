import { ref, push, set, onValue, get } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import type { Suggestion, SuggestionFormData } from '@/types/suggestion';

const SUGGESTIONS_PATH = 'suggestions';

export async function submitSuggestion(
  data: SuggestionFormData,
  status: 'approved' | 'pending'
): Promise<string | null> {
  if (!isFirebaseConfigured || !db) return null;

  const suggestionsRef = ref(db, SUGGESTIONS_PATH);
  const newRef = push(suggestionsRef);

  const suggestion: Omit<Suggestion, 'id'> = {
    title: data.title,
    content: data.content,
    reason: data.reason || '',
    expectedEffect: data.expectedEffect || '',
    nickname: data.nickname,
    region: data.region,
    category: data.category,
    password: data.password || '',
    status,
    createdAt: Date.now(),
    likes: 0,
    reports: 0,
  };

  await set(newRef, suggestion);
  return newRef.key;
}

export function subscribeSuggestions(
  callback: (suggestions: Suggestion[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  const suggestionsRef = ref(db, SUGGESTIONS_PATH);
  const unsubscribe = onValue(suggestionsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const suggestions: Suggestion[] = Object.entries(data)
      .map(([id, value]) => ({
        ...(value as Omit<Suggestion, 'id'>),
        id,
      }))
      .filter((s) => s.status === 'approved')
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(suggestions);
  });

  return unsubscribe;
}

export function subscribeSuggestionsByRegion(
  regionId: string,
  callback: (suggestions: Suggestion[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  const suggestionsRef = ref(db, SUGGESTIONS_PATH);
  const unsubscribe = onValue(suggestionsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const suggestions: Suggestion[] = Object.entries(data)
      .map(([id, value]) => ({
        ...(value as Omit<Suggestion, 'id'>),
        id,
      }))
      .filter((s) => s.status === 'approved' && s.region === regionId)
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(suggestions);
  });

  return unsubscribe;
}

// 제안 좋아요 토글
export async function toggleSuggestionLike(
  suggestionId: string
): Promise<{ liked: boolean; count: number }> {
  if (!isFirebaseConfigured || !db) {
    // localStorage fallback
    const likedKey = 'suggestion_liked';
    const countsKey = 'suggestion_likeCounts';
    const likedIds: string[] = JSON.parse(localStorage.getItem(likedKey) || '[]');
    const counts: Record<string, number> = JSON.parse(localStorage.getItem(countsKey) || '{}');

    const isLiked = likedIds.includes(suggestionId);
    if (isLiked) {
      const newCount = Math.max(0, (counts[suggestionId] || 0) - 1);
      counts[suggestionId] = newCount;
      localStorage.setItem(countsKey, JSON.stringify(counts));
      localStorage.setItem(likedKey, JSON.stringify(likedIds.filter((id) => id !== suggestionId)));
      return { liked: false, count: newCount };
    } else {
      const newCount = (counts[suggestionId] || 0) + 1;
      counts[suggestionId] = newCount;
      localStorage.setItem(countsKey, JSON.stringify(counts));
      localStorage.setItem(likedKey, JSON.stringify([...likedIds, suggestionId]));
      return { liked: true, count: newCount };
    }
  }

  // Firebase mode
  const likedKey = 'suggestion_liked';
  const likedIds: string[] = JSON.parse(localStorage.getItem(likedKey) || '[]');
  const isLiked = likedIds.includes(suggestionId);

  const likesRef = ref(db, `${SUGGESTIONS_PATH}/${suggestionId}/likes`);
  const snapshot = await get(likesRef);
  const currentCount = snapshot.val() || 0;

  if (isLiked) {
    const newCount = Math.max(0, currentCount - 1);
    await set(likesRef, newCount);
    localStorage.setItem(likedKey, JSON.stringify(likedIds.filter((id) => id !== suggestionId)));
    return { liked: false, count: newCount };
  } else {
    const newCount = currentCount + 1;
    await set(likesRef, newCount);
    localStorage.setItem(likedKey, JSON.stringify([...likedIds, suggestionId]));
    return { liked: true, count: newCount };
  }
}

export function isSuggestionLiked(suggestionId: string): boolean {
  if (typeof window === 'undefined') return false;
  const likedIds: string[] = JSON.parse(localStorage.getItem('suggestion_liked') || '[]');
  return likedIds.includes(suggestionId);
}

// 관리자용: pending 제안 포함 전체 구독
export function subscribeAllSuggestions(
  callback: (suggestions: Suggestion[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  const suggestionsRef = ref(db, SUGGESTIONS_PATH);
  const unsubscribe = onValue(suggestionsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const suggestions: Suggestion[] = Object.entries(data)
      .map(([id, value]) => ({
        ...(value as Omit<Suggestion, 'id'>),
        id,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(suggestions);
  });

  return unsubscribe;
}

// 관리자용: 제안 상태 변경 (승인/거부)
export async function updateSuggestionStatus(
  suggestionId: string,
  status: 'approved' | 'rejected'
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const statusRef = ref(db, `${SUGGESTIONS_PATH}/${suggestionId}/status`);
  await set(statusRef, status);
}

// 관리자용: 제안 삭제
export async function deleteSuggestion(suggestionId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const suggestionRef = ref(db, `${SUGGESTIONS_PATH}/${suggestionId}`);
  await set(suggestionRef, null);
}

// 신고 기능
export async function reportSuggestion(suggestionId: string): Promise<number> {
  // 중복 신고 방지 (localStorage)
  const reportedKey = 'suggestion_reported';
  const reportedIds: string[] = JSON.parse(localStorage.getItem(reportedKey) || '[]');
  if (reportedIds.includes(suggestionId)) return -1; // 이미 신고함

  if (isFirebaseConfigured && db) {
    const reportsRef = ref(db, `${SUGGESTIONS_PATH}/${suggestionId}/reports`);
    const snapshot = await get(reportsRef);
    const current = snapshot.val() || 0;
    const newCount = current + 1;
    await set(reportsRef, newCount);

    // 신고 3회 이상 → 자동 pending 처리
    if (newCount >= 3) {
      const statusRef = ref(db, `${SUGGESTIONS_PATH}/${suggestionId}/status`);
      await set(statusRef, 'pending');
    }

    localStorage.setItem(reportedKey, JSON.stringify([...reportedIds, suggestionId]));
    return newCount;
  }

  return 0;
}

export function isReported(suggestionId: string): boolean {
  if (typeof window === 'undefined') return false;
  const reportedIds: string[] = JSON.parse(localStorage.getItem('suggestion_reported') || '[]');
  return reportedIds.includes(suggestionId);
}

// 비밀번호 검증 후 수정
export async function verifySuggestionPassword(
  suggestionId: string,
  password: string
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  const pwRef = ref(db, `${SUGGESTIONS_PATH}/${suggestionId}/password`);
  const snapshot = await get(pwRef);
  return snapshot.val() === password;
}

// 관리자용: 제안 수정
export async function updateSuggestion(
  suggestionId: string,
  data: Partial<Omit<Suggestion, 'id'>>
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;

  const suggestionRef = ref(db, `${SUGGESTIONS_PATH}/${suggestionId}`);
  const snapshot = await get(suggestionRef);
  const current = snapshot.val();
  if (!current) return;

  await set(suggestionRef, { ...current, ...data });
}
