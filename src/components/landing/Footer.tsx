'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

interface FooterProps {
  navItems?: Array<{ label: string; href: string }>;
}

export default function Footer({ navItems }: FooterProps = {}) {
  const { t } = useLanguage();
  const brandRef = useScrollReveal<HTMLDivElement>();
  const linksRef = useScrollReveal<HTMLDivElement>();
  const newsletterRef = useScrollReveal<HTMLDivElement>();

  return (
    <footer className="relative bg-gray-900 text-gray-300 overflow-x-hidden overflow-y-visible border-t border-gray-800/60">
      {/* М'яке неонове свічення на фоні для преміального вигляду */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[min(600px,90vw)] h-[300px] bg-purple-600/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 sm:gap-y-12 py-12 sm:py-16 lg:py-20">

          {/* Brand */}
          <div ref={brandRef} className="reveal-left min-w-0 lg:col-span-2 flex flex-col items-center text-center sm:items-start sm:text-left">
            <a href="#hero" className="flex items-center gap-3 mb-5 group">
              <div className="relative p-2 bg-gray-800/40 rounded-xl border border-gray-700/30 group-hover:border-purple-500/30 transition-colors duration-300 shrink-0">
                <Image
                  src="/img/logo.svg"
                  alt="NovaFlow Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 brightness-0 invert transition-transform duration-500 group-hover:rotate-[360deg]"
                />
              </div>
              <div className="flex flex-col leading-tight text-left">
                <span className="text-xl font-extrabold text-white tracking-tight -mb-0.5">NovaFlow</span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-purple-400 uppercase">
                  Language School
                </span>
              </div>
            </a>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6 sm:mb-8 break-words">
              {t('footer_desc')}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-6 sm:mb-0">
              {/* Соцмережі з покращеними ефектами */}
              {[
                { label: 'Facebook', href: '#', d: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z' },
                { label: 'Instagram', href: '#', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { label: 'Telegram', href: 'https://t.me/Novaflowschool', d: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' }
              ].map((soc, i) => (
                <a key={i} href={soc.href} target={soc.href !== '#' ? '_blank' : undefined} rel={soc.href !== '#' ? 'noopener noreferrer' : undefined} className="w-10 h-10 shrink-0 rounded-xl bg-gray-800/50 border border-gray-700/40 hover:border-purple-500 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(147,51,234,0.2)]" aria-label={soc.label}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d={soc.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* School (Акордеон на мобільних, список на десктопі) */}
          <div ref={linksRef} className="reveal min-w-0 border-b border-gray-800/60 sm:border-0 pb-4 sm:pb-0" style={{ transitionDelay: '0.1s' }}>
            <details className="sm:hidden group" open={false}>
              <summary className="list-none flex items-center justify-between font-bold text-white uppercase tracking-wider text-sm cursor-pointer select-none">
                <span>{t('footer_col_school')}</span>
                <span className="text-gray-500 transition-transform duration-300 group-open:rotate-180">▼</span>
              </summary>
              <ul className="space-y-3 mt-4 pl-1">
                {/* Рендеринг елементів меню */}
                {(navItems ?? [
                  { label: t('footer_about'), href: '#about' },
                  { label: t('footer_languages'), href: '#languages' },
                  { label: t('footer_reviews'), href: '#reviews' },
                  { label: t('footer_contact'), href: '#contact' }
                ]).map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-200 block py-1">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            {/* Десктопний вигляд (прихований на мобільних) */}
            <div className="hidden sm:block">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
                {t('footer_col_school')}
              </h4>
              <ul className="space-y-3">
                {(navItems ?? [
                  { label: t('footer_about'), href: '#about' },
                  { label: t('footer_languages'), href: '#languages' },
                  { label: t('footer_reviews'), href: '#reviews' },
                  { label: t('footer_contact'), href: '#contact' }
                ]).map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legal (Акордеон на мобільних, список на десктопі) */}
          <div className="reveal min-w-0 border-b border-gray-800/60 sm:border-0 pb-4 sm:pb-0" style={{ transitionDelay: '0.2s' }}>
            <details className="sm:hidden group" open={false}>
              <summary className="list-none flex items-center justify-between font-bold text-white uppercase tracking-wider text-sm cursor-pointer select-none">
                <span>{t('footer_col_legal')}</span>
                <span className="text-gray-500 transition-transform duration-300 group-open:rotate-180">▼</span>
              </summary>
              <ul className="space-y-3 mt-4 pl-1">
                {[
                  { labelKey: 'footer_terms', href: '#' },
                  { labelKey: 'footer_privacy', href: '#' },
                  { labelKey: 'footer_cookies', href: '#' },
                  { labelKey: 'footer_sitemap', href: '#' }
                ].map((item) => (
                  <li key={item.labelKey}>
                    <a href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors duration-200 block py-1">
                      {t(item.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            {/* Десктопний вигляд */}
            <div className="hidden sm:block">
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
          </div>

          {/* Newsletter */}
          <div ref={newsletterRef} className="reveal-right min-w-0 pt-2 sm:pt-0">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-center sm:text-left">
              {t('footer_col_newsletter')}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 text-center sm:text-left break-words">
              {t('footer_newsletter_desc')}
            </p>
            {/* Стек завжди в колонку: у вузькій колонці 5-колончастого грида
                поле+кнопка в один рядок ніколи не влазять і саме це ламало
                верстку на менших екранах. Тепер це безпечно на будь-якій ширині. */}
            <form className="flex flex-col gap-2 max-w-md mx-auto sm:mx-0" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t('newsletter_placeholder')}
                className="w-full min-w-0 px-4 py-2.5 text-sm rounded-xl bg-gray-800/60 border border-gray-700/60 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                required
              />
              <button
                type="submit"
                className="w-full px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all duration-300 shadow-md hover:shadow-purple-500/20 active:scale-98"
              >
                {t('newsletter_btn')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800/80 py-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-500">
            {t('footer_copy')}
          </p>
          <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            <li><a href="#" className="text-xs text-gray-500 hover:text-purple-400 transition-colors">{t('footer_privacy')}</a></li>
            <li><a href="#" className="text-xs text-gray-500 hover:text-purple-400 transition-colors">{t('footer_terms')}</a></li>
            <li><a href="#" className="text-xs text-gray-500 hover:text-purple-400 transition-colors">{t('footer_contact')}</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

