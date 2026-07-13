import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://novaflowschool.com';

  const routes = [
    '',
    '/privacy',
    '/terms',
    '/contact-support',
    '/login',
    '/teacher',
    '/languages/en',
    '/languages/uk',
    '/languages/de',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
