'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

export default function Teacher() {
  const { t } = useLanguage();
  const photoRef = useScrollReveal<HTMLDivElement>();
  const textRef = useScrollReveal<HTMLDivElement>();
  const stat1Ref = useScrollReveal<HTMLDivElement>();
  const stat2Ref = useScrollReveal<HTMLDivElement>();
  const stat3Ref = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Row */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Photo Column */}
          <div ref={photoRef} className="reveal-left relative flex justify-center">
            <div className="relative group">
              {/* Animated glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 rounded-2xl opacity-20 group-hover:opacity-50 blur-xl transition-all duration-700 animate-pulse-glow" />

              {/* Photo card */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent z-10" />
                <Image
                  src="/img/2022_-_Centre_Stage_EN1_4500_(52471602047)_(cropped).jpg"
                  alt="Kyrylo - NovaFlow Founder"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                />
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div ref={textRef} className="reveal-right space-y-6">
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight"
              dangerouslySetInnerHTML={{ __html: t('teacher_title') }}
            />

            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p>{t('teacher_p1')}</p>
              <p>{t('teacher_p2')}</p>
              
              <div className="relative bg-gradient-to-r from-purple-50 to-purple-50/50 border-l-4 border-purple-500 rounded-r-xl p-4 sm:p-6 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p 
                  className="text-gray-700 relative z-10"
                  dangerouslySetInnerHTML={{ 
                    __html: t('teacher_p3')
                      .replace('At NovaFlow, we do things differently.', '<strong class="font-semibold text-gray-900 block mb-1">At NovaFlow, we do things differently.</strong>')
                      .replace('У NovaFlow ми працюємо зовсім інакше.', '<strong class="font-semibold text-gray-900 block mb-1">У NovaFlow ми працюємо зовсім інакше.</strong>')
                      .replace('Bei NovaFlow machen wir die Dinge anders.', '<strong class="font-semibold text-gray-900 block mb-1">Bei NovaFlow machen wir die Dinge anders.</strong>')
                  }}
                />
              </div>
              
              <p>{t('teacher_p4')}</p>
              <p>{t('teacher_p5')}</p>
              
              <blockquote 
                className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed pt-2 border-l-4 border-purple-300 pl-4"
                dangerouslySetInnerHTML={{ __html: t('teacher_quote') }}
              />
              
              <p className="text-lg font-semibold text-purple-600 animate-gentle-float inline-block">
                {t('teacher_cta_line')}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-14 sm:my-18 border-gray-100" />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          <div ref={stat1Ref} className="reveal-scale text-center group">
            <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
              {t('stat_years')}
            </p>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {t('stat_years_label')}
            </p>
          </div>

          <div ref={stat2Ref} className="reveal-scale text-center group" style={{ transitionDelay: '0.15s' }}>
            <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
              {t('stat_students')}
            </p>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {t('stat_students_label')}
            </p>
          </div>

          <div ref={stat3Ref} className="reveal-scale text-center group" style={{ transitionDelay: '0.3s' }}>
            <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
              {t('stat_immersive')}
            </p>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {t('stat_immersive_label')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
