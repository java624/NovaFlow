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
    <section id="languages" className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
            {t('lang_tag')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {t('lang_title')}
          </h2>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
            {t('lang_desc')}
          </p>
        </div>

        {/* Course Grid */}
        <div ref={gridRef} className="reveal-stagger grid md:grid-cols-3 gap-6 sm:gap-8">
          {coursesList.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-purple-100 card-lift"
            >
              {/* Flag Header */}
              <div className="relative h-32 sm:h-40 bg-gradient-to-br from-purple-50 to-purple-100/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg animate-breathe">
                  {course.flag}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(course.titleKey)}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed mb-6">
                  {t(course.descKey)}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{t(course.levelsKey)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t(course.lessonsKey)}</span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={course.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 group/btn transition-colors"
                >
                  <span>{t('explore_course')}</span>
                  <span className="transition-transform duration-200 group-hover/btn:translate-x-1">&rarr;</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
