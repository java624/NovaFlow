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
    <section className="relative py-16 sm:py-28 bg-white overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes teacherFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .teacher-photo-float {
          animation: teacherFloat 6s ease-in-out infinite;
        }

        @keyframes teacherFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .teacher-fade-p {
          opacity: 0;
          animation: teacherFadeUp 0.7s ease-out forwards;
        }

        @keyframes teacherStatPop {
          0% { opacity: 0; transform: scale(0.85) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .teacher-stat {
          animation: teacherStatPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .teacher-quote-mark {
          position: absolute;
          top: -0.35em;
          left: -0.15em;
          font-size: 4.5rem;
          line-height: 1;
          color: rgba(168, 85, 247, 0.15);
          font-family: Georgia, serif;
          pointer-events: none;
          user-select: none;
        }

        .teacher-photo-wrap {
          position: relative;
        }

        /* Gradient-ring "frame" around the photo, via padding trick */
        .teacher-photo-ring {
          position: relative;
          z-index: 1;
          padding: 4px;
          border-radius: 1.75rem;
          background: linear-gradient(135deg, #A855F7, #EC4899 50%, #7C3AED 100%);
        }

        .teacher-photo-inner {
          border-radius: 1.5rem;
          overflow: hidden;
          background: white;
        }

        /* Small accent dot cluster, sits outside the frame, doesn't overlap it */
        .teacher-dot-grid {
          position: absolute;
          bottom: -20px;
          right: -20px;
          width: 64px;
          height: 64px;
          background-image: radial-gradient(rgba(168, 85, 247, 0.3) 1.6px, transparent 1.6px);
          background-size: 12px 12px;
          z-index: 0;
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .teacher-dot-grid { width: 44px; height: 44px; bottom: -12px; right: -12px; }
        }
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .teacher-highlight-box:hover {
          transform: translateX(2px);
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.12);
        }

        @media (prefers-reduced-motion: reduce) {
          .teacher-photo-float,
          .teacher-fade-p,
          .teacher-stat {
            animation: none !important;
          }
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Row */}
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
          {/* Photo Column */}
          <div ref={photoRef} className="reveal-left relative flex justify-center">
            <div className="relative group teacher-photo-float teacher-photo-wrap w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
              {/* Soft ambient glow */}
              <div className="absolute -inset-3 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 rounded-[2rem] opacity-20 group-hover:opacity-35 blur-2xl transition-all duration-700 animate-pulse-glow" />

              {/* Small accent dot cluster, bottom-right */}
              <div className="teacher-dot-grid" />

              {/* Gradient-ring frame */}
              <div className="teacher-photo-ring w-full h-full shadow-xl shadow-purple-900/15">
                <div className="teacher-photo-inner relative w-full h-full">
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
          </div>

          {/* Text Column */}
          <div ref={textRef} className="reveal-right space-y-6 min-w-0 w-full max-w-full text-center lg:text-left">
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight break-words hyphens-auto w-full max-w-full"
              dangerouslySetInnerHTML={{ __html: t('teacher_title') }}
            />

            <div className="space-y-5 text-gray-700 leading-relaxed text-left">
              <p className="teacher-fade-p" style={{ animationDelay: '0.05s' }}>{t('teacher_p1')}</p>
              <p className="teacher-fade-p" style={{ animationDelay: '0.15s' }}>{t('teacher_p2')}</p>
              
              <div className="teacher-highlight-box relative bg-gradient-to-r from-purple-50 to-purple-50/50 border-l-4 border-purple-500 rounded-r-xl p-4 sm:p-6 overflow-hidden group teacher-fade-p" style={{ animationDelay: '0.25s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p 
                  className="text-gray-700 relative z-10 break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: t('teacher_p3')
                      .replace('At NovaFlow, we do things differently.', '<strong class="font-semibold text-gray-900 block mb-1">At NovaFlow, we do things differently.</strong>')
                      .replace('У NovaFlow ми працюємо зовсім інакше.', '<strong class="font-semibold text-gray-900 block mb-1">У NovaFlow ми працюємо зовсім інакше.</strong>')
                      .replace('Bei NovaFlow machen wir die Dinge anders.', '<strong class="font-semibold text-gray-900 block mb-1">Bei NovaFlow machen wir die Dinge anders.</strong>')
                  }}
                />
              </div>
              
              <p className="teacher-fade-p" style={{ animationDelay: '0.35s' }}>{t('teacher_p4')}</p>
              <p className="teacher-fade-p" style={{ animationDelay: '0.45s' }}>{t('teacher_p5')}</p>
              
              <blockquote 
                className="teacher-fade-p relative text-lg sm:text-xl font-bold text-gray-900 leading-relaxed pt-2 pl-4 border-l-4 border-purple-300 break-words"
                style={{ animationDelay: '0.55s' }}
              >
                <span className="teacher-quote-mark">&ldquo;</span>
                <span
                  className="relative"
                  dangerouslySetInnerHTML={{ __html: t('teacher_quote') }}
                />
              </blockquote>
              
              <p className="teacher-fade-p text-lg font-semibold text-purple-600 animate-gentle-float inline-block" style={{ animationDelay: '0.65s' }}>
                {t('teacher_cta_line')}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-12 sm:my-18 border-gray-100" />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          <div ref={stat1Ref} className="reveal-scale teacher-stat text-center group">
            <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
              {t('stat_years')}
            </p>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {t('stat_years_label')}
            </p>
          </div>

          <div ref={stat2Ref} className="reveal-scale teacher-stat text-center group" style={{ transitionDelay: '0.15s', animationDelay: '0.1s' }}>
            <p className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
              {t('stat_students')}
            </p>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {t('stat_students_label')}
            </p>
          </div>

          <div ref={stat3Ref} className="reveal-scale teacher-stat text-center group" style={{ transitionDelay: '0.3s', animationDelay: '0.2s' }}>
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
