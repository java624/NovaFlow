import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Правила повернення коштів | NovaFlow',
  description: 'Політика повернення коштів та скасування занять в інтерактивній онлайн-школі NovaFlow.',
  alternates: {
    canonical: 'https://novaflow-school.com/refund-policy',
  },
  openGraph: {
    title: 'Правила повернення коштів | NovaFlow',
    description: 'Політика повернення коштів та скасування занять в інтерактивній онлайн-школі NovaFlow.',
    url: 'https://novaflow-school.com/refund-policy',
    siteName: 'NovaFlow Language School',
    locale: 'uk_UA',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
