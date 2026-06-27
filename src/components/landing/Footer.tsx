'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

export default function Footer() {
  const { t } = useLanguage();
  const brandRef = useScrollReveal<HTMLDivElement>();
  const linksRef = useScrollReveal<HTMLDivElement>();
  const newsletterRef = useScrollReveal<HTMLDivElement>();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 py-16 lg:py-20">
          {/* Brand */}
          <div ref={brandRef} className="reveal-left lg:col-span-2">
            <a href="#hero" className="flex items-center gap-3 mb-4 group">
              <Image
                src="/img/logo.svg"
                alt="NovaFlow Logo"
                width={40}
                height={40}
                className="w-10 h-10 brightness-0 invert transition-transform duration-300 group-hover:scale-110"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold text-white -mb-0.5">NovaFlow</span>
                <span className="text-[10px] font-semibold tracking-[0.15em] text-purple-400">
                  LANGUAGE SCHOOL
                </span>
              </div>
            </a>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              {t('footer_desc')}
            </p>
            <div className="flex gap-3">
              {/* Social links with hover animation */}
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25" aria-label="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25" aria-label="Instagram">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25" aria-label="LinkedIn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* School */}
          <div ref={linksRef} className="reveal" style={{ transitionDelay: '0.1s' }}>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              {t('footer_col_school')}
            </h4>
            <ul className="space-y-3">
              {[
                { labelKey: 'footer_about', href: '#about' },
                { labelKey: 'footer_languages', href: '#languages' },
                { labelKey: 'footer_reviews', href: '#reviews' },
                { labelKey: 'footer_contact', href: '#contact' }
              ].map((item) => (
                <li key={item.labelKey}>
                  <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="reveal" style={{ transitionDelay: '0.2s' }}>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              {t('footer_col_legal')}
            </h4>
            <ul className="space-y-3">
              {[
                { labelKey: 'footer_terms', href: '#' },
                { labelKey: 'footer_privacy', href: '#' },
                { labelKey: 'footer_cookies', href: '#' },
                { labelKey: 'footer_sitemap', href: '#' }
              ].map((item) => (
                <li key={item.labelKey}>
                  <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div ref={newsletterRef} className="reveal-right">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              {t('footer_col_newsletter')}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {t('footer_newsletter_desc')}
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t('newsletter_placeholder')}
                className="flex-1 px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all focus:scale-[1.02]"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {t('newsletter_btn')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {t('footer_copy')}
          </p>
          <ul className="flex items-center gap-6">
            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-all hover:translate-x-0.5 inline-block">{t('footer_privacy')}</a></li>
            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-all hover:translate-x-0.5 inline-block">{t('footer_terms')}</a></li>
            <li><a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-all hover:translate-x-0.5 inline-block">{t('footer_contact')}</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
