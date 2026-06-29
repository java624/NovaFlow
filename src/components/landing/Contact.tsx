'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

export default function Contact() {
  const { t } = useLanguage();
  const infoRef = useScrollReveal<HTMLDivElement>();
  const formRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Info Panel */}
          <div ref={infoRef} className="reveal-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
              {t('contact_title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10">
              {t('contact_desc')}
            </p>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t('contact_email_title')}</h4>
                  <p className="text-sm text-gray-500">hello@novaflow-school.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t('contact_phone_title')}</h4>
                  <p className="text-sm text-gray-500">+380759648499</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div ref={formRef} className="reveal-right bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 card-lift">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {/* Row: Name + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_name')}</label>
                  <input
                    type="text"
                    placeholder={t('placeholder_name')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all focus:scale-[1.01]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_email')}</label>
                  <input
                    type="email"
                    placeholder={t('placeholder_email')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all focus:scale-[1.01]"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_phone')}</label>
                <input
                  type="tel"
                  placeholder={t('placeholder_phone')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all focus:scale-[1.01]"
                />
              </div>

              {/* Row: Language + Level */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_lang')}</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" 
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>{t('select_lang_placeholder')}</option>
                    <option value="English">{t('course_en_title')}</option>
                    <option value="German">{t('course_de_title')}</option>
                    <option value="Ukrainian">{t('course_ua_title')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_level')}</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" 
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>{t('select_level_placeholder')}</option>
                    <option value="Absolute Beginner (A0)">{t('option_level_0')}</option>
                    <option value="Elementary (A1-A2)">{t('option_level_1')}</option>
                    <option value="Intermediate (B1-B2)">{t('option_level_2')}</option>
                    <option value="Advanced (C1-C2)">{t('option_level_3')}</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('form_label_msg')}</label>
                <textarea
                  placeholder={t('placeholder_msg')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none focus:scale-[1.01]"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 group"
              >
                <span>{t('form_btn')}</span>
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
  );
}
