'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

const featuresList = [
  {
    key: 'personalized',
    titleKey: 'feature_personalized_title',
    descKey: 'feature_personalized_desc',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 16v6" /><path d="M16 19h6" />
      </svg>
    ),
  },
  {
    key: 'flexible',
    titleKey: 'feature_flexible_title',
    descKey: 'feature_flexible_desc',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'speaking',
    titleKey: 'feature_speaking_title',
    descKey: 'feature_speaking_desc',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'progress',
    titleKey: 'feature_progress_title',
    descKey: 'feature_progress_desc',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

export default function Features() {
  const { t } = useLanguage();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="about" className="py-20 sm:py-28 bg-gradient-to-b from-white to-purple-50/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {t('about_title')}
          </h2>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
            {t('about_desc')}
          </p>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="reveal-stagger grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuresList.map((feature) => (
            <div
              key={feature.key}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-purple-100 card-lift"
            >
              {/* Animated bg gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Shimmer line on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-0" style={{ transition: 'opacity 0.5s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />

              <div className="relative z-10">
                {/* Icon - pulsing glow */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {t(feature.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-base text-gray-600 leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
