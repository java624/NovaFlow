'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  en: {
    badge: 'Legal',
    title: 'Privacy Policy',
    updated: 'Last updated: July 13, 2026',
    intro: 'At NovaFlow Language School, we are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have.',
    sections: [
      {
        title: '1. Information We Collect',
        body: 'We collect information you provide directly to us when you register, book a lesson, fill out a contact form, or communicate with us. This includes: full name, email address, phone number, language learning preferences, and payment details processed securely through WayForPay.',
      },
      {
        title: '2. How We Use Your Information',
        body: 'We use collected information to: schedule and manage your lessons, send confirmation and reminder emails, process payments, improve our platform and services, and communicate updates or special offers (only with your consent).',
      },
      {
        title: '3. Data Storage & Security',
        body: 'Your data is stored securely on Supabase infrastructure with industry-standard encryption. We never sell, rent, or share your personal information with third parties except as required to provide our services (e.g., EmailJS for notifications, WayForPay for payment processing).',
      },
      {
        title: '4. Cookies',
        body: 'We use essential cookies to maintain your session and remember language preferences. No tracking or advertising cookies are used without your consent. You can disable cookies in your browser settings, though some features may not function correctly.',
      },
      {
        title: '5. Your Rights',
        body: 'You have the right to: access your personal data, correct inaccurate information, request deletion of your account and data, withdraw consent for marketing communications at any time. To exercise these rights, contact us at novaflowschool@gmail.com.',
      },
      {
        title: '6. Contact',
        body: 'For any privacy-related questions, please contact us at: novaflowschool@gmail.com or +380759648499. We will respond within 5 business days.',
      },
    ],
  },
  uk: {
    badge: 'Юридична інформація',
    title: 'Політика конфіденційності',
    updated: 'Оновлено: 13 липня 2026 р.',
    intro: 'Мовна школа NovaFlow зобов\'язується захищати ваші персональні дані та поважати вашу конфіденційність. Ця Політика пояснює, яку інформацію ми збираємо, як її використовуємо та які у вас є права.',
    sections: [
      {
        title: '1. Яку інформацію ми збираємо',
        body: 'Ми збираємо інформацію, яку ви надаєте нам при реєстрації, бронюванні уроку, заповненні контактної форми або спілкуванні з нами. Це включає: повне ім\'я, електронна адреса, номер телефону, вподобання у навчанні та платіжні дані, які обробляються безпечно через WayForPay.',
      },
      {
        title: '2. Як ми використовуємо вашу інформацію',
        body: 'Ми використовуємо зібрану інформацію для: планування та управління вашими уроками, надсилання підтверджень та нагадувань, обробки платежів, вдосконалення нашої платформи та послуг, а також для повідомлень про оновлення або спеціальні пропозиції (лише за вашою згодою).',
      },
      {
        title: '3. Зберігання та безпека даних',
        body: 'Ваші дані зберігаються в безпеці на інфраструктурі Supabase з шифруванням за галузевим стандартом. Ми ніколи не продаємо, не здаємо в оренду та не передаємо вашу особисту інформацію третім особам, крім випадків, необхідних для надання наших послуг (EmailJS для сповіщень, WayForPay для обробки платежів).',
      },
      {
        title: '4. Файли cookie',
        body: 'Ми використовуємо обов\'язкові файли cookie для підтримки сесії та запам\'ятовування мовних налаштувань. Відстежуючі або рекламні cookie не використовуються без вашої згоди. Ви можете вимкнути файли cookie в налаштуваннях браузера, але деякі функції можуть не працювати належним чином.',
      },
      {
        title: '5. Ваші права',
        body: 'Ви маєте право: отримати доступ до своїх персональних даних, виправити неточну інформацію, запросити видалення вашого облікового запису та даних, у будь-який час відкликати згоду на маркетингові розсилки. Для реалізації цих прав зв\'яжіться з нами за адресою novaflowschool@gmail.com.',
      },
      {
        title: '6. Контакти',
        body: 'З будь-яких питань щодо конфіденційності, будь ласка, зв\'яжіться з нами: novaflowschool@gmail.com або +380759648499. Ми відповімо протягом 5 робочих днів.',
      },
    ],
  },
  de: {
    badge: 'Rechtliches',
    title: 'Datenschutzerklärung',
    updated: 'Zuletzt aktualisiert: 13. Juli 2026',
    intro: 'Die NovaFlow Sprachschule verpflichtet sich, Ihre personenbezogenen Daten zu schützen und Ihre Privatsphäre zu respektieren. Diese Datenschutzerklärung erläutert, welche Informationen wir erheben, wie wir sie verwenden und welche Rechte Sie haben.',
    sections: [
      {
        title: '1. Informationen, die wir erheben',
        body: 'Wir erheben Informationen, die Sie uns direkt mitteilen, wenn Sie sich registrieren, eine Lektion buchen, ein Kontaktformular ausfüllen oder mit uns kommunizieren. Dazu gehören: vollständiger Name, E-Mail-Adresse, Telefonnummer, Sprachlernpräferenzen und Zahlungsdaten, die sicher über WayForPay verarbeitet werden.',
      },
      {
        title: '2. Wie wir Ihre Informationen verwenden',
        body: 'Wir verwenden die gesammelten Informationen um: Ihre Lektionen zu planen und zu verwalten, Bestätigungs- und Erinnerungs-E-Mails zu senden, Zahlungen zu verarbeiten, unsere Plattform und Dienste zu verbessern sowie Updates oder Sonderangebote zu kommunizieren (nur mit Ihrer Zustimmung).',
      },
      {
        title: '3. Datenspeicherung & Sicherheit',
        body: 'Ihre Daten werden sicher auf der Supabase-Infrastruktur mit branchenüblicher Verschlüsselung gespeichert. Wir verkaufen, vermieten oder teilen Ihre persönlichen Informationen niemals an Dritte, außer wenn dies zur Erbringung unserer Dienste erforderlich ist (EmailJS für Benachrichtigungen, WayForPay für Zahlungsabwicklung).',
      },
      {
        title: '4. Cookies',
        body: 'Wir verwenden essentielle Cookies, um Ihre Sitzung aufrechtzuerhalten und Spracheinstellungen zu speichern. Tracking- oder Werbe-Cookies werden nicht ohne Ihre Zustimmung verwendet. Sie können Cookies in Ihren Browser-Einstellungen deaktivieren, obwohl einige Funktionen möglicherweise nicht korrekt funktionieren.',
      },
      {
        title: '5. Ihre Rechte',
        body: 'Sie haben das Recht: auf Ihre personenbezogenen Daten zuzugreifen, ungenaue Informationen zu korrigieren, die Löschung Ihres Kontos und Ihrer Daten zu beantragen, die Einwilligung zu Marketingkommunikationen jederzeit zu widerrufen. Um diese Rechte auszuüben, kontaktieren Sie uns unter novaflowschool@gmail.com.',
      },
      {
        title: '6. Kontakt',
        body: 'Bei datenschutzbezogenen Fragen kontaktieren Sie uns bitte unter: novaflowschool@gmail.com oder +380759648499. Wir antworten innerhalb von 5 Werktagen.',
      },
    ],
  },
};

