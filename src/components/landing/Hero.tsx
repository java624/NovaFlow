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

        /* Gradient headline treatment */
        .hero-title {
          background: linear-gradient(100deg, #1e1b2e 0%, #6d28d9 32%, #a855f7 50%, #6d28d9 68%, #1e1b2e 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: drop-shadow(0 2px 24px rgba(168, 85, 247, 0.18));
          animation: hero-title-shine 7s ease-in-out infinite;
        }

        @keyframes hero-title-shine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* CTA button shine */
        .hero-cta {
          background-size: 200% 200%;
          animation: hero-cta-shine 3.5s linear infinite;
        }

        @keyframes hero-cta-shine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* Bullet stagger reveal */
        .hero-bullet {
          opacity: 0;
          animation: hero-bullet-in 0.6s ease-out forwards;
        }

        @keyframes hero-bullet-in {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Wave divider: seamless looping drift + rising bubbles */
        .wave-divider {
          height: 110px;
        }

        .wave-layer {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .wave-layer-front {
          animation-name: wave-drift;
          animation-duration: 16s;
        }

        .wave-layer-back {
          animation-name: wave-drift-reverse;
          animation-duration: 22s;
        }

        @keyframes wave-drift {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes wave-drift-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        .wave-bubble {
          position: absolute;
          bottom: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(168, 85, 247, 0.45));
          box-shadow: 0 0 6px rgba(168, 85, 247, 0.3);
          animation: wave-bubble-rise 6s ease-in infinite;
        }

        .wave-bubble-1 { left: 12%; width: 7px; height: 7px; animation-delay: 0s; animation-duration: 5.5s; }
        .wave-bubble-2 { left: 30%; width: 10px; height: 10px; animation-delay: 1.4s; animation-duration: 7s; }
        .wave-bubble-3 { left: 52%; width: 6px; height: 6px; animation-delay: 2.6s; animation-duration: 5s; }
        .wave-bubble-4 { left: 71%; width: 9px; height: 9px; animation-delay: 0.8s; animation-duration: 6.5s; }
        .wave-bubble-5 { left: 88%; width: 7px; height: 7px; animation-delay: 3.2s; animation-duration: 6s; }

        @keyframes wave-bubble-rise {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          15% { opacity: 0.85; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-90px) scale(1.1); opacity: 0; }
        }

        @media (max-width: 600px) {
          .wave-divider { height: 50px; }
          .wave-bubble { display: none; }
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

        @keyframes mobile-glow-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.15); }
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

          /* Soft ambient glow behind the mobile card row for extra depth */
          .illustration-bg-arcs::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 280px;
            height: 280px;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(168, 85, 247, 0) 70%);
            animation: mobile-glow-pulse 4s ease-in-out infinite;
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
            box-shadow: 0 12px 26px var(--card-shadow-color, rgba(94, 7, 126, 0.14));
            /* Bounce entrance staggered */
            animation: mobile-card-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }

          .lang-card:active {
            transform: scale(0.95) !important;
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

        @media (prefers-reduced-motion: reduce) {
          .hero-illustration,
          .floating-star,
          .lang-card,
          .card-flag-circle,
          .hero-title,
          .hero-cta,
          .hero-bullet,
          .wave-layer,
          .wave-bubble,
          .illustration-bg-arcs::after {
            animation: none !important;
          }
        }
      `}} />

      <section id="hero" className="relative min-h-screen pt-20 md:pt-24 overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[calc(100vh-8rem)] py-10 sm:py-12">
            {/* Left Content */}
            <div className="relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start min-w-0 w-full max-w-full">
              <h1 
                className="hero-title text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] sm:leading-[1.05] tracking-tight break-words hyphens-auto w-full max-w-full"
                dangerouslySetInnerHTML={{ __html: t('hero_title') }}
              />

              <ul className="mt-8 sm:mt-10 space-y-4 sm:space-y-3.5 w-full max-w-sm sm:max-w-md lg:max-w-none">
                {bulletPoints.map((point, idx) => (
                  <li
                    key={point.key}
                    className="hero-bullet flex items-start gap-3 text-left"
                    style={{ animationDelay: `${0.15 + idx * 0.1}s` }}
                  >
                    <span className="flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 mt-0.5 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-sm shadow-purple-300/50">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="text-[15px] sm:text-lg text-gray-700">
                      {t(point.key)}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="hero-cta mt-10 w-full sm:w-auto justify-center inline-flex items-center gap-2 px-8 py-4 sm:py-3.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 hover:shadow-purple-400/40 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group active:scale-95"
              >
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
              </a>
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
        <div className="wave-divider absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          {/* Floating bubbles rising through the wave for a bit of playful life */}
          <span className="wave-bubble wave-bubble-1" />
          <span className="wave-bubble wave-bubble-2" />
          <span className="wave-bubble wave-bubble-3" />
          <span className="wave-bubble wave-bubble-4" />
          <span className="wave-bubble wave-bubble-5" />

          {/* Back layer: softer, larger, slower drift for depth */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2400 200"
            preserveAspectRatio="none"
            className="wave-layer wave-layer-back absolute bottom-0 left-0 block w-[200%] h-full"
          >
            <path
              d="M0,110 C200,50 400,50 600,110 C800,170 1000,170 1200,110 C1400,50 1600,50 1800,110 C2000,170 2200,170 2400,110 L2400,200 L0,200 Z"
              className="fill-purple-100/60"
            />
          </svg>

          {/* Front layer: smooth seamless looping wave */}
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2400 200"
            preserveAspectRatio="none"
            className="wave-layer wave-layer-front relative block w-[200%] h-full"
          >
            <path
              d="M0,130 C200,180 400,180 600,130 C800,80 1000,80 1200,130 C1400,180 1600,180 1800,130 C2000,80 2200,80 2400,130 L2400,200 L0,200 Z"
              className="fill-purple-50"
            />
          </svg>
        </div>
      </section>
    </>
  );
}
