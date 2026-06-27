'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';
import { createClient } from '@/lib/supabase/client';
import { Comment } from '@/components/teacher/types';

const reviewsDataFallback = {
  en: [
    {
      name: 'Oleksandr K.',
      text: 'Excellent school! In 3 months I significantly improved my English. The teachers are professional and the materials are very interesting.',
      rating: 5,
    },
    {
      name: 'Maria V.',
      text: 'German became much clearer thanks to the individual approach. I recommend it!',
      rating: 5,
    },
    {
      name: 'Andriy S.',
      text: 'Very convenient format of study. Can be combined with work. Progress is felt after every lesson.',
      rating: 5,
    },
    {
      name: 'Olena M.',
      text: 'Started learning Ukrainian from scratch. In half a year I already speak fluently. Thanks NovaFlow!',
      rating: 5,
    },
  ],
  uk: [
    {
      name: 'Олександр К.',
      text: 'Чудова школа! За 3 місяці я значно покращив свою англійську. Викладачі професіонали, а матеріали дуже цікаві.',
      rating: 5,
    },
    {
      name: 'Марія В.',
      text: 'Німецька мова стала набагато зрозумілішою завдяки індивідуальному підходу. Рекомендую!',
      rating: 5,
    },
    {
      name: 'Андрій С.',
      text: 'Дуже зручний формат навчання. Можна поєднувати з роботою. Прогрес відчувається після кожного уроку.',
      rating: 5,
    },
    {
      name: 'Олена М.',
      text: 'Почала вивчати українську з нуля. За пів року вже вільно спілкуюся. Дякую NovaFlow!',
      rating: 5,
    },
  ],
  de: [
    {
      name: 'Oleksandr K.',
      text: 'Hervorragende Schule! In 3 Monaten habe ich mein Englisch deutlich verbessert. Die Lehrer sind professionell und die Materialien sind sehr interessant.',
      rating: 5,
    },
    {
      name: 'Maria V.',
      text: 'Deutsch wurde dank des individuellen Ansatzes viel klarer. Ich empfehle es!',
      rating: 5,
    },
    {
      name: 'Andriy S.',
      text: 'Sehr praktisches Lernformat. Kann mit der Arbeit kombiniert werden. Fortschritt ist nach jeder Lektion spürbar.',
      rating: 5,
    },
    {
      name: 'Olena M.',
      text: 'Habe angefangen, Ukrainisch von Grund auf zu lernen. In einem halben Jahr spreche ich bereits fließend. Danke NovaFlow!',
      rating: 5,
    },
  ],
};

