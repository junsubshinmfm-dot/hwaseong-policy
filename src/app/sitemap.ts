import type { MetadataRoute } from 'next';
import { REGIONS } from '@/data/categories';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://policy.jmg2026.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/main`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/suggestions`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/suggestions/new`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  const regionRoutes: MetadataRoute.Sitemap = Object.keys(REGIONS).map((id) => ({
    url: `${BASE_URL}/region/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...regionRoutes];
}
