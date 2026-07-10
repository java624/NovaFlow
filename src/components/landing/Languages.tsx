'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

const coursesList = [
  {
    id: 'en',
    titleKey: 'course_en_title',
    descKey: 'course_en_desc',
    levelsKey: 'course_levels_all',
    lessonsKey: 'course_lessons_25',
    href: '/languages/english',
    flag: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <mask id="circle-mask-uk-course"><circle cx="30" cy="30" r="30" fill="white" /></mask>
        <g mask="url(#circle-mask-uk-course)">
          <rect width="60" height="60" fill="#00247D" />
          <path d="M0,0 L60,60 M60,0 L0,60" stroke="#FFFFFF" strokeWidth="8" />
          <path d="M0,0 L60,60 M60,0 L0,60" stroke="#CC0000" strokeWidth="4" />
          <path d="M30,0 L30,60 M0,30 L60,30" stroke="#FFFFFF" strokeWidth="12" />
          <path d="M30,0 L30,60 M0,30 L60,30" stroke="#CC0000" strokeWidth="8" />
        </g>
      </svg>
    ),
  },
  {
    id: 'de',
    titleKey: 'course_de_title',
    descKey: 'course_de_desc',
    levelsKey: 'course_levels_de',
    lessonsKey: 'course_lessons_30',
    href: '/languages/german',
    flag: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <mask id="circle-mask-de-course"><circle cx="30" cy="30" r="30" fill="white" /></mask>
        <g mask="url(#circle-mask-de-course)">
          <rect x="0" y="0" width="60" height="20" fill="#000000" />
          <rect x="0" y="20" width="60" height="20" fill="#DD0000" />
          <rect x="0" y="40" width="60" height="20" fill="#FFCC00" />
        </g>
      </svg>
    ),
  },
  {
    id: 'ua',
    titleKey: 'course_ua_title',
    descKey: 'course_ua_desc',
    levelsKey: 'course_levels_ua',
    lessonsKey: 'course_lessons_35',
    href: '/languages/ukrainian',
    flag: (
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <mask id="circle-mask-ua-course"><circle cx="30" cy="30" r="30" fill="white" /></mask>
        <g mask="url(#circle-mask-ua-course)">
          <rect x="0" y="0" width="60" height="30" fill="#0057B7" />
          <rect x="0" y="30" width="60" height="30" fill="#FFD700" />
        </g>
      </svg>
    ),
  },
];

export default function Languages() {
  const { t } = useLanguage();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="languages" className="py-20 sm:py-28 bg-gradient-to-b from-white to-purple-50/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="inline-block text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-600 bg-purple-100/60 px-4 py-1.5 rounded-full mb-4 shadow-sm">
            {t('lang_tag')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            {t('lang_title')}
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {t('lang_desc')}
          </p>
        </div>

        {/* Course Grid */}
        <div ref={gridRef} className="reveal-stagger grid md:grid-cols-3 gap-8">
          {coursesList.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 hover:border-purple-200 transition-all duration-300 flex flex-col h-full active:scale-[0.99]"
            >
              {/* Flag Header */}
              <div className="relative h-36 sm:h-44 bg-gradient-to-br from-purple-50/60 via-purple-100/40 to-white flex items-center justify-center overflow-hidden border-b border-gray-50">
                {/* Анімований фон при ховері */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Круглий прапор з ефектом 3D-оберту та відблиском */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md z-10 transition-all duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(360deg)] group-hover:shadow-xl">
                  
                  {/* Ефект блиску, який пробігає по прапору завдяки анімації з tailwind.config.js */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
                  
                  {/* Контейнер самого прапора, що ховає зворотну сторону під час перевороту */}
                  <div className="w-full h-full [backface-visibility:hidden]">
                    {course.flag}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-200">
                  {t(course.titleKey)}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 flex-1">
                  {t(course.descKey)}
                </p>

                {/* Meta Tags */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-purple-500" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{t(course.levelsKey)}</span>
                  </div>
                  
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-purple-500" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t(course.lessonsKey)}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href={course.href}
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-purple-600 group/btn transition-all duration-200 hover:text-purple-700 bg-purple-50 hover:bg-purple-100/70 py-3 px-4 rounded-xl text-center"
                >
                  <span>{t('explore_course')}</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-200 transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}