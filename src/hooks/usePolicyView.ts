'use client';

import { useEffect, useRef, useState } from 'react';
import { incrementPolicyView, subscribePolicyView } from '@/lib/analytics';

export function usePolicyView(policyId: number | string | null | undefined) {
  const [count, setCount] = useState(0);
  const incrementedRef = useRef<string | null>(null);

  useEffect(() => {
    if (policyId === null || policyId === undefined) return;
    const key = String(policyId);

    if (incrementedRef.current !== key) {
      incrementedRef.current = key;
      void incrementPolicyView(policyId);
    }

    const unsub = subscribePolicyView(policyId, setCount);
    return () => {
      unsub?.();
    };
  }, [policyId]);

  return count;
}

export function usePolicyViewCount(policyId: number | string | null | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (policyId === null || policyId === undefined) return;
    const unsub = subscribePolicyView(policyId, setCount);
    return () => {
      unsub?.();
    };
  }, [policyId]);

  return count;
}