export default function PrivacyPage() {
  const { language } = useLanguage();
  const lang = language as keyof typeof content;
  const data = content[lang] ?? content.en;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav Bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/img/logo.svg" alt="NovaFlow" width={32} height={32} className="w-8 h-8" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 -mb-0.5">NovaFlow</span>
              <span className="text-[9px] font-semibold tracking-[0.15em] text-purple-600">LANGUAGE SCHOOL</span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-purple-600 flex items-center gap-1.5 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {language === 'uk' ? 'Назад' : language === 'de' ? 'Zurück' : 'Back'}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-white/15 text-purple-100 border border-white/20 mb-4">
            {data.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {data.title}
          </h1>
          <p className="mt-3 text-purple-200 text-sm">{data.updated}</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* Intro card */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 sm:p-8 mb-10">
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{data.intro}</p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {data.sections.map((section, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                {section.title.replace(/^\d+\.\s/, '')}
              </h2>
              <p className="text-gray-600 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Back + Contact CTA */}
        <div className="mt-14 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-purple-400 hover:text-purple-600 transition-all duration-200"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {language === 'uk' ? 'Повернутись на головну' : language === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
          </Link>
          <Link
            href="/contact-support"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all duration-200"
          >
            {language === 'uk' ? 'Зв\'язатись з підтримкою' : language === 'de' ? 'Support kontaktieren' : 'Contact Support'}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Mini footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © 2026 NovaFlow Language School. All rights reserved.
      </footer>
    </div>
  );
}
