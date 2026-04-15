import { useMemo } from 'react';
import regionsData from '@/data/regions.json';
import policiesData from '@/data/policies.json';
import type { RegionKey } from '@/data/categories';

export function useRegionData(regionId: RegionKey) {
  const region = useMemo(
    () => regionsData.find((r) => r.id === regionId),
    [regionId]
  );

  const policies = useMemo(
    () => policiesData.filter((p) => p.region === regionId).sort((a, b) => a.priority - b.priority),
    [regionId]
  );

  return { region, policies };
}
