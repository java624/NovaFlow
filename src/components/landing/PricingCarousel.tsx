'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  rating: string;
  reviews: string;
  desc: string;
  popular: boolean;
  discount?: string;
  features: string[];
  btnText: string;
  btnPrice: string;
  btnLessons: string;
}

interface PricingCarouselProps {
  plans: PricingPlan[];
  onBuy: (plan: PricingPlan) => void;
}

export default function PricingCarousel({ plans, onBuy }: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const cardsPerView = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, plans.length - cardsPerView);

  const updateArrows = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener('scroll', updateArrows);
  }, [updateArrows, plans]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth / cardsPerView;
    const newIndex = direction === 'left'
      ? Math.max(0, scrollIndex - 1)
      : Math.min(maxIndex, scrollIndex + 1);
    setScrollIndex(newIndex);
    scrollRef.current.scrollTo({ left: newIndex * cardWidth, behavior: 'smooth' });
  };

  useEffect(() => { setScrollIndex(0); }, [plans.length]);

  const showPrev = plans.length > cardsPerView && showLeftArrow;
  const showNext = plans.length > cardsPerView && showRightArrow;
  const showDots = plans.length > cardsPerView;

  return (
    <div className="relative px-6 sm:px-8">
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-4
          [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-thumb]:rounded-full"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d8b4fe #f3f4f6' }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`snap-start shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col ${
              plan.popular
                ? 'border-purple-400 ring-2 ring-purple-500/30 shadow-xl'
                : 'border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100'
            }`}
          >
            {/* Popular badge above card content */}
            {plan.popular && (
              <div className="flex justify-center -mt-10 mb-1">
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white text-[11px] font-bold px-5 py-1.5 rounded-full shadow-md">
                  ★ Popular
                </span>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4 text-amber-400">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">{plan.rating} ({plan.reviews})</span>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">{plan.title}</h3>
            <div className="mb-3">
              <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </div>

            {plan.discount && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg px-3 py-1.5 mb-3">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 3a2 2 0 100-4h-1.5m.5 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h1.5m12.5 2h-1.5M6 7h1.5M4 9h1.5" />
                </svg>
                <span>{plan.discount}</span>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4 leading-relaxed flex-1">{plan.desc}</p>

            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onBuy(plan)}
              className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                plan.popular
                  ? 'text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-md hover:shadow-lg'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>

      {/* Arrows on left/right sides */}
      {showPrev && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center text-purple-600 hover:text-purple-700 hover:shadow-2xl hover:border-purple-300 transition-all z-20"
          aria-label="Previous"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {showNext && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center text-purple-600 hover:text-purple-700 hover:shadow-2xl hover:border-purple-300 transition-all z-20"
          aria-label="Next"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots */}
      {showDots && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: plans.length - cardsPerView + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;
                const cardWidth = scrollRef.current.clientWidth / cardsPerView;
                setScrollIndex(i);
                scrollRef.current.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
              }}
              className={`rounded-full transition-all duration-300 ${
                i === scrollIndex ? 'bg-purple-600 w-7 h-2.5' : 'bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

    </div>
  );
}