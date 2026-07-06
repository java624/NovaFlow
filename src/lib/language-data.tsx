// =========================================================================
// Language page data and translations
// =========================================================================

export interface LangConfig {
  code: string;
  name: string;
  flag: React.ReactNode;
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  programSteps: { step: number; title: string; desc: string }[];
  pricingPlans: {
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
  }[];
  quizBadge: string;
  contactTitle: string;
  contactDesc: string;
}

export const UK_FLAG = (
  <svg viewBox="0 0 60 60" width="100%" height="100%">
    <mask id="circle-flag"><circle cx="30" cy="30" r="30" fill="white" /></mask>
    <g mask="url(#circle-flag)">
      <rect width="60" height="60" fill="#00247D" />
      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#FFFFFF" strokeWidth="8" />
      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#CC0000" strokeWidth="4" />
      <path d="M30,0 L30,60 M0,30 L60,30" stroke="#FFFFFF" strokeWidth="12" />
      <path d="M30,0 L30,60 M0,30 L60,30" stroke="#CC0000" strokeWidth="8" />
    </g>
  </svg>
);

export const GERMAN_FLAG = (
  <svg viewBox="0 0 60 60" width="100%" height="100%">
    <mask id="circle-flag-de"><circle cx="30" cy="30" r="30" fill="white" /></mask>
    <g mask="url(#circle-flag-de)">
      <rect x="0" y="0" width="60" height="20" fill="#000000" />
      <rect x="0" y="20" width="60" height="20" fill="#DD0000" />
      <rect x="0" y="40" width="60" height="20" fill="#FFCC00" />
    </g>
  </svg>
);

export const UKRAINIAN_FLAG = (
  <svg viewBox="0 0 60 60" width="100%" height="100%">
    <mask id="circle-flag-ua"><circle cx="30" cy="30" r="30" fill="white" /></mask>
    <g mask="url(#circle-flag-ua)">
      <rect x="0" y="0" width="60" height="30" fill="#0057B7" />
      <rect x="0" y="30" width="60" height="30" fill="#FFD700" />
    </g>
  </svg>
);