export default function Reviews() {
  const [dbReviews, setDbReviews] = useState<Comment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form states
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { language, t } = useLanguage();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const carouselRef = useScrollReveal<HTMLDivElement>();
  const formRef = useScrollReveal<HTMLDivElement>();

  const supabase = useMemo(() => createClient(), []);

  // Fetch comments from Supabase
  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reviews:', error);
      } else if (data) {
        setDbReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [supabase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Combine DB reviews with fallback reviews
  const currentReviews = useMemo(() => {
    if (dbReviews.length > 0) {
      return dbReviews;
    }
    const fallbackList = reviewsDataFallback[language] || reviewsDataFallback.en;
    return fallbackList.map((r, i) => ({
      id: `fallback-${i}`,
      name: r.name,
      text: r.text,
      rating: r.rating,
      created_at: new Date().toISOString(),
    } as Comment));
  }, [dbReviews, language]);

  // Ensure index remains in bounds
  useEffect(() => {
    if (currentIndex >= currentReviews.length) {
      setCurrentIndex(0);
    }
  }, [currentReviews.length, currentIndex]);

  const prev = () => setCurrentIndex((i) => (i === 0 ? currentReviews.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === currentReviews.length - 1 ? 0 : i + 1));

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !text.trim()) {
      setSubmitError(language === 'uk' ? 'Будь ласка, заповніть усі поля!' : 'Please fill in all fields!');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          name: name.trim(),
          text: text.trim(),
          rating: rating
        }]);

      if (error) throw error;

      setSubmitSuccess(true);
      setName('');
      setText('');
      setRating(5);
      
      // Reload comments list
      await fetchComments();

      // Clear success notification after 4 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setSubmitError(language === 'uk'
        ? 'Помилка відправки відгуку. Спробуйте, будь ласка, пізніше.'
        : 'Failed to submit review. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentReview = currentReviews[currentIndex] || {
    name: '',
    text: '',
    rating: 5,
    teacher_reply: '',
    created_at: ''
  };

  const dateFormatted = currentReview.created_at
    ? new Date(currentReview.created_at).toLocaleDateString(
        language === 'uk' ? 'uk-UA' : language === 'de' ? 'de-DE' : 'en-US'
      )
    : '';

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    currentReview.name || 'User'
  )}&background=5E077E&color=fff&rounded=true&size=128&font-size=0.45&bold=true`;

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-gradient-to-b from-purple-50/40 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <span className="inline-block text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full mb-4">
            {t('reviews_tag')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {t('reviews_title')}
          </h2>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
            {t('reviews_desc')}
          </p>
        </div>

        {/* Carousel */}
        <div ref={carouselRef} className="reveal max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] card-lift relative">
            <div>
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6 animate-fade-in" key={currentIndex}>
                {[1, 2, 3, 4, 5].map((star, i) => (
                  <svg
                    key={star}
                    width="24"
                    height="24"
                    fill={star <= (currentReview.rating || 5) ? '#FFB020' : '#E2E8F0'}
                    viewBox="0 0 20 20"
                    className="transition-all duration-300"
                    style={{ animation: `stat-count-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s both` }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p key={`text-${currentIndex}`} className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 italic animate-section-title text-center">
                &ldquo;{currentReview.text}&rdquo;
              </p>
            </div>

            <div className="flex flex-col items-center">
              {/* User row */}
              <div className="flex items-center gap-3 mt-4 text-left">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-100 flex-shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl} alt={currentReview.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 leading-tight">
                    {currentReview.name}
                  </p>
                  {dateFormatted && (
                    <span className="text-xs text-gray-400 mt-1 block">
                      {dateFormatted}
                    </span>
                  )}
                </div>
              </div>

              {/* Teacher Reply */}
              {currentReview.teacher_reply && (
                <div className="w-full mt-6 p-4 bg-purple-50/40 border-l-4 border-purple-600 rounded-r-2xl text-left transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 text-white flex items-center justify-center font-bold text-[10px]">
                      NF
                    </div>
                    <span className="text-xs font-bold text-purple-700">
                      {language === 'uk' ? 'Кирило (Вчитель NovaFlow)' : 'Kyrylo (NovaFlow Teacher)'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 italic leading-relaxed">
                    {currentReview.teacher_reply}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:scale-110 active:scale-95 transition-all"
              aria-label="Previous Review"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {currentReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'bg-purple-600 w-6 h-2' : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:scale-110 active:scale-95 transition-all"
              aria-label="Next Review"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Comment Form */}
        <div ref={formRef} className="reveal-scale max-w-xl mx-auto mt-16 bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 card-lift">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {t('form_review_title')}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {t('form_review_desc')}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Stars Selector */}
            <div>
              <span className="text-sm text-gray-500 block mb-2">{t('form_rating_label')}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all hover:scale-125 active:scale-95"
                    disabled={isSubmitting}
                  >
                    <svg
                      width="26"
                      height="26"
                      fill={(hoverRating || rating) >= star ? '#FFB020' : '#E2E8F0'}
                      viewBox="0 0 20 20"
                      className="transition-colors duration-200"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form_name_placeholder')}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
              required
              disabled={isSubmitting}
            />

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('form_text_placeholder')}
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-none"
              required
              disabled={isSubmitting}
            />

            {submitSuccess && (
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200 animate-fade-in">
                {language === 'uk'
                  ? '🎉 Дякуємо! Ваш відгук успішно надіслано.'
                  : '🎉 Thank you! Your review has been submitted successfully.'}
              </div>
            )}
            
            {submitError && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200 animate-fade-in">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting
                ? (language === 'uk' ? 'Надсилання...' : 'Sending...')
                : t('form_submit_btn')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
