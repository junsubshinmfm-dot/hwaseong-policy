import { ref, push, set, onValue, get } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import type { Feedback, FeedbackFormData } from '@/types/feedback';

const FEEDBACKS_PATH = 'feedbacks';

export async function submitFeedback(data: FeedbackFormData): Promise<string | null> {
  if (!isFirebaseConfigured || !db) return null;

  const feedbacksRef = ref(db, FEEDBACKS_PATH);
  const newRef = push(feedbacksRef);

  const feedback: Omit<Feedback, 'id'> = {
    title: data.title,
    content: data.content,
    realName: data.realName,
    phone: data.phone,
    createdAt: Date.now(),
    viewed: false,
  };

  await set(newRef, feedback);
  return newRef.key;
}

// 관리자용: 전체 건의 구독
export function subscribeAllFeedbacks(
  callback: (feedbacks: Feedback[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  const feedbacksRef = ref(db, FEEDBACKS_PATH);
  const unsubscribe = onValue(feedbacksRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const feedbacks: Feedback[] = Object.entries(data)
      .map(([id, value]) => ({
        ...(value as Omit<Feedback, 'id'>),
        id,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(feedbacks);
  });

  return unsubscribe;
}

// 관리자용: 확인 처리
export async function markFeedbackViewed(feedbackId: string, viewed: boolean): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const viewedRef = ref(db, `${FEEDBACKS_PATH}/${feedbackId}/viewed`);
  await set(viewedRef, viewed);
}

// 관리자용: 건의 삭제
export async function deleteFeedback(feedbackId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const feedbackRef = ref(db, `${FEEDBACKS_PATH}/${feedbackId}`);
  await set(feedbackRef, null);
}

export async function getFeedbackCount(): Promise<number> {
  if (!isFirebaseConfigured || !db) return 0;
  const feedbacksRef = ref(db, FEEDBACKS_PATH);
  const snapshot = await get(feedbacksRef);
  const data = snapshot.val();
  return data ? Object.keys(data).length : 0;
}