export const languageConfigs: Record<string, LangConfig> = {
  english: {
    code: 'en',
    name: 'English',
    flag: UK_FLAG,
    heroBadge: 'English Course',
    heroTitle: 'Master English. Speak with Global Impact',
    heroDesc: 'Unlock global opportunities. Master advanced grammar, business presentation models, and professional speaking confidence with elite coaches.',
    programSteps: [
      { step: 1, title: 'Core Communication', desc: 'Build vocabulary essentials, daily dialogue agility, and absolute listening confidence from Day 1.' },
      { step: 2, title: 'Professional Agility', desc: 'Master high-end business negotiations, mock resume reviews, and dynamic public presentation strategies.' },
      { step: 3, title: 'Advanced Mastery', desc: 'Perfect your grammar nuances, idiomatic speaking, and prepare for international IELTS/TOEFL exams.' },
    ],
    pricingPlans: [
      { id: 'free', title: 'First Free Lesson', price: 'Free', period: '/ 40 min session', rating: '5.0', reviews: '48', desc: 'Perfect for testing our platform and outlining your speaking roadmap.', popular: false, features: ['1-on-1 Placement Lesson', 'Custom Speaking Assessment', 'Tailored Study Plan'], btnText: 'Book Free Lesson', btnPrice: '0', btnLessons: '1' },
      { id: 'beginners', title: 'For Beginners (A1-A2)', price: '$12', period: '/ 1hr Lesson', rating: '4.9', reviews: '124', desc: 'Perfect for beginners who want to build a strong foundation in English and start speaking confidently.', popular: true, discount: 'Save BIG: Buy 10 lessons for just $11/hr!', features: ['Basic Grammar & Vocabulary', 'Speaking Practice', 'Listening Exercises', 'Homework & Feedback'], btnText: 'Get 10 Lessons Pack', btnPrice: '110', btnLessons: '10' },
      { id: 'communication', title: 'English for Communication', price: '$12', period: '/ 1hr Lesson', rating: '4.8', reviews: '96', desc: 'Focus on real-life communication and improve your confidence in everyday conversations.', popular: false, features: ['Speaking-Focused Lessons', 'Everyday Vocabulary', 'Pronunciation Training', 'Interactive Discussions'], btnText: 'Start Learning', btnPrice: '12', btnLessons: '1' },
      { id: 'business', title: 'Career & Business English', price: '$15', period: '/ 1hr Lesson', rating: '4.9', reviews: '82', desc: 'Develop professional communication skills for work, meetings, and international business.', popular: false, features: ['Business Vocabulary', 'Email Writing', 'Meeting & Presentation Skills', 'Professional Speaking Practice'], btnText: 'Start Learning', btnPrice: '15', btnLessons: '1' },
      { id: 'exam', title: 'Exam & Test Preparation', price: '$18', period: '/ 1hr Lesson', rating: '5.0', reviews: '73', desc: 'Get fully prepared for IELTS, TOEFL, or Cambridge exams with targeted strategies and practice tests.', popular: false, features: ['Exam Strategies & Formats', 'Mock Speaking & Writing Tests', 'Advanced Grammar & Structures', 'Time Management Tactics'], btnText: 'Start Learning', btnPrice: '18', btnLessons: '1' },
    ],
    quizBadge: 'English Speaking Flow',
    contactTitle: 'Book Your Placement Lesson',
    contactDesc: 'Ready to start your customized road path? Complete our short registration form and our coordinators will reach out in 2 hours.',
  },
  german: {
    code: 'de',
    name: 'German',
    flag: GERMAN_FLAG,
    heroBadge: 'German Course',
    heroTitle: 'Master German. Speak with Precision',
    heroDesc: 'Open career avenues in Germany, Austria, and Switzerland. Master precise case grammar structure, workplace vocab, and speak confidently.',
    programSteps: [
      { step: 1, title: 'Conversational agility', desc: 'Master basic sentence architectures, everyday active dialogues, and build clear core pronunciation skills.' },
      { step: 2, title: 'Grammar Alignment', desc: 'Formulate correct case configurations (Dativ/Akkusativ), sub-clause connectors, and workplace writing agility.' },
      { step: 3, title: 'Professional Fluency', desc: 'Conduct complex corporate negotiations, resume layout coaching, and master spontaneous debates.' },
    ],
    pricingPlans: [
      { id: 'free', title: 'First Free Lesson', price: 'Free', period: '/ 40 min session', rating: '5.0', reviews: '48', desc: 'Perfect for testing our platform and outlining your speaking roadmap.', popular: false, features: ['1-on-1 Placement Lesson', 'Custom Speaking Assessment', 'Tailored Study Plan'], btnText: 'Book Free Lesson', btnPrice: '0', btnLessons: '1' },
      { id: 'beginners', title: 'Everyday German', price: '$12', period: '/ 1hr Lesson', rating: '4.9', reviews: '124', desc: 'Learn German for daily life, travel, and confident communication in real-world situations.', popular: true, discount: 'Save BIG: Buy 10 lessons for just $11/hr!', features: ['Basic Grammar & Vocabulary', 'Speaking Practice', 'Listening Exercises', 'Homework & Feedback'], btnText: 'Get 10 Lessons Pack', btnPrice: '110', btnLessons: '10' },
      { id: 'starter', title: 'German Starter', price: '$12', period: '/ 1hr Lesson', rating: '4.8', reviews: '96', desc: 'Start learning German from scratch with clear explanations and practical communication exercises.', popular: false, features: ['Speaking-Focused Lessons', 'Everyday Vocabulary', 'Pronunciation Training', 'Interactive Discussions'], btnText: 'Start Learning', btnPrice: '12', btnLessons: '1' },
    ],
    quizBadge: 'German Speaking Flow',
    contactTitle: 'Book Your Placement Lesson',
    contactDesc: 'Ready to start your customized road path? Complete our short registration form and our coordinators will reach out in 2 hours.',
  },
  ukrainian: {
    code: 'ua',
    name: 'Ukrainian',
    flag: UKRAINIAN_FLAG,
    heroBadge: 'Ukrainian Course',
    heroTitle: 'Connect with Ukraine. Melodic & Powerful',
    heroDesc: 'Explore Ukrainian language, dynamic culture, and native conversational models. Ideal for heritage speakers and language explorers.',
    programSteps: [
      { step: 1, title: 'Melodic Beginnings', desc: 'Learn Cyrillic alphabet, correct phonetic models, and core everyday survival vocabulary.' },
      { step: 2, title: 'Cultural Connection', desc: 'Dive into local idioms, classic heritage stories, and natural conversational exchange frameworks.' },
      { step: 3, title: 'Expressive Fluency', desc: 'Master complex aspect cases, media comprehension, and speak confidently with native communities.' },
    ],
    pricingPlans: [
      { id: 'free', title: 'First Free Lesson', price: 'Free', period: '/ 40 min session', rating: '5.0', reviews: '48', desc: 'Perfect for testing our platform and outlining your speaking roadmap.', popular: false, features: ['1-on-1 Placement Lesson', 'Custom Speaking Assessment', 'Tailored Study Plan'], btnText: 'Book Free Lesson', btnPrice: '0', btnLessons: '1' },
      { id: 'beginners', title: 'For Beginners (A1-A2)', price: '$12', period: '/ 1hr Lesson', rating: '4.9', reviews: '124', desc: 'Learn Ukrainian from the ground up with engaging lessons designed for effective communication.', popular: true, discount: 'Save BIG: Buy 10 lessons for just $11/hr!', features: ['Basic Grammar', 'Essential Vocabulary', 'Pronunciation Training', 'Everyday Conversations'], btnText: 'Start Learning', btnPrice: '110', btnLessons: '10' },
      { id: 'communication', title: 'For Communication', price: '$12', period: '/ 1hr Lesson', rating: '4.8', reviews: '96', desc: 'Build confidence in speaking Ukrainian through interactive lessons and real-life scenarios.', popular: false, features: ['Speaking Practice', 'Modern Vocabulary', 'Listening Activities', 'Pronunciation Improvement'], btnText: 'Improve Your Speaking', btnPrice: '12', btnLessons: '1' },
    ],
    quizBadge: 'Ukrainian Speaking Flow',
    contactTitle: 'Book Your Placement Lesson',
    contactDesc: 'Ready to start your customized road path? Complete our short registration form and our coordinators will reach out in 2 hours.',
  },
};

