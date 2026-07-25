'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  en: {
    badge: 'Legal',
    title: 'Refund & Cancellation Policy',
    updated: 'Last updated: July 25, 2026',
    intro:
      'At NovaFlow Language School, we strive to ensure total transparency and customer satisfaction with our educational services. This Refund & Cancellation Policy outlines the rules for cancelling, rescheduling lessons, and requesting refunds.',
    entityCard: {
      title: 'Business Entity & Merchant Details',
      subtitle: 'Information for payment processing (WayForPay)',
      nameLabel: 'Business Entity',
      nameVal: 'FOP Hulkin Kiril Valentynovych (ФОП Гулькін Кіріл Валентинович)',
      taxLabel: 'Tax Identification Number (ITN / РНОКПП)',
      taxVal: '3852707076',
      emailLabel: 'Support Email',
      emailVal: 'novaflowschool@gmail.com',
      phoneLabel: 'Contact Phone',
      phoneVal: '+380759648499',
    },
    sections: [
      {
        id: 'cancellation',
        icon: '⏰',
        title: '1. Lesson Cancellation & Rescheduling',
        body: 'Students have the right to cancel or reschedule a scheduled lesson without any penalty or deduction, provided the request is submitted at least 24 hours prior to the start of the lesson via the NovaFlow dashboard or by contacting support.',
      },
      {
        id: 'no-show',
        icon: '⚠️',
        title: '2. Late Cancellation & No-Show Policy',
        body: 'If a student cancels or requests to reschedule a lesson less than 24 hours before its scheduled start, or fails to attend (no-show), the lesson will be counted as conducted and deducted from the student\'s active lesson balance without refund eligibility.',
      },
      {
        id: 'packages',
        icon: '💳',
        title: '3. Refund of Unused Lesson Packages',
        body: 'If a student purchases a multi-lesson package and decides to discontinue studies, a refund for unused lessons may be requested. The refund amount will be calculated by deducting the standard full price of all completed lessons from the total package price paid.',
      },
      {
        id: 'technical',
        icon: '🛠️',
        title: '4. Technical Disruption & School Cancellation',
        body: 'If a lesson is cancelled or interrupted due to technical failure on the NovaFlow platform or on the part of the teacher, the lesson will be rescheduled to a mutually convenient time free of charge, or refunded in full upon student request.',
      },
      {
        id: 'timeline',
        icon: '⏱️',
        title: '5. Processing Timeframe & Payment Method',
        body: 'Refund applications are reviewed by support within 3–5 business days. Approved refunds are credited back to the original bank card used for the transaction via WayForPay within 5–14 banking days, depending on the issuing bank.',
      },
    ],
  },
  uk: {
    badge: 'Юридична інформація',
    title: 'Політика повернення коштів та скасування',
    updated: 'Оновлено: 25 липня 2026 р.',
    intro:
      'Мовна школа NovaFlow прагне забезпечити повну прозорість та задоволеність клієнтів нашими освітніми послугами. Ця Політика регламентує правила скасування, перенесення уроків та повернення коштів.',
    entityCard: {
      title: 'Реквізити суб\'єкта господарювання',
      subtitle: 'Інформація для платіжної системи (WayForPay)',
      nameLabel: 'Суб\'єкт господарювання',
      nameVal: 'ФОП Гулькін Кіріл Валентинович',
      taxLabel: 'ІПН / РНОКПП',
      taxVal: '3852707076',
      emailLabel: 'Email підтримки',
      emailVal: 'novaflowschool@gmail.com',
      phoneLabel: 'Телефон',
      phoneVal: '+380759648499',
    },
    sections: [
      {
        id: 'cancellation',
        icon: '⏰',
        title: '1. Скасування та перенесення уроків',
        body: 'Студент має право безкоштовно скасувати або перенести запланований урок, якщо сповіщення надіслано не пізніше ніж за 24 години до початку уроку через особистий кабінет NovaFlow або службу підтримки.',
      },
      {
        id: 'no-show',
        icon: '⚠️',
        title: '2. Пізнє скасування та неявка (No-Show)',
        body: 'Якщо учень скасовує/переносить урок менше ніж за 24 години до його початку або не з\'являється на заняття, урок вважається успішно проведеним і кошти/заняття з балансу не повертаються.',
      },
      {
        id: 'packages',
        icon: '💳',
        title: '3. Повернення коштів за невикористані пакети уроків',
        body: 'У разі купівлі пакету уроків та бажання припинити навчання, студент може запросити повернення коштів за невикористані заняття. Сума повернення розраховується як різниця між сплаченою вартістю пакету та стандартною повною вартістю вже проведених уроків.',
      },
      {
        id: 'technical',
        icon: '🛠️',
        title: '4. Технічні збої та скасування з боку школи',
        body: 'Якщо урок не відбувся або був перерваний через технічні проблеми на боці платформи NovaFlow чи викладача, занять буде безкоштовно перенесено на інший зручний час або кошти за цей урок будуть повернені у повному обсязі.',
      },
      {
        id: 'timeline',
        icon: '⏱️',
        title: '5. Терміни обробки заявки та регламент повернення',
        body: 'Запити на повернення коштів обробляються протягом 3–5 робочих днів. Підтверджені кошти повертаються на ту ж банківську картку, з якої здійснювалася оплата через WayForPay, протягом 5–14 банківських днів.',
      },
    ],
  },
  de: {
    badge: 'Rechtliches',
    title: 'Rückerstattungs- & Stornierungsrichtlinie',
    updated: 'Zuletzt aktualisiert: 25. Juli 2026',
    intro:
      'Die NovaFlow Sprachschule legt großen Wert auf Transparenz und Zufriedenheit bei unseren Bildungsdienstleistungen. Diese Richtlinie regelt die Bedingungen für Stornierungen, Umbuchungen und Rückerstattungen.',
    entityCard: {
      title: 'Unternehmensangaben & Händlerinformationen',
      subtitle: 'Informationen für die Zahlungsabwicklung (WayForPay)',
      nameLabel: 'Unternehmen',
      nameVal: 'FOP Hulkin Kiril Valentynovych (ФОП Гулькін Кіріл Валентинович)',
      taxLabel: 'Steuernummer (ITN / РНОКПП)',
      taxVal: '3852707076',
      emailLabel: 'Support-E-Mail',
      emailVal: 'novaflowschool@gmail.com',
      phoneLabel: 'Telefon',
      phoneVal: '+380759648499',
    },
    sections: [
      {
        id: 'cancellation',
        icon: '⏰',
        title: '1. Stornierung und Umbuchung von Lektionen',
        body: 'Schüler können eine gebuchte Lektion bis zu 24 Stunden vor Beginn kostenlos stornieren oder verschieben.',
      },
      {
        id: 'no-show',
        icon: '⚠️',
        title: '2. Späte Stornierung & Nichterscheinen',
        body: 'Bei einer Stornierung weniger als 24 Stunden vor Beginn oder bei Nichterscheinen gilt die Lektion als erbracht und wird nicht rückerstattet.',
      },
      {
        id: 'packages',
        icon: '💳',
        title: '3. Rückerstattung ungenutzter Unterrichtspakete',
        body: 'Bei Stornierung eines Unterrichtspakets wird der Erstattungsbetrag abzüglich des regulären Einzelpreises der bereits absolvierten Lektionen berechnet.',
      },
      {
        id: 'technical',
        icon: '🛠️',
        title: '4. Technische Störungen & Ausfall durch die Schule',
        body: 'Fällt eine Lektion aufgrund technischer Probleme seitens der Plattform oder des Lehrers aus, wird sie kostenlos nachgeholt oder vollständig erstattet.',
      },
      {
        id: 'timeline',
        icon: '⏱️',
        title: '5. Bearbeitungszeit & Auszahlung',
        body: 'Rückerstattungsanträge werden innerhalb von 3–5 Werktagen bearbeitet. Das Geld wird innerhalb von 5–14 Bankarbeitstagen auf die ursprüngliche Karte via WayForPay zurückerstattet.',
      },
    ],
  },
};

