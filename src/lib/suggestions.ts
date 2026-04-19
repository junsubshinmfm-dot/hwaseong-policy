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
    reason: data.reason || undefined,
    expectedEffect: data.expectedEffect || undefined,
    nickname: data.nickname,
    region: data.region,
    category: data.category,
    status,
    createdAt: Date.now(),
    likes: 0,
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