export const validLangs = ['english', 'german', 'ukrainian'];

export const translations: Record<string, Record<string, string>> = {
  en: {
    nav_home: 'Home',
    nav_about: 'About us',
    nav_languages: 'Languages',
    nav_reviews: 'Reviews',
    nav_contact: 'Contact',
    nav_cta: 'Get started',
    nav_signin: 'Sign In',
    course_syllabus_title: 'What You Will Master',
    course_syllabus_desc: 'Our highly immersive curriculum is broken into progressive syllabus checkpoints built for speaking fluency.',
    pricing_tag: 'Pricing Plans',
    pricing_btn_start: 'Book Free Placement',
    pricing_title: 'Choose Your Path',
    pricing_desc: 'Flexible plans for every goal. Start with a free lesson, then pick the package that fits your ambitions.',
    form_label_name: 'Full Name',
    form_label_email: 'Email Address',
    form_label_phone: 'Phone Number',
    form_label_lang: 'Target Language',
    form_label_level: 'Current Level',
    form_label_msg: 'Special Requirements / Goals',
    placeholder_name: 'John Doe',
    placeholder_email: 'john@example.com',
    placeholder_phone: '+380759648499',
    placeholder_msg: 'Tell us about your learning goals...',
    select_lang_placeholder: 'Select Language',
    select_level_placeholder: 'Select Level',
    option_level_0: 'Absolute Beginner (A0)',
    option_level_1: 'Elementary (A1-A2)',
    option_level_2: 'Intermediate (B1-B2)',
    option_level_3: 'Advanced (C1-C2)',
    form_btn: 'Book Free Placement Lesson',
    course_book_title: 'Book Your Placement Lesson',
    course_book_desc: 'Ready to start your customized road path? Complete our short registration form and our coordinators will reach out in 2 hours.',
    contact_email_title: 'Email Us Directly',
    contact_phone_title: 'Call Our Support',
    contact_phone: '+380759648499',
    contact_email: 'novaflowschool@gmail.com',
    quiz_title_1: 'What language do you want to master?',
    quiz_opt_1a: 'English Course',
    quiz_opt_1b: 'German Course',
    quiz_opt_1c: 'Ukrainian Course',
    quiz_title_2: 'What is your primary learning goal?',
    quiz_opt_2a: 'Career progress / Job interviews',
    quiz_opt_2b: 'Travel or international relocation',
    quiz_opt_2c: 'Conversing with relatives / Interest',
    quiz_title_3: 'How much time can you dedicate daily?',
    quiz_opt_3a: '15 minutes - Light Flow path',
    quiz_opt_3b: '30 minutes - Recommended Regular path',
    quiz_opt_3c: '1 hour+ - Intensive Immersion path',
    quiz_result_title: 'Your Custom Roadmap is Ready!',
    quiz_btn_book: 'Book Free Roadmap Session',
    badge_popular: 'Popular',
    btn_book_free: 'Book Free Lesson',
  },
  uk: {
    nav_home: 'Головна',
    nav_about: 'Про нас',
    nav_languages: 'Мови',
    nav_reviews: 'Відгуки',
    nav_contact: 'Контакти',
    nav_cta: 'Розпочати',
    nav_signin: 'Увійти',
    course_syllabus_title: 'Програма навчання',
    course_syllabus_desc: 'Наша інтенсивна програма розділена на логічні етапи навчання, спрямовані на швидке досягнення розмовної свободи.',
    pricing_tag: 'Ціни та плани',
    pricing_btn_start: 'Пройти оцінку рівня',
    pricing_title: 'Оберіть свій шлях',
    pricing_desc: 'Гнучкі плани для будь-якої мети. Почніть з безкоштовного уроку, а потім оберіть пакет, який підходить саме вам.',
    form_label_name: "Повне ім'я",
    form_label_email: 'Електронна пошта',
    form_label_phone: 'Номер телефону',
    form_label_lang: 'Мова навчання',
    form_label_level: 'Поточний рівень',
    form_label_msg: 'Особливі побажання / Цілі',
    placeholder_name: 'Іван Петренко',
    placeholder_email: 'ivan@example.com',
    placeholder_phone: '+380759648499',
    placeholder_msg: 'Розкажіть про ваші навчальні цілі...',
    select_lang_placeholder: 'Оберіть мову',
    select_level_placeholder: 'Оберіть рівень',
    option_level_0: 'Абсолютний початківець (A0)',
    option_level_1: 'Елементарний (A1-A2)',
    option_level_2: 'Середній (B1-B2)',
    option_level_3: 'Просунутий (C1-C2)',
    form_btn: 'Записатись на безкоштовний урок',
    course_book_title: 'Запишіться на вступний урок',
    course_book_desc: 'Готові розпочати навчання за індивідуальною програмою? Заповніть форму, і наш координатор зв\'яжеться з вами протягом 2 годин.',
    contact_email_title: 'Напишіть нам напряму',
    contact_phone_title: 'Зателефонуйте у підтримку',
    contact_phone: '+380759648499',
    contact_email: 'novaflowschool@gmail.com',
    quiz_title_1: 'Яку мову ви бажаєте вивчати?',
    quiz_opt_1a: 'Курс англійської мови',
    quiz_opt_1b: 'Курс німецької мови',
    quiz_opt_1c: 'Курс української мови',
    quiz_title_2: 'Яка ваша основна мета навчання?',
    quiz_opt_2a: 'Розвиток кар\'єри / Співбесіди',
    quiz_opt_2b: 'Подорожі або переїзд за кордон',
    quiz_opt_2c: 'Спілкування з родиною / Особистий інтерес',
    quiz_title_3: 'Скільки часу ви готові приділяти щодня?',
    quiz_opt_3a: '15 хвилин — Легкий темп',
    quiz_opt_3b: '30 хвилин — Рекомендований оптимальний темп',
    quiz_opt_3c: '1 година+ — Інтенсивне занурення',
    quiz_result_title: 'Ваш індивідуальний план готовий!',
    quiz_btn_book: 'Забронювати безкоштовне заняття',
    badge_popular: 'Популярний',
    btn_book_free: 'Записатися безкоштовно',
  },
  de: {
    nav_home: 'Startseite',
    nav_about: 'Über uns',
    nav_languages: 'Sprachen',
    nav_reviews: 'Bewertungen',
    nav_contact: 'Kontakt',
    nav_cta: 'Jetzt starten',
    nav_signin: 'Einloggen',
    course_syllabus_title: 'Lehrplan',
    course_syllabus_desc: 'Unser intensiver Lehrplan ist in aufeinander aufbauende Module unterteilt, die auf fließendes Sprechen ausgelegt sind.',
    pricing_tag: 'Preise & Pläne',
    pricing_btn_start: 'Kostenlosen Einstufungstest machen',
    pricing_title: 'Wählen Sie Ihren Weg',
    pricing_desc: 'Flexible Pläne für jedes Ziel. Beginnen Sie mit einer kostenlosen Stunde und wählen Sie dann das Paket, das zu Ihren Ambitionen passt.',
    form_label_name: 'Vollständiger Name',
    form_label_email: 'E-Mail-Adresse',
    form_label_phone: 'Telefonnummer',
    form_label_lang: 'Zielsprache',
    form_label_level: 'Aktuelles Niveau',
    form_label_msg: 'Besondere Anforderungen / Ziele',
    placeholder_name: 'Max Mustermann',
    placeholder_email: 'max@example.com',
    placeholder_phone: '+380759648499',
    placeholder_msg: 'Erzählen Sie uns von Ihren Lernzielen...',
    select_lang_placeholder: 'Sprache auswählen',
    select_level_placeholder: 'Niveau auswählen',
    option_level_0: 'Absoluter Anfänger (A0)',
    option_level_1: 'Grundstufe (A1-A2)',
    option_level_2: 'Mittelstufe (B1-B2)',
    option_level_3: 'Fortgeschritten (C1-C2)',
    form_btn: 'Kostenlose Probestunde buchen',
    course_book_title: 'Buchen Sie Ihre Einstufungslektion',
    course_book_desc: 'Bereit für Ihren maßgeschneiderten Lernpfad? Füllen Sie das kurze Formular aus und wir melden uns innerhalb von 2 Stunden.',
    contact_email_title: 'Schreiben Sie uns direkt',
    contact_phone_title: 'Rufen Sie unseren Support an',
    contact_phone: '+380759648499',
    contact_email: 'novaflowschool@gmail.com',
    quiz_title_1: 'Welche Sprache möchten Sie meistern?',
    quiz_opt_1a: 'Englisch Kurs',
    quiz_opt_1b: 'Deutsch Kurs',
    quiz_opt_1c: 'Ukrainisch Kurs',
    quiz_title_2: 'Was ist Ihr primäres Lernziel?',
    quiz_opt_2a: 'Karrierefortschritt / Vorstellungsgespräche',
    quiz_opt_2b: 'Reisen oder Auswanderung',
    quiz_opt_2c: 'Gespräche mit Verwandten / Interesse',
    quiz_title_3: 'Wie viel Zeit können Sie täglich investieren?',
    quiz_opt_3a: '15 Minuten - Entspannter Lernfluss',
    quiz_opt_3b: '30 Minuten - Empfohlener regulärer Pfad',
    quiz_opt_3c: '1 Stunde+ - Intensives Eintauchen',
    quiz_result_title: 'Ihr individueller Lernpfad ist bereit!',
    quiz_btn_book: 'Kostenlose Beratung buchen',
    badge_popular: 'Beliebt',
    btn_book_free: 'Kostenlose Probestunde buchen',
  },
};