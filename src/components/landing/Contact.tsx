'use client';

import { useState, FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

// ─── EmailJS Configuration ────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_orowegp';
const EMAILJS_TEMPLATE_ID = 'template_pmzcrmp';
const EMAILJS_PUBLIC_KEY  = 'Q9kpKOwIznWpVx0tA';

// ─── Form State Interface ─────────────────────────────────────────────────────
interface FormData {
  user_name:  string;
  user_email: string;
  user_phone: string;
  language:   string;
  level:      string;
  message:    string;
}

const INITIAL_FORM: FormData = {
  user_name:  '',
  user_email: '',
  user_phone: '',
  language:   '',
  level:      '',
  message:    '',
};

// ─── Toast Component ──────────────────────────────────────────────────────────
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateY(0)   scale(1);    }
          to   { opacity: 0; transform: translateY(24px) scale(0.95); }
        }
        .toast-enter { animation: toast-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}} />
      <div
        role="alert"
        aria-live="assertive"
        className="toast-enter fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 flex items-start gap-3 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white border border-purple-100 shadow-2xl px-5 py-4"
      >
        {/* Checkmark icon */}
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>

        <p className="flex-1 text-sm font-medium text-gray-800 leading-relaxed">{message}</p>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Contact() {
  const { t } = useLanguage();
  const infoRef = useScrollReveal<HTMLDivElement>();
  const formRef = useScrollReveal<HTMLDivElement>();

  const [formData, setFormData]     = useState<FormData>(INITIAL_FORM);
  const [isSending, setIsSending]   = useState(false);
  const [showToast, setShowToast]   = useState(false);

  // ── Generic field updater ──
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Submit handler ──
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          user_name:  formData.user_name,
          user_email: formData.user_email,
          user_phone: formData.user_phone,
          language:   formData.language,
          level:      formData.level,
          message:    formData.message,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );

      // Reset form and show success toast
      setFormData(INITIAL_FORM);
      setShowToast(true);

      // Auto-dismiss toast after 6 s
      setTimeout(() => setShowToast(false), 6000);
    } catch (error) {
      console.error('EmailJS send error:', error);
      // Could add an error toast here if needed
    } finally {
      setIsSending(false);
    }
  };

  // ── Shared input class ──
  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all focus:scale-[1.01]';

  return (
    <>
      {showToast && (
        <SuccessToast
          message={t('form_success')}
          onClose={() => setShowToast(false)}
        />
      )}

      <section id="contact" className="py-20 sm:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

            {/* ── Info Panel ── */}
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
                    <p className="text-sm text-gray-500">novaflowschool@gmail.com</p>
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

            {/* ── Contact Form ── */}
            <div ref={formRef} className="reveal-right bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 card-lift">
              <form
                id="contact-form"
                className="space-y-5"
                onSubmit={handleSubmit}
                noValidate
              >
                {/* Row: Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form_label_name')}
                    </label>
                    <input
                      id="contact-name"
                      name="user_name"
                      type="text"
                      value={formData.user_name}
                      onChange={handleChange}
                      placeholder={t('placeholder_name')}
                      className={inputClass}
                      required
                      disabled={isSending}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form_label_email')}
                    </label>
                    <input
                      id="contact-email"
                      name="user_email"
                      type="email"
                      value={formData.user_email}
                      onChange={handleChange}
                      placeholder={t('placeholder_email')}
                      className={inputClass}
                      required
                      disabled={isSending}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('form_label_phone')}
                  </label>
                  <input
                    id="contact-phone"
                    name="user_phone"
                    type="tel"
                    value={formData.user_phone}
                    onChange={handleChange}
                    placeholder={t('placeholder_phone')}
                    className={inputClass}
                    disabled={isSending}
                  />
                </div>

                {/* Row: Language + Level */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-language" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form_label_lang')}
                    </label>
                    <select
                      id="contact-language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                      required
                      disabled={isSending}
                    >
                      <option value="" disabled>{t('select_lang_placeholder')}</option>
                      <option value="English">{t('course_en_title')}</option>
                      <option value="German">{t('course_de_title')}</option>
                      <option value="Ukrainian">{t('course_ua_title')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-level" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form_label_level')}
                    </label>
                    <select
                      id="contact-level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                      required
                      disabled={isSending}
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
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('form_label_msg')}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('placeholder_msg')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none focus:scale-[1.01]"
                    required
                    disabled={isSending}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="contact-submit-btn"
                  disabled={isSending}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 group disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isSending ? (
                    <>
                      {/* Spinner */}
                      <svg
                        className="animate-spin -ml-1 mr-1 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <span>{t('form_btn')}</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
