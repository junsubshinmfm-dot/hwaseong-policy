import { useMemo } from 'react';
import regionsData from '@/data/regions.json';
import type { RegionKey } from '@/data/categories';

export function useRegionData(regionId: RegionKey) {
  const region = useMemo(
    () => regionsData.find((r) => r.id === regionId),
    [regionId]
  );

  return { region };
}
