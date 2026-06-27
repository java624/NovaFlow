'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

export default function LevelTest() {
  const { t } = useLanguage();
  const contentRef = useScrollReveal<HTMLDivElement>();
  const visualRef = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-purple-50/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 group">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Content */}
            <div ref={contentRef} className="reveal-left p-8 sm:p-12 lg:p-16">
              <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4 group-hover:animate-shimmer">
                {t('level_test_tag')}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
                {t('level_test_title')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {t('level_test_desc')}
              </p>

              {/* Features */}
              <div className="space-y-3 mb-10">
                {[
                  t('level_test_feat1'),
                  t('level_test_feat2'),
                  t('level_test_feat3'),
                ].map((feat, i) => (
                  <div key={feat} className="flex items-center gap-3 group/feat" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-purple-600 flex-shrink-0 group-hover/feat:scale-110 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-base text-gray-700">{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="https://testizer.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group/btn hover:scale-105"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
                <span>{t('level_test_btn_text')}</span>
              </a>
            </div>

            {/* Illustration */}
            <div ref={visualRef} className="reveal-right relative bg-gradient-to-br from-purple-600 to-purple-400 p-8 sm:p-12 lg:p-16 flex items-center justify-center min-h-[300px]">
              {/* Glow */}
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />

              {/* Shield Card */}
              <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center animate-gentle-float">
                <svg className="w-16 h-16 mx-auto mb-4 text-white/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="block text-lg font-bold text-white">CEFR Level</span>
              </div>

              {/* Floating badges */}
              <span className="absolute top-8 left-8 z-10 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 animate-flag-glow">
                A1
              </span>
              <span className="absolute top-1/2 right-8 z-10 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 animate-flag-glow" style={{ animationDelay: '1s' }}>
                B2
              </span>
              <span className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 animate-flag-glow" style={{ animationDelay: '2s' }}>
                C1
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
