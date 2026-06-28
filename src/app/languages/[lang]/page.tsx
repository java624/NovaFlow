'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import LanguageHeader from '@/components/landing/LanguageHeader';
import Footer from '@/components/landing/Footer';
import PricingCarousel from '@/components/landing/PricingCarousel';
import { languageConfigs, translations, validLangs } from '@/lib/language-data';

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

  const config = languageConfigs[langKey];
  const t = translations[config.code] || translations.en;

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

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
    const courseName = encodeURIComponent(plan.title);
    window.location.href = `/dashboard?payment=stripe&lang=${langKey}&plan=${courseName}&price=${plan.btnPrice}&lessons=${plan.btnLessons}`;
  };

  return (
    <>
      <LanguageHeader />
      <main>
        {/* ========== HERO ========== */}
        <section id="hero" className="relative pt-20 md:pt-24 overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh] py-12 lg:py-20">
              <div className="relative z-10">
                <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-5">
                  {config.heroBadge}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                  {config.heroTitle}
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                  {config.heroDesc}
                </p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <span>{t.pricing_btn_start}</span>
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

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] sm:h-[80px] md:h-[100px] animate-wave-flow">
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
                {t.course_syllabus_title}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {t.course_syllabus_title}
              </h2>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                {t.course_syllabus_desc}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {config.programSteps.map((p) => (
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
                {t.pricing_tag}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {t.pricing_title}
              </h2>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                {t.pricing_desc}
              </p>
            </div>

            <PricingCarousel plans={config.pricingPlans} onBuy={handleBuyPlan} />
          </div>
        </section>

        {/* ========== CONTACT / BOOKING ========== */}
        <section id="contact" className="py-20 sm:py-28 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
                  {config.contactTitle}
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10">
                  {config.contactDesc}
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{t.contact_email_title}</h4>
                      <p className="text-sm text-gray-500">{t.contact_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{t.contact_phone_title}</h4>
                      <p className="text-sm text-gray-500">{t.contact_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100">
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.form_label_name}</label>
                      <input type="text" placeholder={t.placeholder_name} required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.form_label_email}</label>
                      <input type="email" placeholder={t.placeholder_email} required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.form_label_phone}</label>
                    <input type="tel" placeholder={t.placeholder_phone}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.form_label_lang}</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" required defaultValue="">
                        <option value="" disabled>{t.select_lang_placeholder}</option>
                        <option value="English">English</option>
                        <option value="German">German</option>
                        <option value="Ukrainian">Ukrainian</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.form_label_level}</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" required defaultValue="">
                        <option value="" disabled>{t.select_level_placeholder}</option>
                        <option value="Absolute Beginner (A0)">{t.option_level_0}</option>
                        <option value="Elementary (A1-A2)">{t.option_level_1}</option>
                        <option value="Intermediate (B1-B2)">{t.option_level_2}</option>
                        <option value="Advanced (C1-C2)">{t.option_level_3}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.form_label_msg}</label>
                    <textarea placeholder={t.placeholder_msg} rows={4} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none" />
                  </div>
                  <button type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group">
                    <span>{t.form_btn}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========== QUIZ MODAL ========== */}
      {showQuiz && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => resetQuiz()}>
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={resetQuiz} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {quizStep === 1 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.quiz_title_1}</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: '25%' }} />
                </div>
                <div className="space-y-3">
                  {[
                    { val: t.quiz_opt_1a, key: t.quiz_opt_1a },
                    { val: t.quiz_opt_1b, key: t.quiz_opt_1b },
                    { val: t.quiz_opt_1c, key: t.quiz_opt_1c },
                  ].map((opt) => (
                    <button key={opt.val} onClick={() => handleQuizSelect(1, opt.val)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-base font-medium text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl border border-gray-100 hover:border-purple-200 transition-all group">
                      <span>{opt.val}</span>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-purple-600 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.quiz_title_2}</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: '50%' }} />
                </div>
                <div className="space-y-3">
                  {[
                    { val: t.quiz_opt_2a, label: t.quiz_opt_2a },
                    { val: t.quiz_opt_2b, label: t.quiz_opt_2b },
                    { val: t.quiz_opt_2c, label: t.quiz_opt_2c },
                  ].map((opt) => (
                    <button key={opt.val} onClick={() => handleQuizSelect(2, opt.val)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-base font-medium text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl border border-gray-100 hover:border-purple-200 transition-all group">
                      <span>{opt.label}</span>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-purple-600 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.quiz_title_3}</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="space-y-3">
                  {[
                    { val: t.quiz_opt_3a, label: t.quiz_opt_3a },
                    { val: t.quiz_opt_3b, label: t.quiz_opt_3b },
                    { val: t.quiz_opt_3c, label: t.quiz_opt_3c },
                  ].map((opt) => (
                    <button key={opt.val} onClick={() => handleQuizSelect(3, opt.val)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-base font-medium text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl border border-gray-100 hover:border-purple-200 transition-all group">
                      <span>{opt.label}</span>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-purple-600 transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 4 && (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.quiz_result_title}</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-5 py-2 rounded-full mb-4">
                  {config.quizBadge}
                </div>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  Based on your inputs, we have selected an optimized path: <strong>{config.name}</strong> for{' '}
                  <strong>{quizAnswers.step2 || 'Career'}</strong> dedicating{' '}
                  <strong>{quizAnswers.step3 || '30 mins'}</strong> daily. You can lock in your first speaking session immediately.
                </p>
                <button
                  onClick={() => { resetQuiz(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {t.quiz_btn_book}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer navItems={[
        { label: 'Home', href: '/' },
        { label: 'What You Will Master', href: '#program' },
        { label: 'Pricing Plans', href: '#pricing' },
        { label: 'Contact', href: '#contact' },
      ]} />
    </>
  );
}