// =========================================================================
// Глобальна ініціалізація Supabase (з безпечною перевіркою CDN)
// =========================================================================
let supabaseClient = null;
try {
  if (typeof supabase !== 'undefined') {
    const SUPABASE_URL = "https://vagrglarsxjtnsusyonv.supabase.co";
    const SUPABASE_KEY = "sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK";
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase успішно ініціалізовано.");
  } else {
    console.warn("Попередження: Бібліотеку 'supabase' не знайдено. Відгуки з бази не завантажаться, але інтерфейс сайту працюватиме!");
  }
} catch (err) {
  console.error("Критична помилка ініціалізації Supabase:", err);
}

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Header Scroll Effect
  // =========================================================================
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // =========================================================================
  // 2. Mobile Menu Toggle & Drawer Overlay
  // =========================================================================
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');

  if (menuToggle && navMenu) {
    // Keep reference to original parent (inside header) for desktop layout
    const originalParent = navMenu.parentNode;
    let menuMoved = false;

    const toggleMenu = (forceState) => {
      const isActive = forceState !== undefined ? forceState : !menuToggle.classList.contains('active');

      // On mobile (<=1024px), move navMenu to document.body to break out of header's stacking context
      // This fixes the transparent/invisible drawer issue
      if (window.innerWidth <= 1024) {
        if (isActive && !menuMoved) {
          document.body.appendChild(navMenu);
          menuMoved = true;
        } else if (!isActive && menuMoved) {
          if (originalParent) originalParent.appendChild(navMenu);
          menuMoved = false;
        }
      }

      menuToggle.classList.toggle('active', isActive);
      navMenu.classList.toggle('active', isActive);
      if (navOverlay) navOverlay.classList.toggle('active', isActive);

      // Prevent body scrolling when mobile menu is open
      document.body.style.overflow = isActive ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', () => toggleMenu());

    if (navOverlay) {
      navOverlay.addEventListener('click', () => toggleMenu(false));
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Clean up on resize from mobile to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && menuMoved) {
        if (originalParent) originalParent.appendChild(navMenu);
        menuMoved = false;
        navMenu.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // =========================================================================
  // 3. Active Link Indication on Scroll (Intersection Observer)
  // =========================================================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // =========================================================================
  // 4. Interactive Language Lab (Phrase Simulator & Voice Synthesis)
  // =========================================================================
  const phrases = {
    en: [
      { text: "Hello, how are you today?", trans: "Привіт, як твої справи сьогодні?", pron: "[həˈloʊ, haʊ ɑːr juː təˈdeɪ]", voice: "en-US" },
      { text: "Building fluent conversation requires daily practice.", trans: "Побудова вільної розмови вимагає щоденної практики.", pron: "[ˈbɪldɪŋ ˈfluːənt ˌkɑːnvərˈseɪʃn rɪˈkwaɪərz ˈdeɪli ˈpræktɪs]", voice: "en-GB" },
      { text: "I would like to improve my speaking skills.", trans: "Я хотів би покращити свої навички розмовної мови.", pron: "[aɪ wʊd laɪk tuː ɪmˈpruːv maɪ ˈspiːkіŋ skіlz]", voice: "en-US" },
      { text: "Learning a new language opens up incredible opportunities.", trans: "Вивчення нової мови відкриває неймовірні можливості.", pron: "[ˈlɜːrnɪŋ ə nuː ˈlæŋɡwɪdʒ ˈoʊpənz ʌp ɪnˈkrɛdəbəl ˌɒpərˈtjuːnətiz]", voice: "en-US" }
    ],
    de: [
      { text: "Hallo, wie geht es dir heute?", trans: "Привіт, як справи сьогодні?", pron: "[ˈhaloː viː ɡeːt ʔɛs diːɐ̯ ˈhɔʏtə]", voice: "de-DE" },
      { text: "Deutsch lernen macht großen Spaß!", trans: "Вчити німецьку - це велике задоволення!", pron: "[dɔʏtʃ ˈlɛrnən maxt ˈɡʁoːsn̩ ʃpaːs]", voice: "de-DE" },
      { text: "Ich möchte fließend Deutsch sprechen lernen.", trans: "Я хочу навчитися вільно розмовляти німецькою.", pron: "[ʔɪç ˈmœçtə ˈfliːsn̩t dɔʏtʃ ˈʃpʁɛçn̩ ˈlɛrnən]", voice: "de-DE" },
      { text: "Übung macht den Meister.", trans: "Практика творить майстра (Повторення - мати навчання).", pron: "[ˈyːbʊŋ maxt deːn ˈmaɪ̯stɐ]", voice: "de-DE" }
    ],
    uk: [
      { text: "Привіт, радий познайомитися!", trans: "Hello, nice to meet you!", pron: "[Pry-vit, ra-dyi poz-na-yo-my-ty-sya]", voice: "uk-UA" },
      { text: "Українська мова неймовірно милозвучна.", trans: "Ukrainian language is incredibly melodic.", pron: "[U-kra-yin-ska mo-va ney-mov-yr-no my-lo-zvuch-na]", voice: "uk-UA" },
      { text: "Я люблю вчити іноземні мови.", trans: "I love learning foreign languages.", pron: "[Ya lyu-blyu vchy-ty i-no-zem-ni mo-vy]", voice: "uk-UA" },
      { text: "Шлях здолає той, хто йде.", trans: "The journey is conquered by the one who walks.", pron: "[Shlyakh zdo-laye toy, khto yde]", voice: "uk-UA" }
    ]
  };

  let activeLang = 'en';
  let phraseIndices = { en: 0, de: 0, uk: 0 };

  const tabBtns = document.querySelectorAll('.widget-tab-btn');
  const phraseOrig = document.getElementById('phrase-orig');
  const phraseTrans = document.getElementById('phrase-trans');
  const phrasePron = document.getElementById('phrase-pron');
  const playBtn = document.getElementById('play-phrase-btn');
  const nextPhraseBtn = document.getElementById('next-phrase-btn');

  if (phraseOrig && playBtn && nextPhraseBtn) {
    function renderPhrase() {
      const list = phrases[activeLang];
      const index = phraseIndices[activeLang];
      const current = list[index];

      phraseOrig.textContent = current.text;
      phraseTrans.textContent = current.trans;
      phrasePron.textContent = current.pron;
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLang = btn.getAttribute('data-lang');
        renderPhrase();
      });
    });

    window.addEventListener('novaflowLangChanged', (e) => {
      const lang = e.detail.lang;
      const targetTab = Array.from(tabBtns).find(btn => btn.getAttribute('data-lang') === lang);
      if (targetTab) {
        tabBtns.forEach(b => b.classList.remove('active'));
        targetTab.classList.add('active');
        activeLang = lang;
        renderPhrase();
      }
    });

    nextPhraseBtn.addEventListener('click', () => {
      const list = phrases[activeLang];
      phraseIndices[activeLang] = (phraseIndices[activeLang] + 1) % list.length;
      renderPhrase();
    });

    playBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const textToSpeak = phraseOrig.textContent;
        const currentList = phrases[activeLang];
        const currentIndex = phraseIndices[activeLang];
        const langCode = currentList[currentIndex].voice;

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = langCode;

        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(langCode.substring(0, 2)));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.rate = 0.85;
        playBtn.style.transform = 'scale(0.95)';
        setTimeout(() => playBtn.style.transform = 'none', 100);

        window.speechSynthesis.speak(utterance);
      } else {
        alert("Sorry, your browser does not support text-to-speech synthesis.");
      }
    });
  }

  // =========================================================================
  // 5. Placement Quiz Modal Onboarding
  // =========================================================================
  const quizModal = document.getElementById('quiz-modal');
  const modalClose = document.getElementById('modal-close');
  const quizTriggers = document.querySelectorAll('.quiz-trigger');
  const quizSteps = document.querySelectorAll('.quiz-step');
  const quizOptBtns = document.querySelectorAll('.quiz-opt-btn');
  const quizConfirmBtn = document.getElementById('quiz-confirm-btn');

  const quizResultBadge = document.getElementById('quiz-result-badge');
  const quizSummaryBold = document.getElementById('quiz-summary-bold');
  const quizGoalBold = document.getElementById('quiz-goal-bold');
  const quizTimeBold = document.getElementById('quiz-time-bold');

  if (quizModal && quizSteps.length > 0) {
    let quizData = { language: 'English', goal: 'Career Development', commitment: '30 minutes' };

    function openQuiz(e) {
      if (e) e.preventDefault();
      quizModal.classList.add('active');
      goToQuizStep(1);
      document.body.style.overflow = 'hidden';
    }

    function closeQuiz() {
      quizModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    function goToQuizStep(stepNum) {
      quizSteps.forEach(step => {
        if (parseInt(step.getAttribute('data-step')) === stepNum) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    }

    quizTriggers.forEach(btn => btn.addEventListener('click', openQuiz));
    if (modalClose) modalClose.addEventListener('click', closeQuiz);
    quizModal.addEventListener('click', (e) => { if (e.target === quizModal) closeQuiz(); });

    quizOptBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const step = btn.closest('.quiz-step');
        const stepNum = parseInt(step.getAttribute('data-step'));
        const val = btn.getAttribute('data-val') || btn.querySelector('span').textContent;

        step.querySelectorAll('.quiz-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (stepNum === 1) quizData.language = val.replace(" Course", "");
        else if (stepNum === 2) quizData.goal = val;
        else if (stepNum === 3) quizData.commitment = val.split(" - ")[0];

        setTimeout(() => {
          if (stepNum < 3) {
            goToQuizStep(stepNum + 1);
          } else {
            renderQuizResults();
            goToQuizStep(4);
          }
        }, 300);
      });
    });

    function renderQuizResults() {
      const intensity = quizData.commitment.includes("15") ? "Light Flow" : quizData.commitment.includes("30") ? "Active Flow" : "Intensive Immersion";
      if (quizResultBadge) quizResultBadge.textContent = `${quizData.language} ${intensity}`;
      if (quizSummaryBold) quizSummaryBold.textContent = quizData.language;
      if (quizGoalBold) quizGoalBold.textContent = quizData.goal.toLowerCase();
      if (quizTimeBold) quizTimeBold.textContent = quizData.commitment;
    }

    if (quizConfirmBtn) {
      quizConfirmBtn.addEventListener('click', () => {
        closeQuiz();
        const langSelect = document.getElementById('form-lang');
        if (langSelect) {
          for (let option of langSelect.options) {
            if (option.value.toLowerCase() === quizData.language.toLowerCase()) {
              option.selected = true;
              break;
            }
          }
        }
        const goalText = document.getElementById('form-message');
        if (goalText) {
          goalText.value = `Hi NovaFlow! I just took the onboarding quiz. I want to learn ${quizData.language} for my ${quizData.goal.toLowerCase()} allocating ${quizData.commitment} daily.`;
        }
        const contactSection = document.getElementById('contact');
        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // =========================================================================
  // 6. Contact Consultation Form Handling
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.form-btn');
      if (!btn) return;

      const originalText = btn.innerHTML;
      btn.innerHTML = `Sending...`;
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        formSuccess.style.opacity = 0;
        setTimeout(() => {
          formSuccess.style.transition = 'opacity 0.5s ease-in-out';
          formSuccess.style.opacity = 1;
        }, 50);
      }, 1500);
    });
  }

  // =========================================================================
  // 7. Newsletter Signup Support
  // =========================================================================
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('.newsletter-input');
      if (input) {
        alert(`🎉 Thank you for subscribing! Email: ${input.value}`);
        input.value = '';
      }
    });
  }

  // =========================================================================
  // 8. Pricing Сarousel — Повністю переписаний та виправлений слайдер курсів
  // =========================================================================
  const swiperEl = document.querySelector('.pricing-swiper');
  const pricingContainer = document.getElementById('real-pricing-container');

  if (swiperEl && pricingContainer) {
    const pSlides = Array.from(pricingContainer.querySelectorAll('.pricing-slide'));
    const pDotsEl = document.getElementById('pricing-dots');
    const pPrevBtn = document.getElementById('pricing-prev');
    const pNextBtn = document.getElementById('pricing-next');

    if (pSlides.length > 0) {
      let pCurrentIndex = 0;
      let pTouchStartX = 0;

      // Примусово налаштовуємо стилі, щоб прибрати конфлікти зі старим scroll-snap
      swiperEl.style.overflow = 'hidden';
      swiperEl.style.width = '100%';
      swiperEl.style.position = 'relative';

      pricingContainer.style.display = 'flex';
      pricingContainer.style.width = '100%';
      pricingContainer.style.transition = 'transform 0.4s ease-in-out';

      function getSlidesPerView() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
      }

      function getMaxIndex() {
        return Math.max(0, pSlides.length - getSlidesPerView());
      }

      function updateSlideWidths() {
        const slidesPerView = getSlidesPerView();
        pSlides.forEach(s => {
          s.style.flex = `0 0 ${100 / slidesPerView}%`;
          s.style.width = `${100 / slidesPerView}%`;
          s.style.boxSizing = 'border-box';
        });
      }

      function goToPricingSlide(idx) {
        const maxIdx = getMaxIndex();
        if (idx < 0) idx = 0;
        if (idx > maxIdx) idx = maxIdx;
        pCurrentIndex = idx;

        const offset = -(pCurrentIndex * (100 / getSlidesPerView()));
        pricingContainer.style.transform = `translateX(${offset}%)`;

        updatePricingDots();
        updatePricingNav();
      }

      function buildPricingDots() {
        if (!pDotsEl) return;
        pDotsEl.innerHTML = '';
        const count = getMaxIndex() + 1;
        for (let i = 0; i < count; i++) {
          const dot = document.createElement('button');
          dot.className = 'pricing-dot' + (i === pCurrentIndex ? ' active' : '');
          dot.setAttribute('aria-label', 'Slide ' + (i + 1));
          dot.addEventListener('click', (e) => {
            e.preventDefault();
            goToPricingSlide(i);
          });
          pDotsEl.appendChild(dot);
        }
      }

      function updatePricingDots() {
        if (!pDotsEl) return;
        pDotsEl.querySelectorAll('.pricing-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === pCurrentIndex);
        });
      }

      function updatePricingNav() {
        const maxIdx = getMaxIndex();
        if (pPrevBtn) {
          pPrevBtn.style.opacity = pCurrentIndex === 0 ? '0.35' : '1';
          pPrevBtn.style.pointerEvents = pCurrentIndex === 0 ? 'none' : 'auto';
        }
        if (pNextBtn) {
          pNextBtn.style.opacity = pCurrentIndex >= maxIdx ? '0.35' : '1';
          pNextBtn.style.pointerEvents = pCurrentIndex >= maxIdx ? 'none' : 'auto';
        }
      }

      if (pPrevBtn) pPrevBtn.addEventListener('click', (e) => { e.preventDefault(); goToPricingSlide(pCurrentIndex - 1); });
      if (pNextBtn) pNextBtn.addEventListener('click', (e) => { e.preventDefault(); goToPricingSlide(pCurrentIndex + 1); });

      swiperEl.addEventListener('touchstart', e => { pTouchStartX = e.touches[0].clientX; }, { passive: true });
      swiperEl.addEventListener('touchend', e => {
        const diff = pTouchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          goToPricingSlide(pCurrentIndex + (diff > 0 ? 1 : -1));
        }
      }, { passive: true });

      window.addEventListener('resize', () => {
        updateSlideWidths();
        buildPricingDots();
        goToPricingSlide(Math.min(pCurrentIndex, getMaxIndex()));
      });

      // Старт ініціалізації слайдера курсів
      updateSlideWidths();
      buildPricingDots();
      updatePricingNav();
      goToPricingSlide(0);
    }
  }

  // =========================================================================
  // 9. Reviews Section & Subapase Integrations (Відгуки)
  // =========================================================================
  const commentForm = document.getElementById('comment-form');
  const commentsContainer = document.getElementById('real-comments-container');
  const rDotsContainer = document.getElementById('carousel-dots');
  const rNextBtn = document.getElementById('carousel-next');
  const rPrevBtn = document.getElementById('carousel-prev');

  let rCurrentIndex = 0;
  let rTotalSlides = 0;
  let selectedRating = 5;

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  const starsSelector = document.getElementById('stars-selector');
  if (starsSelector) {
    const stars = starsSelector.querySelectorAll('svg');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-value'));
        stars.forEach(s => {
          const val = parseInt(s.getAttribute('data-value'));
          s.style.color = val <= selectedRating ? '#FFB020' : '#E2E8F0';
        });
      });
    });
  }

  function updateReviewsSlider() {
    if (!commentsContainer) return;
    const slidesPerPage = window.innerWidth >= 768 ? 2 : 1;
    const maxIdx = Math.max(0, rTotalSlides - slidesPerPage);

    if (rCurrentIndex > maxIdx) rCurrentIndex = maxIdx;
    if (rCurrentIndex < 0) rCurrentIndex = 0;

    const offset = -(rCurrentIndex * (100 / slidesPerPage));
    commentsContainer.style.transform = `translateX(${offset}%)`;

    if (rDotsContainer) {
      const dots = rDotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === rCurrentIndex);
      });
    }
  }

  function setupReviewsDots() {
    if (!rDotsContainer) return;
    rDotsContainer.innerHTML = '';
    const slidesPerPage = window.innerWidth >= 768 ? 2 : 1;
    const dotsCount = Math.max(0, rTotalSlides - slidesPerPage + 1);

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot';
      if (i === rCurrentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        rCurrentIndex = i;
        updateReviewsSlider();
      });
      rDotsContainer.appendChild(dot);
    }
  }

  async function fetchComments() {
    if (!commentsContainer || !supabaseClient) return;

    let { data: comments, error } = await supabaseClient
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Помилка завантаження відгуків:', error);
      return;
    }

    commentsContainer.innerHTML = '';
    rTotalSlides = comments.length;

    comments.forEach(comment => {
      const slide = document.createElement('div');
      slide.className = 'review-slide';

      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=5E077E&color=fff&rounded=true&size=128&font-size=0.45&bold=true`;
      const dateFormatted = new Date(comment.created_at).toLocaleDateString('uk-UA');
      const currentRating = comment.rating || 5;

      let starsHTML = '';
      for (let i = 1; i <= 5; i++) {
        const starColor = i <= currentRating ? '#FFB020' : '#E2E8F0';
        starsHTML += `<svg viewBox="0 0 20 20" style="color: ${starColor}; fill: currentColor; width: 18px; height: 18px; display: inline-block;"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
      }

      let teacherReplyHTML = '';
      if (comment.teacher_reply) {
        teacherReplyHTML = `
          <div class="teacher-reply" style="margin-top: 15px; padding: 12px 16px; background: rgba(94, 7, 126, 0.04); border-left: 3px solid #5E077E; border-radius: 4px 12px 12px 4px; text-align: left;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #5E077E, #9333EA); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px;">NF</div>
              <span style="font-size: 13px; color: #5E077E; font-weight: 700;">Кирило (Вчитель NovaFlow)</span>
            </div>
            <p style="margin: 0; font-size: 13.5px; color: #475569; font-style: italic; line-height: 1.5;">${escapeHTML(comment.teacher_reply)}</p>
          </div>
        `;
      }

      slide.innerHTML = `
        <div class="review-card" style="margin: 0 10px; height: 100%;">
          <div class="review-rating" style="display: flex; gap: 4px; margin-bottom: 12px;">${starsHTML}</div>
          <p class="review-text">"${escapeHTML(comment.text)}"</p>
          <div class="review-user" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
              <div class="user-avatar" style="width: 48px; height: 48px; min-width: 48px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                <img src="${avatarUrl}" alt="${escapeHTML(comment.name)}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div class="user-info">
                <span class="user-name">${escapeHTML(comment.name)}</span>
                <span class="user-meta">${dateFormatted}</span>
              </div>
            </div>
          </div>
          ${teacherReplyHTML}
        </div>
      `;
      commentsContainer.appendChild(slide);
    });

    setupReviewsDots();
    updateReviewsSlider();
  }

  if (rNextBtn) {
    rNextBtn.addEventListener('click', () => {
      const slidesPerPage = window.innerWidth >= 768 ? 2 : 1;
      if (rCurrentIndex < rTotalSlides - slidesPerPage) rCurrentIndex++;
      else rCurrentIndex = 0;
      updateReviewsSlider();
    });
  }

  if (rPrevBtn) {
    rPrevBtn.addEventListener('click', () => {
      const slidesPerPage = window.innerWidth >= 768 ? 2 : 1;
      if (rCurrentIndex > 0) rCurrentIndex--;
      else rCurrentIndex = Math.max(0, rTotalSlides - slidesPerPage);
      updateReviewsSlider();
    });
  }

  window.addEventListener('resize', () => {
    setupReviewsDots();
    updateReviewsSlider();
  });

  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('comment-name');
      const textInput = document.getElementById('comment-text');

      if (!nameInput.value.trim() || !textInput.value.trim()) {
        alert('Будь ласка, заповніть усі поля!');
        return;
      }

      const { error } = await supabaseClient
        .from('comments')
        .insert([{
          name: nameInput.value.trim(),
          text: textInput.value.trim(),
          rating: selectedRating
        }]);

      if (error) {
        alert('Помилка відправки. Спробуйте ще раз.');
      } else {
        alert('Дякуємо! Ваш відгук успішно надіслано.');
        commentForm.reset();
        selectedRating = 5;
        if (starsSelector) {
          starsSelector.querySelectorAll('svg').forEach(s => s.style.color = '#FFB020');
        }
        await fetchComments();
      }
    });
  }

  fetchComments();

  // =========================================================================
  // 10. Сертифікати та Lightbox модалка
  // =========================================================================
  let currentCertImages = [];
  let currentCertIndex = 0;

  window.openCertModal = function (images) {
    const lightbox = document.getElementById('certLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const prevBtn = document.getElementById('prevCertBtn');
    const nextBtn = document.getElementById('nextCertBtn');

    if (!lightbox || !lightboxImg) return;

    if (Array.isArray(images)) currentCertImages = images;
    else if (typeof images === 'string') currentCertImages = [images];
    else return;

    currentCertIndex = 0;
    lightboxImg.src = currentCertImages[currentCertIndex];

    if (currentCertImages.length > 1) {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
    } else {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }
    lightbox.classList.add('active');
  };

  window.closeCertModal = function () {
    const lightbox = document.getElementById('certLightbox');
    if (lightbox) lightbox.classList.remove('active');
  };

  window.changeCert = function (direction) {
    if (currentCertImages.length <= 1) return;
    const lightboxImg = document.getElementById('lightboxImg');
    if (!lightboxImg) return;

    lightboxImg.classList.add('fade-effect');

    setTimeout(function () {
      currentCertIndex += direction;
      if (currentCertIndex >= currentCertImages.length) currentCertIndex = 0;
      if (currentCertIndex < 0) currentCertIndex = currentCertImages.length - 1;

      lightboxImg.src = currentCertImages[currentCertIndex];
      lightboxImg.onload = function () {
        lightboxImg.classList.remove('fade-effect');
      };
    }, 250);
  };

  document.addEventListener('keydown', function (e) {
    const lightbox = document.getElementById('certLightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeCertModal();
    else if (e.key === 'ArrowRight') changeCert(1);
    else if (e.key === 'ArrowLeft') changeCert(-1);
  });
});

