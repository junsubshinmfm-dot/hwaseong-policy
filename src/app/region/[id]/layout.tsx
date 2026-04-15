import type { Metadata } from 'next';
import { REGIONS, type RegionKey } from '@/data/categories';

// 4개 권역 SSG 생성
export function generateStaticParams() {
  return Object.keys(REGIONS).map((id) => ({ id }));
}

// 권역별 OG 메타태그
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const regionId = params.id as RegionKey;
  const region = REGIONS[regionId];

  if (!region) {
    return { title: '화성특례시 100대 공약' };
  }

  return {
    title: `${region.label} | 정명근 화성특례시 100대 공약`,
    description: `${region.label}의 공약을 확인하세요`,
    openGraph: {
      title: `${region.label} | 정명근 화성특례시 100대 공약`,
      description: `${region.label}의 공약을 확인하세요`,
      images: ['/images/og-default.jpg'],
    },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
