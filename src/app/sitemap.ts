import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  
  const baseUrl = 'https://novaflow-school.com';

  
  const routes = [
    '',
    '/privacy-policy',   
    '/terms',            
    '/contact-support',
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