// =========================================================================
// 11. Система оплати — Модальне вікно підтвердження покупки курсу
// =========================================================================
const paymentModalHTML = `
<div class="payment-modal-overlay" id="payment-modal-overlay">
  <div class="payment-modal-card" id="payment-modal-card">
    <button class="payment-modal-close" id="payment-modal-close" aria-label="Close">
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <div class="pmodal-icon-wrap" id="pmodal-icon-wrap">
      <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    </div>
    <p class="pmodal-course-tag" id="pmodal-lang-tag">English Course</p>
    <h2 class="pmodal-title" id="pmodal-plan-name">Active Flow</h2>
    <div class="pmodal-price-row">
      <span class="pmodal-price" id="pmodal-price">$120</span>
      <span class="pmodal-period" id="pmodal-period">/ month</span>
    </div>
    <ul class="pmodal-features" id="pmodal-features"></ul>
    <div class="pmodal-actions">
      <button class="pmodal-btn-cancel" id="pmodal-btn-cancel">Cancel</button>
      <button class="pmodal-btn-confirm" id="pmodal-btn-confirm">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span id="pmodal-confirm-label">Confirm Payment</span>
      </button>
    </div>
    <p class="pmodal-secure-note" id="pmodal-secure-note">
      <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1l9 4v6c0 5.25-3.84 10.13-9 11.5C6.84 21.13 3 16.25 3 11V5l9-4z"/></svg>
      Secured with 256-bit SSL encryption
    </p>
  </div>
</div>`;

