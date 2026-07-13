'use client';

import { useState, FormEvent, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { useParams } from 'next/navigation';
import LanguageHeader from '@/components/landing/LanguageHeader';
import Footer from '@/components/landing/Footer';
import PricingCarousel from '@/components/landing/PricingCarousel';
import { useLanguage } from '@/context/LanguageContext';
import { languageConfigs, validLangs } from '@/lib/language-data';

export default function LanguageCoursePage() {
  const params = useParams();
  const lang = (params?.lang as string) || '';

  // Fallback: if language not found, redirect to English
  const langKey = validLangs.includes(lang) ? lang : 'english';
  if (!validLangs.includes(lang)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/languages/english';
    }
  }

  const { language, t } = useLanguage();
  const config = languageConfigs[langKey];

  const coursePrefix = langKey === 'english' ? 'en' : langKey === 'german' ? 'de' : 'uk';

  const heroBadge = t(`course_${coursePrefix}_badge`) || config.heroBadge;
  const heroTitle = t(`course_${coursePrefix}_hero_title`) || config.heroTitle;
  const heroDesc = t(`course_${coursePrefix}_hero_desc`) || config.heroDesc;
  const contactTitle = t('course_book_title') || config.contactTitle;
  const contactDesc = t('course_book_desc') || config.contactDesc;
  const quizBadge = t(`quiz_${coursePrefix}_badge`) || config.quizBadge;
  const courseName = t(`course_${coursePrefix}_title`) || config.name;

  const translatedProgramSteps = config.programSteps.map((step) => ({
    ...step,
    title: t(`prog_${coursePrefix}_title${step.step}`) || step.title,
    desc: t(`prog_${coursePrefix}_desc${step.step}`) || step.desc,
  }));

  const translatedPricingPlans = config.pricingPlans.map((plan) => {
    const titleKey = `price_${coursePrefix}_${plan.id}_title`;
    const descKey = `price_${coursePrefix}_${plan.id}_desc`;
    const discountKey = `price_${coursePrefix}_${plan.id}_discount`;

    const featureMap: Record<string, string> = {
      '1-on-1 Placement Lesson': 'feat_free_1',
      'Custom Speaking Assessment': 'feat_free_2',
      'Tailored Study Plan': 'feat_free_3',
      'Basic Grammar & Vocabulary': 'feat_beginners_1',
      'Speaking Practice': 'feat_beginners_2',
      'Listening Exercises': 'feat_beginners_3',
      'Homework & Feedback': 'feat_beginners_4',
      'Speaking-Focused Lessons': 'feat_comm_1',
      'Everyday Vocabulary': 'feat_comm_2',
      'Pronunciation Training': 'feat_comm_3',
      'Interactive Discussions': 'feat_comm_4',
      'Business Vocabulary': 'feat_business_1',
      'Email Writing': 'feat_business_2',
      'Meeting & Presentation Skills': 'feat_business_3',
      'Professional Speaking Practice': 'feat_business_4',
      'Exam Strategies & Formats': 'feat_exam_1',
      'Mock Speaking & Writing Tests': 'feat_exam_2',
      'Advanced Grammar & Structures': 'feat_exam_3',
      'Time Management Tactics': 'feat_exam_4',
      'Basic Grammar': 'feat_ua_beginners_1',
      'Essential Vocabulary': 'feat_ua_beginners_2',
      'Everyday Conversations': 'feat_ua_beginners_4',
      'Modern Vocabulary': 'feat_ua_comm_2',
      'Listening Activities': 'feat_ua_comm_3',
      'Pronunciation Improvement': 'feat_ua_comm_4',
    };

    const translatedFeatures = plan.features.map((feat) => {
      const key = featureMap[feat];
      return key ? t(key) : feat;
    });

    const btnTextMap: Record<string, string> = {
      'Book Free Lesson': 'btn_book_free',
      'Get 10 Lessons Pack': 'btn_get_pack',
      'Start Learning': 'btn_start_learning',
      'Improve Your Speaking': 'btn_improve_speaking',
    };
    const btnTextKey = btnTextMap[plan.btnText];
    const translatedBtnText = btnTextKey ? t(btnTextKey) : plan.btnText;

    return {
      ...plan,
      title: t(titleKey) || plan.title,
      desc: t(descKey) || plan.desc,
      discount: plan.discount ? t(discountKey) || plan.discount : undefined,
      features: translatedFeatures,
      btnText: translatedBtnText,
    };
  });

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  // ─── Booking form state ────────────────────────────────────────────────────
  const bookingFormRef = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleBookingSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      await emailjs.sendForm(
        'service_orowegp',
        'template_pmzcrmp',
        bookingFormRef.current!,
        'Q9kpKOwIznWpVx0tA'
      );
      setFormStatus('success');
      bookingFormRef.current?.reset();
    } catch {
      setFormStatus('error');
    }
  };

  const handleQuizSelect = (step: number, value: string) => {
    setQuizAnswers((prev) => ({ ...prev, [`step${step}`]: value }));
    if (step < 4) setQuizStep(step + 1);
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuizStep(1);
    setQuizAnswers({});
  };

  const handleBuyPlan = (plan: typeof config.pricingPlans[0]) => {
    if (plan.btnPrice === '0') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const courseNameEncoded = encodeURIComponent(plan.title);
    window.location.href = `/dashboard?payment=stripe&lang=${langKey}&plan=${courseNameEncoded}&price=${plan.btnPrice}&lessons=${plan.btnLessons}`;
  };

  return (
    <>
      <LanguageHeader />
      <main>
        {/* ========== HERO ========== */}
        <section id="hero" className="relative pt-20 md:pt-24 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes heroFadeUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .hero-fade-up {
              opacity: 0;
              animation: heroFadeUp 0.7s ease-out forwards;
            }

            /* Будь-який акцентний тег (span/strong/em) всередині заголовка
               автоматично отримує фірмовий фіолетовий градієнт і легке мерехтіння */
            @keyframes heroAccentShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .hero-title-accent :is(span, strong, em) {
              background: linear-gradient(90deg, #7C3AED, #A855F7, #7C3AED);
              background-size: 200% auto;
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              font-style: normal;
              animation: heroAccentShift 6s ease-in-out infinite;
            }

            @keyframes heroWaveBob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(5px); }
            }
            .hero-wave-bob {
              animation: heroWaveBob 5s ease-in-out infinite;
            }

            @media (prefers-reduced-motion: reduce) {
              .hero-fade-up,
              .hero-title-accent :is(span, strong, em),
              .hero-wave-bob {
                animation: none !important;
              }
            }
          `}} />

          {/* Ambient background glow, узгоджено з рештою сайту */}
          <div className="absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-fuchsia-300/15 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh] py-12 lg:py-20">
              <div className="relative z-10">
                <span className="hero-fade-up inline-flex items-center gap-2 text-sm font-semibold text-purple-600 bg-purple-50 border border-purple-100 px-4 py-1.5 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {heroBadge}
                </span>
                <h1
                  className="hero-title-accent hero-fade-up text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
                  style={{ animationDelay: '0.1s' }}
                  dangerouslySetInnerHTML={{ __html: heroTitle }}
                />
                <p className="hero-fade-up mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl" style={{ animationDelay: '0.2s' }}>
                  {heroDesc}
                </p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="hero-fade-up mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200 group"
                  style={{ animationDelay: '0.3s' }}
                >
                  <span>{t('pricing_btn_start')}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              {/* Flag - premium animated */}
              <div className="relative flex items-center justify-center pb-12 sm:pb-0 z-10">
                <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                  {/* Glow ring */}
                  <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/10 animate-flag-glow" />
                  
                  {/* Orbiting particles */}
                  <div className="absolute inset-0 animate-flag-orbit-slow">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-400/40 blur-sm" />
                  </div>
                  <div className="absolute inset-0 animate-flag-orbit-fast">
                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-purple-300/50 blur-sm" />
                  </div>

                  {/* The flag itself */}
                  <div className="relative w-full h-full animate-flag-float drop-shadow-2xl">
                    <div className="w-full h-full animate-flag-tilt perspective-flag">
                      {config.flag}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Divider — трохи нижче, з легким "диханням" та фірмовим кольором */}
          <div className="hero-wave-bob absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[70px] sm:h-[90px] md:h-[110px] animate-wave-flow">
              <defs>
                <linearGradient id="wave-gradient-lang" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="50%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#5E077E" />
                  <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="4s" repeatCount="indefinite" />
                </linearGradient>
              </defs>
              <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#A855F7" opacity="0.15" />
              <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="url(#wave-gradient-lang)" />
            </svg>
          </div>
        </section>

        {/* ========== PROGRAM SYLLABUS ========== */}
        <section id="program" className="py-20 sm:py-28 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
              <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
                {t('course_syllabus_title')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {t('course_syllabus_title')}
              </h2>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                {t('course_syllabus_desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {translatedProgramSteps.map((p) => (
                <div key={p.step} className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-white text-lg font-bold flex items-center justify-center mb-5">
                    {p.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== PRICING PLANS ========== */}
        <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-purple-50/30 to-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
              <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
                {t('pricing_tag')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {t('pricing_title')}
              </h2>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                {t('pricing_desc')}
              </p>
            </div>

            <PricingCarousel plans={translatedPricingPlans} onBuy={handleBuyPlan} />
          </div>
        </section>

        {/* ========== CONTACT / BOOKING ========== */}
        <section id="contact" className="py-20 sm:py-28 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
                  {contactTitle}
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10">
                  {contactDesc}
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{t('contact_email_title')}</h4>
                      <p className="text-sm text-gray-500">{t('contact_email')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{t('contact_phone_title')}</h4>
                      <p className="text-sm text-gray-500">{t('contact_phone')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100">
                {formStatus === 'success' ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('form_success_title') || 'Request Sent!'}</h3>
                    <p className="text-gray-500 text-sm max-w-xs">{t('form_success_desc') || "We'll get back to you within 24 hours."}</p>
                    <button onClick={() => setFormStatus('idle')} className="mt-2 text-sm text-purple-600 hover:underline">{t('form_send_another') || 'Send another request'}</button>
                  </div>
                ) : (
                  <form ref={bookingFormRef} className="space-y-5" onSubmit={handleBookingSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_name')}</label>
                        <input type="text" name="user_name" placeholder={t('placeholder_name')} required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_email')}</label>
                        <input type="email" name="user_email" placeholder={t('placeholder_email')} required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_phone')}</label>
                      <input type="tel" name="user_phone" placeholder={t('placeholder_phone')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_lang')}</label>
                        <select name="language" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" required defaultValue="">
                          <option value="" disabled>{t('select_lang_placeholder')}</option>
                          <option value="English">English</option>
                          <option value="German">German</option>
                          <option value="Ukrainian">Ukrainian</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_level')}</label>
                        <select name="level" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" required defaultValue="">
                          <option value="" disabled>{t('select_level_placeholder')}</option>
                          <option value="Absolute Beginner (A0)">{t('option_level_0')}</option>
                          <option value="Elementary (A1-A2)">{t('option_level_1')}</option>
                          <option value="Intermediate (B1-B2)">{t('option_level_2')}</option>
                          <option value="Advanced (C1-C2)">{t('option_level_3')}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_msg')}</label>
                      <textarea name="message" placeholder={t('placeholder_msg')} rows={4} required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none" />
                    </div>
                    {formStatus === 'error' && (
                      <p className="text-sm text-red-500">{t('form_error') || 'Something went wrong. Please try again.'}</p>
                    )}
                    <button type="submit" disabled={formStatus === 'sending'}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed">
                      {formStatus === 'sending' ? (
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <>
                          <span>{t('form_btn')}</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      

      <Footer navItems={[
        { label: t('nav_home'), href: '/' },
        { label: t('course_syllabus_title'), href: '#program' },
        { label: t('pricing_tag'), href: '#pricing' },
        { label: t('nav_contact'), href: '#contact' },
      ]} />
    </>
  );
}
