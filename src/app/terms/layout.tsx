import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Умови використання послуг | NovaFlow',
  description: 'Публічний договір та умови надання освітніх послуг онлайн-школи іноземних мов NovaFlow.',
  alternates: {
    canonical: 'https://novaflow-school.com/terms',
  },
  openGraph: {
    title: 'Умови використання послуг | NovaFlow',
    description: 'Публічний договір та умови надання освітніх послуг онлайн-школи іноземних мов NovaFlow.',
    url: 'https://novaflow-school.com/terms',
    siteName: 'NovaFlow Language School',
    locale: 'uk_UA',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