export default function RefundPolicyPage() {
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

      {/* Hero Header */}
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

      {/* Content Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* Intro card */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 sm:p-8 mb-10">
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{data.intro}</p>
        </div>

        {/* Merchant & Business Card (WayForPay Compliance) */}
        <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-6 sm:p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
              🏢
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{data.entityCard.title}</h2>
              <p className="text-xs sm:text-sm text-purple-600 font-medium">{data.entityCard.subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
            <div>
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {data.entityCard.nameLabel}
              </span>
              <span className="font-semibold text-gray-800">{data.entityCard.nameVal}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {data.entityCard.taxLabel}
              </span>
              <span className="font-semibold text-gray-800">{data.entityCard.taxVal}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {data.entityCard.emailLabel}
              </span>
              <a href={`mailto:${data.entityCard.emailVal}`} className="font-semibold text-purple-600 hover:underline">
                {data.entityCard.emailVal}
              </a>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {data.entityCard.phoneLabel}
              </span>
              <a href={`tel:${data.entityCard.phoneVal}`} className="font-semibold text-gray-800 hover:text-purple-600">
                {data.entityCard.phoneVal}
              </a>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {data.sections.map((section, i) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-lg shrink-0">
                  {section.icon}
                </span>
                <span>{section.title}</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base pl-12">{section.body}</p>
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

      {/* Mini Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © 2026 NovaFlow Language School. All rights reserved.
      </footer>
    </div>
  );
}
