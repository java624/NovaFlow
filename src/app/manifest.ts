import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NovaFlow — Онлайн-школа мов',
    short_name: 'NovaFlow',
    description: 'Інтерактивна онлайн-школа іноземних мов NovaFlow. Заняття, словники та навчальні матеріали.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5e077e',
    icons: [
      {
        src: '/img/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
