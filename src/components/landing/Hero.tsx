'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const bulletPoints = [
  { key: 'hero_bullet_1', text: 'Personalized learning paths' },
  { key: 'hero_bullet_2', text: 'Flexible schedules for busy lives' },
  { key: 'hero_bullet_3', text: 'Real-world speaking practice' },
  { key: 'hero_bullet_4', text: 'Fast visible progress in 30 days' },
];

export default function Hero() {
  const { t } = useLanguage();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* =========================================================================
           HERO ILLUSTRATION & premium LANG CARDS (From Vanilla CSS)
           ========================================================================= */
        .hero-illustration {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 480px;
          width: 100%;
          animation: illus-entry 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }

        @keyframes illus-entry {
          from {
            opacity: 0;
            transform: scale(0.88) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .illustration-bg-arcs {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .arc-svg {
          width: 100%;
          height: 100%;
          color: rgba(168, 85, 247, 0.12);
          filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.08));
        }

        .floating-star {
          position: absolute;
          top: 4%;
          right: 22%;
          z-index: 3;
          color: #A855F7;
          filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.55));
          animation: pulse-spin 4s ease-in-out infinite;
        }

        @keyframes pulse-spin {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.25) rotate(180deg); opacity: 1; }
        }

        .floating-cards-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }

        .lang-card {
          position: absolute;
          width: min(205px, 38vw);
          height: clamp(220px, 40vw, 285px);
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 22px;
          padding: clamp(14px, 2.5vw, 20px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(226, 232, 240, 0.9);
          transition: all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          isolation: isolate;
          box-sizing: border-box;
          z-index: 2;
          text-decoration: none;
        }

        .lang-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          background: linear-gradient(135deg, var(--card-glow-a, #A855F7), var(--card-glow-b, #7C3AED));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .lang-card:hover::before { 
          opacity: 1; 
        }

        .lang-card:hover {
          transform: scale(1.07) translateY(-10px) !important;
          box-shadow: 0 35px 70px var(--card-shadow-color, rgba(94, 7, 126, 0.22));
          z-index: 10;
        }

        .uk-card { --card-glow-a: #1d4ed8; --card-glow-b: #60a5fa; --card-shadow-color: rgba(29, 78, 216, 0.28); }
        .de-card { --card-glow-a: #dc2626; --card-glow-b: #fbbf24; --card-shadow-color: rgba(220, 38, 38, 0.22); }
        .ua-card { --card-glow-a: #0057B7; --card-glow-b: #FFD700; --card-shadow-color: rgba(0, 87, 183, 0.24); }

        .lang-card.uk-card { left: 5%; bottom: 8%; transform: rotate(-12deg); animation: float-left 6s ease-in-out infinite; }
        .lang-card.de-card { left: 35%; top: 5%; transform: rotate(5deg); animation: float-center 5.5s ease-in-out infinite; }
        .lang-card.ua-card { right: 5%; bottom: 14%; transform: rotate(12deg); animation: float-right-card 6.5s ease-in-out infinite; }

        @keyframes float-left { 0%, 100% { transform: rotate(-12deg) translateY(0); } 25% { transform: rotate(-10deg) translateY(-8px); } 50% { transform: rotate(-11deg) translateY(-14px); } 75% { transform: rotate(-9deg) translateY(-6px); } }
        @keyframes float-center { 0%, 100% { transform: rotate(5deg) translateY(0); } 25% { transform: rotate(7deg) translateY(-10px); } 50% { transform: rotate(6deg) translateY(-16px); } 75% { transform: rotate(8deg) translateY(-8px); } }
        @keyframes float-right-card { 0%, 100% { transform: rotate(12deg) translateY(0); } 25% { transform: rotate(14deg) translateY(-9px); } 50% { transform: rotate(13deg) translateY(-13px); } 75% { transform: rotate(15deg) translateY(-5px); } }
        @keyframes card-flag-pulse { 0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,0.1), 0 0 0 6px rgba(168,85,247,0.06); } 50% { box-shadow: 0 12px 32px rgba(0,0,0,0.14), 0 0 0 9px rgba(168,85,247,0.1); } }
        @keyframes wave-flow { 0% { transform: translateX(0) scaleY(1); } 25% { transform: translateX(-5px) scaleY(1.02); } 50% { transform: translateX(0) scaleY(0.98); } 75% { transform: translateX(5px) scaleY(1.01); } 100% { transform: translateX(0) scaleY(1); } }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .mini-flag-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
        }

        .card-flag-circle {
          align-self: center;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          overflow: hidden;
          margin: 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #FFFFFF;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 6px rgba(168, 85, 247, 0.06);
          transition: box-shadow 0.35s ease;
          animation: card-flag-pulse 4s ease-in-out infinite;
        }

        .lang-card:hover .card-flag-circle {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14), 0 0 0 9px rgba(168, 85, 247, 0.1);
          animation-duration: 1.5s;
        }

        .card-mock-lines {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }

        .mock-line {
          height: 6px;
          background: linear-gradient(90deg, #e2e8f0 0%, rgba(241, 245, 249, 0.4) 100%);
          border-radius: 3px;
          width: 100%;
        }

        .mock-line.short {
          width: 58%;
        }

        .mock-line.medium {
          width: 78%;
        }

        /* MEDIA QUERIES */
        @media (max-width: 992px) {
          .hero-illustration {
            height: 400px;
          }
          .lang-card.uk-card { left: 10%; bottom: 5%; }
          .lang-card.de-card { left: 38%; top: 2%; }
          .lang-card.ua-card { right: 10%; bottom: 10%; }
        }

        /* ================================================================
           MOBILE CARD ANIMATIONS  (≤600px)
           ================================================================ */

        @keyframes mobile-card-bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.4) translateY(40px);
          }
          60% {
            opacity: 1;
            transform: scale(1.08) translateY(-6px);
          }
          80% {
            transform: scale(0.96) translateY(4px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }

        @keyframes mobile-card-wobble-1 {
          0%, 100% { transform: rotate(-6deg) translateY(0); }
          25% { transform: rotate(-4deg) translateY(-4px); }
          50% { transform: rotate(-7deg) translateY(2px); }
          75% { transform: rotate(-3deg) translateY(-2px); }
        }

        @keyframes mobile-card-wobble-2 {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(2deg) translateY(-5px); }
          50% { transform: rotate(-1deg) translateY(3px); }
          75% { transform: rotate(3deg) translateY(-1px); }
        }

        @keyframes mobile-card-wobble-3 {
          0%, 100% { transform: rotate(6deg) translateY(0); }
          25% { transform: rotate(4deg) translateY(-3px); }
          50% { transform: rotate(8deg) translateY(4px); }
          75% { transform: rotate(3deg) translateY(-3px); }
        }

        @keyframes mobile-flag-pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 0 0 3px rgba(168,85,247,0.05);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 8px 20px rgba(0,0,0,0.12), 0 0 0 5px rgba(168,85,247,0.12);
            transform: scale(1.04);
          }
        }

        @media (max-width: 600px) {
          .hero-illustration {
            height: auto;
            min-height: 310px;
            align-items: flex-start;
            padding-top: 20px;
          }

          .floating-star {
            display: none !important;
          }

          .floating-cards-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            width: 100%;
            height: auto;
            padding: 10px 0;
          }

          .lang-card {
            position: relative !important;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            bottom: auto !important;
            width: 105px !important;
            height: 150px !important;
            border-radius: 14px;
            padding: 10px;
            box-shadow: 0 10px 25px rgba(94, 7, 126, 0.08);
            /* Bounce entrance staggered */
            animation: mobile-card-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }

          .lang-card.uk-card {
            transform: rotate(-6deg) translateY(10px) !important;
            animation: mobile-card-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both,
                       mobile-card-wobble-1 3.5s ease-in-out 1.0s infinite !important;
          }
          .lang-card.de-card {
            transform: rotate(0deg) !important;
            animation: mobile-card-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both,
                       mobile-card-wobble-2 3.2s ease-in-out 1.2s infinite !important;
          }
          .lang-card.ua-card {
            transform: rotate(6deg) translateY(10px) !important;
            animation: mobile-card-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both,
                       mobile-card-wobble-3 3.8s ease-in-out 1.1s infinite !important;
          }

          .card-mock-lines {
            display: none !important;
          }
          
          .lang-card .card-header {
            justify-content: center;
            width: 100%;
          }

          .mini-flag-badge {
            display: none;
          }

          .card-flag-circle {
            width: 50px !important;
            height: 50px !important;
            margin: auto;
            animation: mobile-flag-pulse 2.8s ease-in-out infinite !important;
          }
        }
      `}} />

      <section id="hero" className="relative min-h-screen pt-20 md:pt-24 overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)] py-12">
            {/* Left Content */}
            <div className="relative z-10">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
                dangerouslySetInnerHTML={{ __html: t('hero_title') }}
              />

              <ul className="mt-8 sm:mt-10 space-y-3.5">
                {bulletPoints.map((point) => (
                  <li key={point.key} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="text-base sm:text-lg text-gray-700">
                      {t(point.key)}
                    </span>
                  </li>
                ))}
              </ul>

              <button className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group">
                <span>{t('hero_cta')}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Right Illustration */}
            <div className="hero-illustration">
              {/* SVG Orbit Paths / Swirls */}
              <div className="illustration-bg-arcs">
                <svg viewBox="0 0 500 500" className="arc-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M80 320 C 120 400, 280 430, 380 380" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 8" />
                  <path d="M420 180 C 440 280, 360 410, 240 440" stroke="currentColor" strokeWidth="2" stroke-linecap="round" />
                  <path d="M120 100 C 60 180, 50 300, 110 360" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>

              {/* Floating Sparkle */}
              <div className="floating-star">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"/>
                </svg>
              </div>

              <div className="floating-cards-container">
                {/* UK English Card */}
                <Link href="/languages/english" className="lang-card uk-card">
                  <div className="card-header">
                    <span className="mock-line short"></span>
                    <div className="mini-flag-badge">
                      <svg viewBox="0 0 60 60">
                        <mask id="circle-mask-uk-mini"><circle cx="30" cy="30" r="30" fill="white" /></mask>
                        <g mask="url(#circle-mask-uk-mini)">
                          <rect width="60" height="60" fill="#00247D" />
                          <path d="M0,0 L60,60 M60,0 L0,60" stroke="#FFFFFF" strokeWidth="8" />
                          <path d="M0,0 L60,60 M60,0 L0,60" stroke="#CC0000" strokeWidth="4" />
                          <path d="M30,0 L30,60 M0,30 L60,30" stroke="#FFFFFF" strokeWidth="12" />
                          <path d="M30,0 L30,60 M0,30 L60,30" stroke="#CC0000" stroke-width="8" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="card-flag-circle">
                    <svg viewBox="0 0 60 60" width="100%" height="100%">
                      <mask id="circle-mask-uk"><circle cx="30" cy="30" r="30" fill="white" /></mask>
                      <g mask="url(#circle-mask-uk)">
                        <rect width="60" height="60" fill="#00247D" />
                        <path d="M0,0 L60,60 M60,0 L0,60" stroke="#FFFFFF" stroke-width="8" />
                        <path d="M0,0 L60,60 M60,0 L0,60" stroke="#CC0000" stroke-width="4" />
                        <path d="M30,0 L30,60 M0,30 L60,30" stroke="#FFFFFF" stroke-width="12" />
                        <path d="M30,0 L30,60 M0,30 L60,30" stroke="#CC0000" stroke-width="8" />
                      </g>
                    </svg>
                  </div>

                  <div className="card-mock-lines">
                    <span className="mock-line"></span>
                    <span className="mock-line medium"></span>
                    <span className="mock-line short"></span>
                  </div>
                </Link>

                {/* German Card */}
                <Link href="/languages/german" className="lang-card de-card">
                  <div className="card-header">
                    <span className="mock-line short"></span>
                    <div className="mini-flag-badge">
                      <svg viewBox="0 0 60 60">
                        <mask id="circle-mask-de-mini"><circle cx="30" cy="30" r="30" fill="white" /></mask>
                        <g mask="url(#circle-mask-de-mini)">
                          <rect x="0" y="0" width="60" height="20" fill="#000000" />
                          <rect x="0" y="20" width="60" height="20" fill="#DD0000" />
                          <rect x="0" y="40" width="60" height="20" fill="#FFCC00" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="card-flag-circle">
                    <svg viewBox="0 0 60 60" width="100%" height="100%">
                      <mask id="circle-mask-de"><circle cx="30" cy="30" r="30" fill="white" /></mask>
                      <g mask="url(#circle-mask-de)">
                        <rect x="0" y="0" width="60" height="20" fill="#000000" />
                        <rect x="0" y="20" width="60" height="20" fill="#DD0000" />
                        <rect x="0" y="40" width="60" height="20" fill="#FFCC00" />
                      </g>
                    </svg>
                  </div>

                  <div className="card-mock-lines">
                    <span className="mock-line"></span>
                    <span className="mock-line medium"></span>
                    <span className="mock-line short"></span>
                  </div>
                </Link>

                {/* Ukrainian Card */}
                <Link href="/languages/ukrainian" className="lang-card ua-card">
                  <div className="card-header">
                    <span className="mock-line short"></span>
                    <div className="mini-flag-badge">
                      <svg viewBox="0 0 60 60">
                        <mask id="circle-mask-ua-mini"><circle cx="30" cy="30" r="30" fill="white" /></mask>
                        <g mask="url(#circle-mask-ua-mini)">
                          <rect x="0" y="0" width="60" height="30" fill="#0057B7" />
                          <rect x="0" y="30" width="60" height="30" fill="#FFD700" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="card-flag-circle">
                    <svg viewBox="0 0 60 60" width="100%" height="100%">
                      <mask id="circle-mask-ua"><circle cx="30" cy="30" r="30" fill="white" /></mask>
                      <g mask="url(#circle-mask-ua)">
                        <rect x="0" y="0" width="60" height="30" fill="#0057B7" />
                        <rect x="0" y="30" width="60" height="30" fill="#FFD700" />
                      </g>
                    </svg>
                  </div>

                  <div className="card-mock-lines">
                    <span className="mock-line"></span>
                    <span className="mock-line medium"></span>
                    <span className="mock-line short"></span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px]"
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              className="fill-purple-50"
            />
          </svg>
        </div>
      </section>
    </>
  );
}