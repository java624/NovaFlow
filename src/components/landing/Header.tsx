'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const navItems = [
  { href: '#hero', labelKey: 'nav_home', label: 'Home' },
  { href: '#about', labelKey: 'nav_about', label: 'About us' },
  { href: '#languages', labelKey: 'nav_languages', label: 'Languages' },
  { href: '#reviews', labelKey: 'nav_reviews', label: 'Reviews' },
  { href: '#contact', labelKey: 'nav_contact', label: 'Contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'uk' | 'de');
  };

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 animate-header-slide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/img/logo.svg"
                alt="NovaFlow Logo"
                width={36}
                height={36}
                className="w-8 h-8 lg:w-9 lg:h-9"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-lg lg:text-xl font-bold text-gray-900 -mb-0.5">
                  NovaFlow
                </span>
                <span className="text-[10px] lg:text-[11px] font-semibold tracking-[0.15em] text-purple-600">
                  LANGUAGE SCHOOL
                </span>
              </div>
            </a>

            {/* Mobile & Tablet Menu Toggle */}
            <button
              className="lg:hidden relative z-50 flex flex-col gap-1.5 p-2.5 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-200"
              onClick={toggleMenu}
              aria-label="Toggle Navigation"
            >
              <span
                className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>

            {/* Desktop Navigation (lg+) */}
            <nav className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-8">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors duration-200"
                    >
                      {t(item.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Desktop Actions (lg+) */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                  aria-label="Select Language"
                >
                  <option value="en">EN</option>
                  <option value="uk">UA</option>
                  <option value="de">DE</option>
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <a
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-purple-600 px-4 py-2 transition-colors duration-200"
              >
                {t('nav_signin')}
              </a>
              <a
                href="/login"
                className="text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t('nav_cta')}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Menu (slide from right) — outside header to avoid stacking context issues */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600" />

        <div className="flex flex-col pt-20 pb-8 px-6 h-full">
          {/* Close button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close Menu"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Logo in menu */}
          <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
            <Image src="/img/logo.svg" alt="NovaFlow" width={32} height={32} className="w-8 h-8" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 -mb-0.5">NovaFlow</span>
              <span className="text-[9px] font-semibold tracking-[0.15em] text-purple-600">LANGUAGE SCHOOL</span>
            </div>
          </div>

          <nav className="flex-1">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-purple-500 transition-colors" />
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Language & Buttons */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Language:</span>
              <div className="relative">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="appearance-none bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm font-medium text-gray-700 cursor-pointer focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
                  aria-label="Select Language"
                >
                  <option value="en">EN</option>
                  <option value="uk">UA</option>
                  <option value="de">DE</option>
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <a
              href="/login"
              className="block w-full text-center text-sm font-medium text-gray-700 border-2 border-gray-200 rounded-xl px-5 py-3 hover:border-purple-300 hover:text-purple-600 transition-all duration-200"
            >
              {t('nav_signin')}
            </a>
            <a
              href="/login"
              className="block w-full text-center text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t('nav_cta')}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}