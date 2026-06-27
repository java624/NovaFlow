'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

interface CertImage {
  src: string;
  alt: string;
}

interface Cert {
  icon: React.ReactNode;
  badgeKey: string;
  badgeClass: string;
  nameKey: string;
  instKey: string;
  date: string;
  images: CertImage[];
  viewKey: string;
}

const certsList: Cert[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    badgeKey: 'cert_badge_pedagogy',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    nameKey: 'cert_tefl_name',
    instKey: 'cert_tefl_inst',
    date: 'Certified 2021',
    images: [{ src: '/img/TEFL_Certification.png', alt: 'TEFL Certification' }],
    viewKey: 'cert_view_original',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    badgeKey: 'cert_badge_instruction',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    nameKey: 'cert_celta_name',
    instKey: 'cert_celta_inst',
    date: 'Certified 2022',
    images: [{ src: '/img/Cambridge_CELTA_Certificate.jpg', alt: 'Cambridge CELTA Certificate' }],
    viewKey: 'cert_view_original',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    badgeKey: 'cert_badge_psychology',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    nameKey: 'cert_psychology_name',
    instKey: 'cert_psychology_inst',
    date: 'Certified 2024',
    images: [
      { src: '/img/cert_safe.webp', alt: 'Safeguarding Certificate' },
      { src: '/img/cert_behavior.webp', alt: 'Behaviour Management Certificate' },
      { src: '/img/cert_trauma.webp', alt: 'Trauma-Informed Practice Certificate' },
    ],
    viewKey: 'cert_view_certs_3',
  },
];

export default function Certifications() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<CertImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>();
  const authRef = useScrollReveal<HTMLDivElement>();

  const openLightbox = useCallback((images: CertImage[], index = 0) => {
    setCurrentImages(images);
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setCurrentImages([]);
    document.body.style.overflow = '';
  }, []);

  const changeImage = useCallback(
    (direction: number) => {
      setCurrentIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return currentImages.length - 1;
        if (next >= currentImages.length) return 0;
        return next;
      });
    },
    [currentImages.length]
  );

  return (
    <>
      <section className="py-20 sm:py-28 bg-gradient-to-b from-purple-50/40 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
              {t('certs_subtitle')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {t('certs_title')}
            </h2>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('certs_desc')}
            </p>
          </div>

          {/* Grid */}
          <div ref={gridRef} className="reveal-stagger grid md:grid-cols-3 gap-6 sm:gap-8">
            {certsList.map((cert) => (
              <div
                key={cert.nameKey}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-purple-100 card-lift flex flex-col"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {cert.icon}
                </div>

                {/* Badge */}
                <span
                  className={`inline-block self-start text-xs font-semibold px-3 py-1 rounded-full border ${cert.badgeClass} mb-4`}
                >
                  {t(cert.badgeKey)}
                </span>

                {/* Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex-1">
                  {t(cert.nameKey)}
                </h3>

                {/* Institution */}
                <p className="text-sm text-gray-500 mb-5">{t(cert.instKey)}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    {cert.date}
                  </span>
                  <button
                    onClick={() => openLightbox(cert.images, 0)}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors group/btn"
                  >
                    {t(cert.viewKey)}
                    <span className="inline-block ml-1 transition-transform duration-200 group-hover/btn:translate-x-1">&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Authenticity Bar */}
          <div ref={authRef} className="reveal mt-14 sm:mt-18 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm card-lift">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t('auth_verified_title')}</h4>
                  <p className="text-sm text-gray-500">{t('auth_verified_desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm">
                <span className="text-gray-400 font-serif tracking-tight animate-breathe" style={{ animationDuration: '3s' }}>UNIVERSITY <span className="font-sans font-light">OF</span> LONDON</span>
                <span className="text-gray-400 font-bold tracking-wider animate-breathe" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>CAMBRIDGE</span>
                <span className="text-gray-400 italic font-serif animate-breathe" style={{ animationDuration: '4s', animationDelay: '1s' }}>British Council</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && currentImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-2xl transition-colors"
            >
              &times;
            </button>

            {/* Previous arrow */}
            {currentImages.length > 1 && (
              <button
                onClick={() => changeImage(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-xl transition-colors"
              >
                &#10094;
              </button>
            )}

            {/* Image */}
            <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/10]">
              <Image
                src={currentImages[currentIndex].src}
                alt={currentImages[currentIndex].alt}
                fill
                className="object-contain p-4 sm:p-6"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>

            {/* Next arrow */}
            {currentImages.length > 1 && (
              <button
                onClick={() => changeImage(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-xl transition-colors"
              >
                &#10095;
              </button>
            )}

            {/* Dots */}
            {currentImages.length > 1 && (
              <div className="flex justify-center gap-2 pb-4">
                {currentImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? 'bg-purple-600 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}