'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import emailjs from '@emailjs/browser';
import { useLanguage } from '@/context/LanguageContext';

// Same EmailJS config as Contact.tsx
const EMAILJS_SERVICE_ID  = 'service_orowegp';
const EMAILJS_TEMPLATE_ID = 'template_pmzcrmp';
const EMAILJS_PUBLIC_KEY  = 'Q9kpKOwIznWpVx0tA';

const content = {
  en: {
    badge: 'Support',
    title: 'Contact Support',
    subtitle: 'We usually respond within 2 hours during business hours.',
    faq_title: 'Frequently Asked Questions',
    faq: [
      { q: 'How do I reschedule a lesson?', a: 'Log in to your dashboard and navigate to your upcoming lessons. You can reschedule any lesson at least 12 hours in advance at no extra charge.' },
      { q: 'How does payment work?', a: 'We accept secure online payments via WayForPay. You can purchase lesson packages directly from the "Payments" tab in your student dashboard.' },
      { q: 'What if I miss a lesson?', a: 'If you miss a lesson without cancelling at least 12 hours beforehand, the lesson will be deducted from your balance. Contact us if there was an emergency.' },
      { q: 'Can I try a lesson for free?', a: 'Yes! Your first placement lesson is completely free. Fill out the contact form on our home page or book directly from a course page.' },
    ],
    form_title: 'Send us a message',
    label_name: 'Your Name',
    label_email: 'Email Address',
    label_subject: 'Subject',
    label_message: 'Message',
    placeholder_name: 'John Doe',
    placeholder_email: 'john@example.com',
    placeholder_subject: 'I need help with...',
    placeholder_message: 'Describe your issue or question in detail...',
    btn_send: 'Send Message',
    success: '✅ Message sent! We\'ll get back to you within 2 hours.',
    contact_title: 'Other ways to reach us',
    contact_email: 'novaflowschool@gmail.com',
    contact_phone: '+380759648499',
    contact_telegram: '@Novaflowschool',
  },
  uk: {
    badge: 'Підтримка',
    title: 'Служба підтримки',
    subtitle: 'Ми зазвичай відповідаємо протягом 2 годин у робочий час.',
    faq_title: 'Часті запитання',
    faq: [
      { q: 'Як перенести урок?', a: 'Увійдіть у свій дашборд і перейдіть до майбутніх уроків. Ви можете перенести будь-який урок не менш ніж за 12 годин без додаткової плати.' },
      { q: 'Як здійснюється оплата?', a: 'Ми приймаємо безпечні онлайн-платежі через WayForPay. Ви можете придбати пакети уроків безпосередньо у вкладці "Оплата" вашого студентського дашборду.' },
      { q: 'Що трапляється, якщо я пропущу урок?', a: 'Якщо ви пропустите урок без скасування щонайменше за 12 годин, урок буде списано з вашого балансу. Зв\'яжіться з нами, якщо сталася надзвичайна ситуація.' },
      { q: 'Чи можна спробувати урок безкоштовно?', a: 'Так! Ваш перший вступний урок абсолютно безкоштовний. Заповніть контактну форму на головній сторінці або забронюйте безпосередньо зі сторінки курсу.' },
    ],
    form_title: 'Надіслати повідомлення',
    label_name: 'Ваше ім\'я',
    label_email: 'Електронна пошта',
    label_subject: 'Тема',
    label_message: 'Повідомлення',
    placeholder_name: 'Іван Петренко',
    placeholder_email: 'ivan@example.com',
    placeholder_subject: 'Мені потрібна допомога з...',
    placeholder_message: 'Опишіть вашу проблему або запитання детально...',
    btn_send: 'Надіслати',
    success: '✅ Повідомлення надіслано! Ми зв\'яжемося з вами протягом 2 годин.',
    contact_title: 'Інші способи зв\'язку',
    contact_email: 'novaflowschool@gmail.com',
    contact_phone: '+380759648499',
    contact_telegram: '@Novaflowschool',
  },
  de: {
    badge: 'Support',
    title: 'Support kontaktieren',
    subtitle: 'Wir antworten in der Regel innerhalb von 2 Stunden während der Geschäftszeiten.',
    faq_title: 'Häufig gestellte Fragen',
    faq: [
      { q: 'Wie verschiebe ich eine Lektion?', a: 'Melden Sie sich in Ihrem Dashboard an und navigieren Sie zu Ihren bevorstehenden Lektionen. Sie können jede Lektion mindestens 12 Stunden im Voraus kostenlos verschieben.' },
      { q: 'Wie funktioniert die Zahlung?', a: 'Wir akzeptieren sichere Online-Zahlungen über WayForPay. Sie können Lektionspakete direkt über den Tab "Zahlungen" in Ihrem Schüler-Dashboard erwerben.' },
      { q: 'Was passiert, wenn ich eine Lektion verpasse?', a: 'Wenn Sie eine Lektion verpassen, ohne sie mindestens 12 Stunden vorher abzusagen, wird die Lektion von Ihrem Guthaben abgezogen. Kontaktieren Sie uns, wenn es einen Notfall gab.' },
      { q: 'Kann ich eine Lektion kostenlos ausprobieren?', a: 'Ja! Ihre erste Einstufungslektion ist völlig kostenlos. Füllen Sie das Kontaktformular auf unserer Startseite aus oder buchen Sie direkt auf einer Kursseite.' },
    ],
    form_title: 'Nachricht senden',
    label_name: 'Ihr Name',
    label_email: 'E-Mail-Adresse',
    label_subject: 'Betreff',
    label_message: 'Nachricht',
    placeholder_name: 'Max Mustermann',
    placeholder_email: 'max@example.com',
    placeholder_subject: 'Ich benötige Hilfe mit...',
    placeholder_message: 'Beschreiben Sie Ihr Anliegen oder Ihre Frage im Detail...',
    btn_send: 'Senden',
    success: '✅ Nachricht gesendet! Wir melden uns innerhalb von 2 Stunden.',
    contact_title: 'Andere Kontaktwege',
    contact_email: 'novaflowschool@gmail.com',
    contact_phone: '+380759648499',
    contact_telegram: '@Novaflowschool',
  },
};