document.body.insertAdjacentHTML('beforeend', paymentModalHTML);

const LANG_FLAGS = { english: '🇬🇧', german: '🇩🇪', ukrainian: '🇺🇦' };
const LANG_LABELS = { 
  en: { english: 'English Course', german: 'German Course', ukrainian: 'Ukrainian Course' },
  uk: { english: 'Курс англійської', german: 'Курс німецької', ukrainian: 'Курс української' },
  de: { english: 'Englisch Kurs', german: 'Deutsch Kurs', ukrainian: 'Ukrainisch Kurs' }
};

const pmOverlay = document.getElementById('payment-modal-overlay');
const pmClose = document.getElementById('payment-modal-close');
const pmCancel = document.getElementById('pmodal-btn-cancel');
const pmConfirm = document.getElementById('pmodal-btn-confirm');
const pmLangTag = document.getElementById('pmodal-lang-tag');
const pmPlanName = document.getElementById('pmodal-plan-name');
const pmPrice = document.getElementById('pmodal-price');
const pmPeriod = document.getElementById('pmodal-period');
const pmFeatures = document.getElementById('pmodal-features');
const pmConfirmLabel = document.getElementById('pmodal-confirm-label');
const pmIconWrap = document.getElementById('pmodal-icon-wrap');
const pmSecureNote = document.getElementById('pmodal-secure-note');

