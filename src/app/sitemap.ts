import type { MetadataRoute } from 'next';
import { REGIONS } from '@/data/categories';
import policiesData from '@/data/policies.json';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://policy.jmg2026.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/main`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // 4개 권역 페이지
  const regionRoutes: MetadataRoute.Sitemap = Object.keys(REGIONS).map((id) => ({
    url: `${BASE_URL}/region/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 공약별 딥링크 (모달 URL)
  const policyRoutes: MetadataRoute.Sitemap = policiesData.map((p) => ({
    url: `${BASE_URL}/region/${p.region}?policy=${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...regionRoutes, ...policyRoutes];
}
