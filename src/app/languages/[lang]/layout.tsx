import type { Metadata } from 'next';
import { validLangs } from '@/lib/language-data';

type Props = {
  params: Promise<{ lang: string }> | { lang: string };
  children: React.ReactNode;
};

const langTitles: Record<string, { title: string; desc: string }> = {
  english: {
    title: 'Курси англійської мови онлайн | NovaFlow',
    desc: 'Індивідуальні онлайн-уроки англійської мови з викладачем. Розмовна практика, сучасна методика та гнучкий графік.',
  },
  german: {
    title: 'Курси німецької мови онлайн | NovaFlow',
    desc: 'Ефективні онлайн-заняття з німецької мови від початкового до просунутого рівня. Підготовка до іспитів та розмовні навички.',
  },
  ukrainian: {
    title: 'Курси української мови онлайн | NovaFlow',
    desc: 'Вивчайте українську мову онлайн з найкращими репетиторами. Розмовні клуби, граматика та бізнес-українська.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const langKey = validLangs.includes(resolvedParams?.lang) ? resolvedParams.lang : 'english';
  const info = langTitles[langKey] || langTitles.english;
  const canonicalUrl = `https://novaflow-school.com/languages/${langKey}`;

  return {
    title: info.title,
    description: info.desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: info.title,
      description: info.desc,
      url: canonicalUrl,
      siteName: 'NovaFlow Language School',
      locale: 'uk_UA',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function LanguageLayout({ children }: Props) {
  return <>{children}</>;
}