let currentPaymentData = null;

function openPaymentModal(lang, plan, price, lessons, cardElement) {
  const activeLang = localStorage.getItem('novaflowLang') || 'en';
  const isFree = price === '0' || price === 0;

  currentPaymentData = { lang, plan, price, lessons, isFree };

  // Localized Labels
  const labels = LANG_LABELS[activeLang] || LANG_LABELS['en'];
  pmLangTag.textContent = `${LANG_FLAGS[lang] || ''} ${labels[lang] || lang}`;

  // Extract from the DOM if available to get the exact translation dynamically
  let planTitle = plan;
  let priceText = isFree ? (activeLang === 'uk' ? 'Безкоштовно' : activeLang === 'de' ? 'Kostenlos' : 'Free') : `$${price}`;
  let periodText = '';
  let features = [];

  if (cardElement) {
    const titleEl = cardElement.querySelector('.pricing-title');
    if (titleEl) planTitle = titleEl.textContent;

    const priceEl = cardElement.querySelector('.pricing-price [data-i18n]');
    if (priceEl) priceText = priceEl.textContent;

    const periodEl = cardElement.querySelector('.pricing-period');
    if (periodEl) periodText = periodEl.textContent;

    const featItems = cardElement.querySelectorAll('.pricing-feature-item span, .pricing-features span');
    featItems.forEach(item => {
      features.push(item.textContent);
    });
  }

  pmPlanName.textContent = planTitle;
  pmPrice.textContent = priceText;
  pmPeriod.textContent = periodText;

  // Localized Actions
  if (pmCancel) {
    pmCancel.textContent = activeLang === 'uk' ? 'Скасувати' : activeLang === 'de' ? 'Abbrechen' : 'Cancel';
  }

  if (pmConfirmLabel) {
    if (isFree) {
      pmConfirmLabel.textContent = activeLang === 'uk' ? '🎯 Записатися безкоштовно' : activeLang === 'de' ? '🎯 Kostenlos anmelden' : '🎯 Book Free Lesson';
    } else {
      pmConfirmLabel.textContent = activeLang === 'uk' ? '💳 Підтвердити оплату' : activeLang === 'de' ? '💳 Zahlung bestätigen' : '💳 Confirm Payment';
    }
  }

  if (pmSecureNote) {
    const shieldIcon = `<svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1l9 4v6c0 5.25-3.84 10.13-9 11.5C6.84 21.13 3 16.25 3 11V5l9-4z"/></svg>`;
    const secureText = activeLang === 'uk' ? 'Захищено 256-bit SSL шифруванням' : activeLang === 'de' ? 'Gesichert mit 256-Bit-SSL-Verschlüsselung' : 'Secured with 256-bit SSL encryption';
    pmSecureNote.innerHTML = `${shieldIcon} ${secureText}`;
  }

  const iconColors = { english: '#0057b7', german: '#DD0000', ukrainian: '#0057B7' };
  pmIconWrap.style.background = `linear-gradient(135deg, ${iconColors[lang] || '#4B1F60'}22, ${iconColors[lang] || '#4B1F60'}11)`;
  pmIconWrap.style.color = iconColors[lang] || '#4B1F60';

  pmFeatures.innerHTML = features
    .map(f => `<li><svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>${f}</li>`)
    .join('');

  pmOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  if (pmOverlay) pmOverlay.classList.remove('active');
  document.body.style.overflow = '';
  currentPaymentData = null;
}

