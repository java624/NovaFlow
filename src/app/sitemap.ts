import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://novaflow-school.com';

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/refund-policy', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/contact-support', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/languages/english', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/languages/german', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/languages/ukrainian', priority: 0.8, changeFrequency: 'weekly' as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}