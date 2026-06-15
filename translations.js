/**
 * File: translations.js
 * Purpose: handle language switching with in-page translation updates
 */

// Translation dictionary
const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_about: "About us",
    nav_languages: "Languages",
    nav_reviews: "Reviews",
    nav_contact: "Contact",
    nav_cta: "Get started",

    // Hero Section
    hero_title: "Build Your <span class=\"purple-gradient-text\">Language</span> <span class=\"purple-gradient-text\">Flow</span>. Change Your Life",
    hero_bullet_1: "Personalized learning paths",
    hero_bullet_2: "Flexible schedules for busy lives",
    hero_bullet_3: "Real-world speaking practice",
    hero_bullet_4: "Fast visible progress in 30 days",
    hero_cta: "Start your Journey",

    // About Section
    about_title: "Accelerate Your Path to Language Mastery",
    about_desc: "Our proven methodology combines modern technology with human-centric teaching to deliver results faster.",

    // Languages Section
    lang_tag: "Languages",
    lang_title: "Courses We Teach",
    lang_desc: "Unlock massive professional and personal opportunities by mastering one of our high-demand core languages.",
    course_en_title: "English for Global Success",
    course_en_desc: "From corporate negotiations to international travel, gain full command of global conversation, grammar nuances, and dynamic speaking skills.",
    course_de_title: "German for Careers",
    course_de_desc: "Unlock career progress in Germany, Austria, and Switzerland. Focus heavily on precise grammar structure, sentence models, and workplace vocabulary.",
    course_ua_title: "Ukrainian Connection",
    course_ua_desc: "Connect with rich culture, local heritage, and speaking communities. Perfect for absolute beginners and heritage speakers looking to build core conversational confidence.",
    course_levels_all: "All Levels (A1-C2)",
    course_levels_de: "All Levels (A1-C1)",
    course_levels_ua: "A1 - B2 Levels",
    course_lessons_30: "30 Lessons",
    course_lessons_35: "35 Lessons",
    explore_course: "Explore Course",

    // Lab Section
    lab_title: "Interactive Language Lab",
    lab_listen: "Listen Speak",
    lab_next: "Next Phrase",

    // Reviews Section
    reviews_tag: "Reviews",
    reviews_title: "What Our Students Say",
    reviews_desc: "Thousands of students have accelerated their fluency path using our personalized speaking roadmap.",
    form_review_title: "Share your experience",
    form_review_desc: "Your feedback will help others make the right choice.",
    form_rating_label: "Your rating:",
    form_name_placeholder: "Your full name",
    form_text_placeholder: "Write your review...",
    form_submit_btn: "Submit review",

    // Contact Section
    contact_title: "Start Your Flow Today",
    contact_desc: "Ready to transform your communication skills? Book your free 1-on-1 placement lesson with one of our certified trainers. We'll assess your speaking level and design your custom roadmap.",
    form_label_name: "Full Name",
    form_label_email: "Email Address",
    form_label_lang: "Target Language",
    form_label_level: "Current Level",
    form_label_msg: "Special Requirements / Goals",
    placeholder_name: "John Doe",
    placeholder_email: "john@example.com",
    select_lang_placeholder: "Select Language",
    select_level_placeholder: "Select Level",
    option_level_0: "Absolute Beginner (A0)",
    option_level_1: "Elementary (A1-A2)",
    option_level_2: "Intermediate (B1-B2)",
    option_level_3: "Advanced (C1-C2)",
    placeholder_msg: "Tell us about your learning goals...",
    form_btn: "Book Free Placement Lesson",
    form_success: "🎉 Congratulations! Your request has been sent. We'll email you within 2 hours to confirm your consultation time.",

    // Footer
    footer_desc: "Empowering speaking flow globally with cutting-edge immersive tutoring methodologies and flexible mobile frameworks.",
    footer_col_school: "School",
    footer_col_legal: "Legal",
    footer_col_newsletter: "Newsletter",
    footer_newsletter_desc: "Subscribe to get weekly vocabulary updates, resources, and special trial offer notifications.",
    newsletter_placeholder: "Your email address",
    newsletter_btn: "Join",
    footer_copy: "© 2026 NovaFlow Language School. All rights reserved.",
  },
  uk: {
    // Navigation
    nav_home: "Головна",
    nav_about: "Про нас",
    nav_languages: "Мови",
    nav_reviews: "Відгуки",
    nav_contact: "Контакти",
    nav_cta: "Розпочати",

    // Hero Section
    hero_title: "Побудуй свій <span class=\"purple-gradient-text\">мовний</span> <span class=\"purple-gradient-text\">потік</span>. Змініть своє життя",
    hero_bullet_1: "Персоналізовані навчальні маршрути",
    hero_bullet_2: "Гнучкий графік для зайнятих людей",
    hero_bullet_3: "Практика спілкування в реальних ситуаціях",
    hero_bullet_4: "Швидкий прогрес протягом 30 днів",
    hero_cta: "Почніть свою подорож",

    // About Section
    about_title: "Прискорте свій шлях до мовного майстерства",
    about_desc: "Наша перевірена методологія поєднує сучасні технології з людиноцентричним навчанням для швидших результатів.",

    // Languages Section
    lang_tag: "Мови",
    lang_title: "Мови, які ми викладаємо",
    lang_desc: "Розблокуйте величезні професійні та особисті можливості, оволодівши однією з наших високопопулярних мов.",
    course_en_title: "Англійська для глобального успіху",
    course_en_desc: "Від корпоративних переговорів до міжнародних подорожей, отримайте повне володіння розмовою, граматичними нюансами та динамічним співанням.",
    course_de_title: "Німецька для кар'єри",
    course_de_desc: "Розблокуйте кар'єрний прогрес у Німеччині, Австрії та Швейцарії. Зосередьтеся на точній граматичній структурі та словниці.",
    course_ua_title: "Українське з'єднання",
    course_ua_desc: "Приєднайтеся до багатої культури та спілкування. Ідеально для повних початківців та тих, хто хоче розвивати розмовну впевненість.",
    course_levels_all: "Усі рівні (A1-C2)",
    course_levels_de: "Усі рівні (A1-C1)",
    course_levels_ua: "Рівні A1 - B2",
    course_lessons_30: "30 уроків",
    course_lessons_35: "35 уроків",
    explore_course: "Дослідити курс",

    // Lab Section
    lab_title: "Інтерактивна мовна лабораторія",
    lab_listen: "Слухайте Говоріть",
    lab_next: "Наступна фраза",

    // Reviews Section
    reviews_tag: "Відгуки",
    reviews_title: "Що кажуть наші студенти",
    reviews_desc: "Тисячі студентів прискорили свій шлях бігло, використовуючи нашу персоналізовану дорожну карту.",
    form_review_title: "Поділіться своїм досвідом",
    form_review_desc: "Ваш відгук допоможе іншим зробити правильний вибір.",
    form_rating_label: "Ваша оцінка:",
    form_name_placeholder: "Ваше ім'я та прізвище",
    form_text_placeholder: "Напишіть свій відгук...",
    form_submit_btn: "Надіслати відгук",

    // Contact Section
    contact_title: "Почніть свій потік сьогодні",
    contact_desc: "Готові змінити свої комунікаційні навички? Забронюйте безплатний персональний урок розміщення з одним із наших сертифікованих тренерів. Ми оцінимо ваш рівень і розробимо вашу індивідуальну карту.",
    form_label_name: "Повне ім'я",
    form_label_email: "Адреса електронної пошти",
    form_label_lang: "Цільова мова",
    form_label_level: "Поточний рівень",
    form_label_msg: "Особливі вимоги / Цілі",
    placeholder_name: "Іван Петренко",
    placeholder_email: "ivan@example.com",
    select_lang_placeholder: "Виберіть мову",
    select_level_placeholder: "Виберіть рівень",
    option_level_0: "Абсолютний початківець (A0)",
    option_level_1: "Елементарний (A1-A2)",
    option_level_2: "Середній (B1-B2)",
    option_level_3: "Просунутий (C1-C2)",
    placeholder_msg: "Розповідайте про ваші цілі навчання...",
    form_btn: "Забронюйте безплатний урок розміщення",
    form_success: "🎉 Вітаємо! Вашу заявку надіслано. Ми надішлемо вам електронного листа протягом 2 годин, щоб підтвердити час консультації.",

    // Footer
    footer_desc: "Розширення мовного потоку глобально за допомогою передових іммерсивних методик навчання та гнучких мобільних платформ.",
    footer_col_school: "Школа",
    footer_col_legal: "Юридичні",
    footer_col_newsletter: "Розсилка",
    footer_newsletter_desc: "Підпишіться, щоб отримувати щотижневі оновлення словника, ресурси та сповіщення про спеціальні пробні пропозиції.",
    newsletter_placeholder: "Ваша адреса електронної пошти",
    newsletter_btn: "Приєднатися",
    footer_copy: "© 2026 NovaFlow Language School. Усі права захищені.",
  },
  de: {
    // Navigation
    nav_home: "Startseite",
    nav_about: "Über uns",
    nav_languages: "Sprachen",
    nav_reviews: "Bewertungen",
    nav_contact: "Kontakt",
    nav_cta: "Jetzt starten",

    // Hero Section
    hero_title: "Schaffen Sie Ihren <span class=\"purple-gradient-text\">Sprach</span>-<span class=\"purple-gradient-text\">Fluss</span>. Verändern Sie Ihr Leben",
    hero_bullet_1: "Personalisierte Lernpfade",
    hero_bullet_2: "Flexible Zeitpläne für vielbeschäftigte Menschen",
    hero_bullet_3: "Praktische Sprechübungen in realen Situationen",
    hero_bullet_4: "Schnelle Fortschritte in 30 Tagen",
    hero_cta: "Ihre Reise beginnen",

    // About Section
    about_title: "Beschleunigen Sie Ihren Weg zur Sprachbeherrschung",
    about_desc: "Unsere bewährte Methodik verbindet moderne Technologie mit benutzerorientierten Unterrichtsmethoden für schnellere Ergebnisse.",

    // Languages Section
    lang_tag: "Sprachen",
    lang_title: "Sprachen, die wir unterrichten",
    lang_desc: "Schalten Sie massive berufliche und persönliche Möglichkeiten frei, indem Sie eine unserer hochgefragten Sprachen beherrschen.",
    course_en_title: "Englisch für globalen Erfolg",
    course_en_desc: "Von Geschäftsverhandlungen bis zu internationalen Reisen – gewinnen Sie volle Kontrolle über Gespräche, grammatikalische Nuancen und dynamisches Sprechen.",
    course_de_title: "Deutsch für Karriere",
    course_de_desc: "Schalten Sie berufliche Fortschritte in Deutschland, Österreich und der Schweiz frei. Konzentrieren Sie sich auf präzise Grammatikstruktur und Fachvokabular.",
    course_ua_title: "Ukrainische Verbindung",
    course_ua_desc: "Verbinden Sie sich mit reicher Kultur und lokalen Sprachgemeinschaften. Perfekt für absolute Anfänger und Heritage-Speaker.",
    course_levels_all: "Alle Niveaus (A1-C2)",
    course_levels_de: "Alle Niveaus (A1-C1)",
    course_levels_ua: "Niveaus A1 - B2",
    course_lessons_30: "30 Lektionen",
    course_lessons_35: "35 Lektionen",
    explore_course: "Kurs erkunden",

    // Lab Section
    lab_title: "Interaktives Sprachlabor",
    lab_listen: "Hören Sie Sprechen",
    lab_next: "Nächster Satz",

    // Reviews Section
    reviews_tag: "Bewertungen",
    reviews_title: "Was unsere Schüler sagen",
    reviews_desc: "Tausende von Schülern haben ihren Weg zur Flüssigkeit mit unserer personalisierten Lernkarte beschleunigt.",
    form_review_title: "Teilen Sie Ihre Erfahrung",
    form_review_desc: "Ihre Rückmeldung hilft anderen, die richtige Wahl zu treffen.",
    form_rating_label: "Ihre Bewertung:",
    form_name_placeholder: "Ihr vollständiger Name",
    form_text_placeholder: "Schreiben Sie Ihre Bewertung...",
    form_submit_btn: "Bewertung einreichen",

    // Contact Section
    contact_title: "Beginnen Sie heute Ihren Flow",
    contact_desc: "Bereit, Ihre Kommunikationsfähigkeiten zu verändern? Buchen Sie Ihre kostenlose 1-zu-1-Platzierungslektion mit einem unserer zertifizierten Trainer. Wir werden Ihren Sprachlevel bewerten und eine individuelle Lernkarte erstellen.",
    form_label_name: "Vollständiger Name",
    form_label_email: "E-Mail-Adresse",
    form_label_lang: "Zielsprache",
    form_label_level: "Aktuelles Niveau",
    form_label_msg: "Besondere Anforderungen / Ziele",
    placeholder_name: "Max Mustermann",
    placeholder_email: "max@example.com",
    select_lang_placeholder: "Sprache auswählen",
    select_level_placeholder: "Niveau auswählen",
    option_level_0: "Absoluter Anfänger (A0)",
    option_level_1: "Elementar (A1-A2)",
    option_level_2: "Mittelstufe (B1-B2)",
    option_level_3: "Fortgeschrittene (C1-C2)",
    placeholder_msg: "Erzählen Sie uns von Ihren Lernzielen...",
    form_btn: "Kostenlose Platzierungslektion buchen",
    form_success: "🎉 Herzlichen Glückwunsch! Ihre Anfrage wurde gesendet. Wir werden Ihnen innerhalb von 2 Stunden eine E-Mail senden, um Ihre Beratungszeit zu bestätigen.",

    // Footer
    footer_desc: "Förderung des Sprachflusses weltweit durch hochmoderne immersive Unterrichtsmethoden und flexible mobile Plattformen.",
    footer_col_school: "Schule",
    footer_col_legal: "Rechtlich",
    footer_col_newsletter: "Newsletter",
    footer_newsletter_desc: "Abonnieren Sie, um wöchentliche Vokabelupdates, Ressourcen und Benachrichtigungen zu speziellen Testangeboten zu erhalten.",
    newsletter_placeholder: "Ihre E-Mail-Adresse",
    newsletter_btn: "Beitreten",
    footer_copy: "© 2026 NovaFlow Language School. Alle Rechte vorbehalten.",
  }
};

// Current language state
let currentLang = localStorage.getItem('novaflowLang') || 'en';

// Function to update all page content
function updatePageLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('novaflowLang', lang);
  
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      const text = translations[lang][key];
      // Check if element has HTML (contains span tags)
      if (text.includes('<')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });
  
  // Update all language selects
  const langSelects = document.querySelectorAll('.lang-select');
  langSelects.forEach(select => {
    select.value = lang;
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set initial language
  updatePageLanguage(currentLang);
  
  // Listen for language changes
  const langSelects = document.querySelectorAll('.lang-select');
  langSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      updatePageLanguage(e.target.value);
      // Smooth fade effect
      document.body.style.opacity = '0.7';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 150);
    });
  });
});
