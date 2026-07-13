'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  en: {
    badge: 'Legal',
    title: 'Terms of Use',
    updated: 'Last updated: July 13, 2026',
    intro: 'By accessing and using the NovaFlow Language School platform, you agree to be bound by the following Terms of Use. Please read them carefully before registering or booking any lessons.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: 'By creating an account or using our services, you confirm that you are at least 16 years of age and agree to these Terms of Use in full. If you do not agree, please do not use our platform.',
      },
      {
        title: '2. Our Services',
        body: 'NovaFlow provides online language learning services including personalized 1-on-1 lessons in English, German, and Ukrainian. We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice.',
      },
      {
        title: '3. Scheduling & Cancellation Policy',
        body: 'Lessons must be cancelled or rescheduled at least 12 hours in advance. Late cancellations or no-shows will result in the lesson being deducted from your balance. We reserve the right to reschedule a lesson if unforeseen circumstances arise on our side, with no deduction from your balance.',
      },
      {
        title: '4. Payments & Refunds',
        body: 'All payments are processed securely through WayForPay. Purchased lesson packages are non-refundable once lessons have begun. Unused lessons from a package can be transferred within 6 months of purchase. In case of a payment dispute, please contact us directly at novaflowschool@gmail.com.',
      },
      {
        title: '5. User Conduct',
        body: 'You agree not to: share your account credentials with others, record lessons without prior consent, use the platform for any unlawful purpose, harass or disrespect teachers or staff, or attempt to circumvent any security measures.',
      },
      {
        title: '6. Intellectual Property',
        body: 'All course materials, lesson recordings (if provided), and platform content are the intellectual property of NovaFlow Language School. Unauthorized distribution, reproduction, or commercial use of our materials is strictly prohibited.',
      },
      {
        title: '7. Limitation of Liability',
        body: 'NovaFlow is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability for any claim shall not exceed the amount paid by you in the 30 days preceding the claim.',
      },
      {
        title: '8. Changes to Terms',
        body: 'We may update these Terms of Use from time to time. We will notify registered users via email of significant changes. Continued use of the platform after notification constitutes acceptance of the updated terms.',
      },
    ],
  },
  uk: {
    badge: 'Юридична інформація',
    title: 'Умови використання',
    updated: 'Оновлено: 13 липня 2026 р.',
    intro: 'Отримуючи доступ до платформи мовної школи NovaFlow та використовуючи її, ви погоджуєтеся з наступними Умовами використання. Будь ласка, уважно ознайомтеся з ними перед реєстрацією або бронюванням уроків.',
    sections: [
      {
        title: '1. Прийняття умов',
        body: 'Створюючи обліковий запис або користуючись нашими послугами, ви підтверджуєте, що вам виповнилося 16 років, і повністю погоджуєтеся з цими Умовами використання. Якщо ви не погоджуєтеся, будь ласка, не використовуйте нашу платформу.',
      },
      {
        title: '2. Наші послуги',
        body: 'NovaFlow надає послуги онлайн-навчання мов, включаючи персоналізовані індивідуальні уроки з англійської, німецької та української мов. Ми залишаємо за собою право змінювати, призупиняти або припиняти будь-яку частину нашого сервісу в будь-який час із розумним попередженням.',
      },
      {
        title: '3. Розклад та правила скасування',
        body: 'Уроки потрібно скасовувати або переносити не менш ніж за 12 годин. Пізнє скасування або неявка призведуть до списання уроку з вашого балансу. Ми залишаємо за собою право перенести урок у разі непередбачених обставин з нашого боку без списання з вашого балансу.',
      },
      {
        title: '4. Платежі та повернення коштів',
        body: 'Усі платежі обробляються безпечно через WayForPay. Придбані пакети уроків не підлягають поверненню після початку занять. Невикористані уроки з пакета можна перенести протягом 6 місяців з дати придбання. У разі суперечки щодо платежу, будь ласка, зв\'яжіться з нами за адресою novaflowschool@gmail.com.',
      },
      {
        title: '5. Поведінка користувачів',
        body: 'Ви погоджуєтеся не: ділитися даними свого облікового запису з іншими, записувати уроки без попередньої згоди, використовувати платформу в незаконних цілях, ображати або неповажно ставитися до викладачів і персоналу, намагатися обійти заходи безпеки.',
      },
      {
        title: '6. Інтелектуальна власність',
        body: 'Усі навчальні матеріали, записи уроків (якщо надаються) та контент платформи є інтелектуальною власністю мовної школи NovaFlow. Несанкціоноване розповсюдження, відтворення або комерційне використання наших матеріалів суворо заборонено.',
      },
      {
        title: '7. Обмеження відповідальності',
        body: 'NovaFlow не несе відповідальності за будь-які непрямі, випадкові або наслідкові збитки, що виникли внаслідок використання платформи. Наша сукупна відповідальність за будь-яку претензію не перевищуватиме суму, сплачену вами за 30 днів до подачі претензії.',
      },
      {
        title: '8. Зміни умов',
        body: 'Ми можемо час від часу оновлювати ці Умови використання. Ми повідомлятимемо зареєстрованих користувачів електронною поштою про суттєві зміни. Продовження використання платформи після повідомлення означає прийняття оновлених умов.',
      },
    ],
  },
  de: {
    badge: 'Rechtliches',
    title: 'Nutzungsbedingungen',
    updated: 'Zuletzt aktualisiert: 13. Juli 2026',
    intro: 'Durch den Zugriff auf und die Nutzung der NovaFlow Sprachschul-Plattform erklären Sie sich mit den folgenden Nutzungsbedingungen einverstanden. Bitte lesen Sie diese sorgfältig durch, bevor Sie sich registrieren oder Lektionen buchen.',
    sections: [
      {
        title: '1. Annahme der Bedingungen',
        body: 'Durch die Erstellung eines Kontos oder die Nutzung unserer Dienste bestätigen Sie, dass Sie mindestens 16 Jahre alt sind und diesen Nutzungsbedingungen vollständig zustimmen. Wenn Sie nicht einverstanden sind, nutzen Sie bitte unsere Plattform nicht.',
      },
      {
        title: '2. Unsere Dienste',
        body: 'NovaFlow bietet Online-Sprachlernservices an, einschließlich personalisierter 1-zu-1-Lektionen in Englisch, Deutsch und Ukrainisch. Wir behalten uns das Recht vor, jeden Teil unseres Dienstes jederzeit mit angemessener Ankündigung zu ändern, auszusetzen oder einzustellen.',
      },
      {
        title: '3. Terminplanung & Stornierungsbedingungen',
        body: 'Lektionen müssen mindestens 12 Stunden im Voraus storniert oder verschoben werden. Späte Stornierungen oder Nichterscheinen führen zur Abbuchung der Lektion von Ihrem Guthaben. Wir behalten uns das Recht vor, eine Lektion bei unvorhergesehenen Umständen unsererseits zu verschieben, ohne Abzug von Ihrem Guthaben.',
      },
      {
        title: '4. Zahlungen & Rückerstattungen',
        body: 'Alle Zahlungen werden sicher über WayForPay verarbeitet. Gekaufte Lektionspakete sind nach Beginn der Lektionen nicht erstattungsfähig. Ungenutzte Lektionen aus einem Paket können innerhalb von 6 Monaten nach dem Kauf übertragen werden. Bei Zahlungsstreitigkeiten wenden Sie sich bitte direkt an uns: novaflowschool@gmail.com.',
      },
      {
        title: '5. Benutzerverhalten',
        body: 'Sie erklären sich damit einverstanden, nicht: Ihre Kontoanmeldeinformationen mit anderen zu teilen, Lektionen ohne vorherige Zustimmung aufzuzeichnen, die Plattform für illegale Zwecke zu nutzen, Lehrer oder Personal zu belästigen oder zu respektieren, Sicherheitsmaßnahmen zu umgehen.',
      },
      {
        title: '6. Geistiges Eigentum',
        body: 'Alle Kursmaterialien, Lektionsaufzeichnungen (falls bereitgestellt) und Plattforminhalte sind geistiges Eigentum der NovaFlow Sprachschule. Unerlaubte Verbreitung, Vervielfältigung oder kommerzielle Nutzung unserer Materialien ist strengstens untersagt.',
      },
      {
        title: '7. Haftungsbeschränkung',
        body: 'NovaFlow haftet nicht für mittelbare, zufällige oder Folgeschäden, die aus Ihrer Nutzung der Plattform entstehen. Unsere Gesamthaftung für jeden Anspruch übersteigt nicht den Betrag, den Sie in den 30 Tagen vor dem Anspruch bezahlt haben.',
      },
      {
        title: '8. Änderungen der Bedingungen',
        body: 'Wir können diese Nutzungsbedingungen von Zeit zu Zeit aktualisieren. Wir werden registrierte Benutzer per E-Mail über wesentliche Änderungen informieren. Die fortgesetzte Nutzung der Plattform nach der Benachrichtigung gilt als Annahme der aktualisierten Bedingungen.',
      },
    ],
  },
};

export default function TermsPage() {
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
      <div className="bg-gradient-to-br from-indigo-700 via-purple-600 to-purple-700 py-14 sm:py-20">
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
        {/* Intro */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8 mb-10">
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
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                {section.title.replace(/^\d+\.\s/, '')}
              </h2>
              <p className="text-gray-600 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all duration-200"
          >
            {language === 'uk' ? 'Зв\'язатись з підтримкою' : language === 'de' ? 'Support kontaktieren' : 'Contact Support'}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © 2026 NovaFlow Language School. All rights reserved.
      </footer>
    </div>
  );
}
