import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/student/',
        '/teacher/',
        '/dashboard/',
        '/auth/',
        '/login/',
        '/payment/',
        '/telegram-app/',
        '/api/',
      ],
    },
    sitemap: 'https://novaflow-school.com/sitemap.xml',
  };
}
