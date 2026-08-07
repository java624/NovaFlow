import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакти та служба підтримки | NovaFlow',
  description: 'Зв\'яжіться з командою підтримки NovaFlow. Ми раді відповісти на ваші запитання про навчання та підбір викладача.',
  alternates: {
    canonical: 'https://novaflow-school.com/contact-support',
  },
  openGraph: {
    title: 'Контакти та служба підтримки | NovaFlow',
    description: 'Зв\'яжіться з командою підтримки NovaFlow. Ми раді відповісти на ваші запитання про навчання.',
    url: 'https://novaflow-school.com/contact-support',
    siteName: 'NovaFlow Language School',
    locale: 'uk_UA',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactSupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
