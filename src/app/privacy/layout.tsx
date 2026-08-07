import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Політика конфіденційності | NovaFlow',
  description: 'Політика конфіденційності онлайн-школи іноземних мов NovaFlow. Дізнайтеся, як ми захищаємо та обробляємо ваші персональні дані.',
  alternates: {
    canonical: 'https://novaflow-school.com/privacy',
  },
  openGraph: {
    title: 'Політика конфіденційності | NovaFlow',
    description: 'Політика конфіденційності онлайн-школи іноземних мов NovaFlow.',
    url: 'https://novaflow-school.com/privacy',
    siteName: 'NovaFlow Language School',
    locale: 'uk_UA',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
