import { ref, push, set, onValue, remove } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import type { Comment } from '@/types/suggestion';

const COMMENTS_PATH = 'comments';

export async function submitComment(
  suggestionId: string,
  data: { nickname: string; content: string; password: string }
): Promise<string | null> {
  if (!isFirebaseConfigured || !db) return null;

  const commentsRef = ref(db, `${COMMENTS_PATH}/${suggestionId}`);
  const newRef = push(commentsRef);

  const comment: Omit<Comment, 'id'> = {
    suggestionId,
    nickname: data.nickname,
    content: data.content,
    password: data.password,
    createdAt: Date.now(),
  };

  await set(newRef, comment);
  return newRef.key;
}

export function subscribeComments(
  suggestionId: string,
  callback: (comments: Comment[]) => void
): (() => void) | null {
  if (!isFirebaseConfigured || !db) return null;

  const commentsRef = ref(db, `${COMMENTS_PATH}/${suggestionId}`);
  const unsubscribe = onValue(commentsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const comments: Comment[] = Object.entries(data)
      .map(([id, value]) => ({
        ...(value as Omit<Comment, 'id'>),
        id,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);

    callback(comments);
  });

  return unsubscribe;
}

export async function deleteComment(
  suggestionId: string,
  commentId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const commentRef = ref(db, `${COMMENTS_PATH}/${suggestionId}/${commentId}`);
  await remove(commentRef);
}
