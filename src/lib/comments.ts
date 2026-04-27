import { ref, push, set, onValue, remove } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import type { Comment } from '@/types/suggestion';

const COMMENTS_PATH = 'comments';

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bytesToHex(arr);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(buffer));
}

export async function verifyCommentPassword(
  comment: Comment,
  plaintext: string,
): Promise<boolean> {
  if (!comment.passwordHash || !comment.passwordSalt) return false;
  const candidate = await hashPassword(plaintext, comment.passwordSalt);
  return candidate === comment.passwordHash;
}

export async function submitComment(
  suggestionId: string,
  data: { nickname: string; content: string; password: string }
): Promise<string | null> {
  if (!isFirebaseConfigured || !db) return null;

  const commentsRef = ref(db, `${COMMENTS_PATH}/${suggestionId}`);
  const newRef = push(commentsRef);

  const passwordSalt = generateSalt();
  const passwordHash = await hashPassword(data.password, passwordSalt);

  const comment: Omit<Comment, 'id'> = {
    suggestionId,
    nickname: data.nickname,
    content: data.content,
    passwordHash,
    passwordSalt,
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