if (pmClose) pmClose.addEventListener('click', closePaymentModal);
if (pmCancel) pmCancel.addEventListener('click', closePaymentModal);
if (pmOverlay) pmOverlay.addEventListener('click', e => { if (e.target === pmOverlay) closePaymentModal(); });

if (pmConfirm) {
  pmConfirm.addEventListener('click', async () => {
    if (!currentPaymentData) return;
    const { lang, plan, price, lessons, isFree } = currentPaymentData;
    const activeLang = localStorage.getItem('novaflowLang') || 'en';

    localStorage.setItem('novaflow_selected_lang', lang);
    localStorage.setItem('novaflow_selected_plan', plan);
    localStorage.setItem('novaflow_selected_lessons', lessons);

    const originalHTML = pmConfirm.innerHTML;
    pmConfirm.disabled = true;

    const processingText = activeLang === 'uk' ? 'Обробка...' : activeLang === 'de' ? 'Verarbeitung...' : 'Processing...';
    pmConfirm.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${processingText}`;

    await new Promise(r => setTimeout(r, 1200));

    pmConfirm.disabled = false;
    pmConfirm.innerHTML = originalHTML;
    closePaymentModal();

    if (isFree) {
      showPurchaseToast(lang, plan, true);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);
    } else {
      showPurchaseToast(lang, plan, false);
      setTimeout(() => {
        const labels = LANG_LABELS[activeLang] || LANG_LABELS['en'];
        const redirText = activeLang === 'uk' 
          ? `💳 Перенаправлення на безпечну оплату...\n\nПлан: ${plan}\nМова: ${labels[lang]}\nСума: $${price}\n\n[Тут буде Stripe або WayForPay]`
          : activeLang === 'de'
          ? `💳 Weiterleitung zur sicheren Kasse...\n\nPlan: ${plan}\nSprache: ${labels[lang]}\nBetrag: $${price}\n\n[Stripe oder WayForPay hier]`
          : `💳 Redirecting to secure checkout...\n\nPlan: ${plan}\nLanguage: ${labels[lang]}\nAmount: $${price}\n\n[Stripe or WayForPay here]`;
        alert(redirText);
      }, 300);
    }
  });
}

function showPurchaseToast(lang, plan, isFree) {
  const activeLang = localStorage.getItem('novaflowLang') || 'en';
  const existing = document.getElementById('nf-purchase-toast');
  if (existing) existing.remove();

  const labels = LANG_LABELS[activeLang] || LANG_LABELS['en'];
  const titleText = isFree 
    ? (activeLang === 'uk' ? 'Записано!' : activeLang === 'de' ? 'Registriert!' : 'Registered!')
    : (activeLang === 'uk' ? 'Оплату підтверджено!' : activeLang === 'de' ? 'Zahlung bestätigt!' : 'Payment Confirmed!');

  const toast = document.createElement('div');
  toast.id = 'nf-purchase-toast';
  toast.className = 'nf-toast';
  toast.innerHTML = `
    <div class="nf-toast-icon">🎉</div>
    <div class="nf-toast-text">
      <strong>${titleText}</strong>
      <span>${labels[lang] || lang} — ${plan}</span>
    </div>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('visible'), 50);
  setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 400); }, 3500);
}

const buyButtons = document.querySelectorAll('.buy-plan-btn, .payment-trigger');
buyButtons.forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const lang = this.getAttribute('data-lang') || 'english';
    const plan = this.getAttribute('data-plan') || 'Trial Placement';
    const price = this.getAttribute('data-price') || '0';
    const lessons = this.getAttribute('data-lessons') || '1';
    const card = this.closest('.pricing-card');
    openPaymentModal(lang, plan, price, lessons, card);
  });
});