const contactCards = [
  {
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'novaflowschool@gmail.com',
    href: 'mailto:novaflowschool@gmail.com',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+380759648499',
    href: 'tel:+380759648499',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    label: 'Telegram',
    value: '@Novaflowschool',
    href: 'https://t.me/Novaflowschool',
    color: 'bg-sky-50 text-sky-500',
  },
];

export default function ContactSupportPage() {
  const { language } = useLanguage();
  const lang = language as keyof typeof content;
  const data = content[lang] ?? content.en;

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          user_name: form.name,
          user_email: form.email,
          language: form.subject,
          message: form.message,
          user_phone: '',
          level: 'Support Request',
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 7000);
    } catch (err) {
      console.error('EmailJS error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/logo.svg" alt="NovaFlow" width={32} height={32} className="w-8 h-8" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 -mb-0.5">NovaFlow</span>
              <span className="text-[9px] font-semibold tracking-[0.15em] text-purple-600">LANGUAGE SCHOOL</span>
            </div>
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-purple-600 flex items-center gap-1.5 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {language === 'uk' ? 'Назад' : language === 'de' ? 'Zurück' : 'Back'}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-700 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-white/15 text-purple-100 border border-white/20 mb-4">
            {data.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {data.title}
          </h1>
          <p className="mt-3 text-purple-200 max-w-xl mx-auto">{data.subtitle}</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left: FAQ + Contact cards */}
          <div className="space-y-10">
            {/* Contact Cards */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5">{data.contact_title}</h2>
              <div className="space-y-4">
                {contactCards.map((card, i) => (
                  <a
                    key={i}
                    href={card.href}
                    target={card.href.startsWith('http') ? '_blank' : undefined}
                    rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
                  >
                    <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{card.value}</p>
                    </div>
                    <svg className="ml-auto text-gray-300 group-hover:text-purple-400 transition-colors w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5">{data.faq_title}</h2>
              <div className="space-y-3">
                {data.faq.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:text-purple-600 transition-colors"
                    >
                      <span>{item.q}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 shrink-0 ml-3 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-purple-500' : ''}`}
                        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{data.form_title}</h2>

            {success && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                {data.success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{data.label_name}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={data.placeholder_name}
                    className={inputClass}
                    disabled={isSending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{data.label_email}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder={data.placeholder_email}
                    className={inputClass}
                    disabled={isSending}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{data.label_subject}</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder={data.placeholder_subject}
                  className={inputClass}
                  disabled={isSending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{data.label_message}</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder={data.placeholder_message}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none"
                  disabled={isSending}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{language === 'uk' ? 'Надсилання...' : language === 'de' ? 'Senden...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <span>{data.btn_send}</span>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © 2026 NovaFlow Language School. All rights reserved.
      </footer>
    </div>
  );
}
