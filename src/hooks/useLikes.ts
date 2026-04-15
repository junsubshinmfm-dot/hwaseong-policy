'use client';

import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db, isFirebaseConfigured } from '@/lib/firebase';

const LIKED_KEY = 'liked';

function getLikedIds(): number[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]');
}

function setLikedIds(ids: number[]) {
  localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
}

export function useLikes(policyId: number) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // 로컬스토리지에서 좋아요 여부 복원
  useEffect(() => {
    setLiked(getLikedIds().includes(policyId));
  }, [policyId]);

  // Firebase 실시간 구독 (설정 시) 또는 로컬 폴백
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const likesRef = ref(db, `likes/${policyId}`);
      const unsubscribe = onValue(likesRef, (snapshot) => {
        setCount(snapshot.val() || 0);
      });
      return () => unsubscribe();
    } else {
      // Firebase 미설정 → 로컬스토리지 폴백
      const counts: Record<string, number> = JSON.parse(
        localStorage.getItem('likeCounts') || '{}'
      );
      setCount(counts[policyId] || 0);
    }
  }, [policyId]);

  const toggleLike = useCallback(async () => {
    const ids = getLikedIds();
    const isCurrentlyLiked = ids.includes(policyId);

    if (isFirebaseConfigured && db) {
      // Firebase 모드
      const likesRef = ref(db, `likes/${policyId}`);
      if (isCurrentlyLiked) {
        const newCount = Math.max(0, count - 1);
        await set(likesRef, newCount);
        setLikedIds(ids.filter((id) => id !== policyId));
      } else {
        await set(likesRef, count + 1);
        setLikedIds([...ids, policyId]);
      }
    } else {
      // 로컬 폴백 모드
      const counts: Record<string, number> = JSON.parse(
        localStorage.getItem('likeCounts') || '{}'
      );
      if (isCurrentlyLiked) {
        const newCount = Math.max(0, (counts[policyId] || 0) - 1);
        counts[policyId] = newCount;
        setCount(newCount);
        setLikedIds(ids.filter((id) => id !== policyId));
      } else {
        const newCount = (counts[policyId] || 0) + 1;
        counts[policyId] = newCount;
        setCount(newCount);
        setLikedIds([...ids, policyId]);
      }
      localStorage.setItem('likeCounts', JSON.stringify(counts));
    }

    setLiked(!isCurrentlyLiked);
  }, [policyId, count]);

  return { count, liked, toggleLike };
}
