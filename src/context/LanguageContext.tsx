'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'uk' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const landingTranslations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_about: "About us",
    nav_languages: "Languages",
    nav_reviews: "Reviews",
    nav_contact: "Contact",
    nav_cta: "Get started",
    nav_signin: "Sign In",

    // Hero Section
    hero_title: "Build Your <span class=\"purple-gradient-text\">Language</span> <span class=\"purple-gradient-text\">Flow</span>. Change Your Life",
    hero_bullet_1: "Personalized learning paths",
    hero_bullet_2: "Flexible schedules for busy lives",
    hero_bullet_3: "Real-world speaking practice",
    hero_bullet_4: "Fast visible progress in 30 days",
    hero_cta: "Start your Journey",

    // About Section / Features
    about_title: "Accelerate Your Path to Language Mastery",
    about_desc: "Our proven methodology combines modern technology with human-centric teaching to deliver results faster.",
    feature_personalized_title: "Personalized Learning",
    feature_personalized_desc: "A custom curriculum built entirely around your personal goals, interests, and current language level.",
    feature_flexible_title: "Flexible Schedule",
    feature_flexible_desc: "Book, move, or reschedule your interactive lessons easily to perfectly fit your daily life and routine.",
    feature_speaking_title: "Real Speaking",
    feature_speaking_desc: "Skip the boring grammar drills. Start speaking from day one through realistic everyday life scenarios.",
    feature_progress_title: "Fast Progress",
    feature_progress_desc: "Track your results and see a massive boost in your fluency and speaking confidence within the first 30 days.",

    // Teacher Section
    teacher_title: "Meet Your Guide to <span class=\"text-purple-600\">Fluency</span>",
    teacher_p1: "English changed opportunities into reality for thousands of people — better careers, international connections, travel, confidence, and freedom. My mission is to help you achieve the same.",
    teacher_p2: "My name is Kyrylo, I'm the founder of NovaFlow Language School, and I created this platform for one reason: most people spend years \"studying\" English without ever feeling confident enough to actually speak it.",
    teacher_p3: "At NovaFlow, we do things differently. No boring school-style lessons. No memorizing endless rules without practice. No feeling stuck.",
    teacher_p4: "Our students learn through real conversations, modern interactive methods, and a system designed to help you speak naturally and confidently from the very beginning. Every lesson is built to create visible progress, keep motivation high, and make language learning feel exciting instead of stressful.",
    teacher_p5: "Whether your goal is to travel, study abroad, build an international career, pass exams, or finally speak English without hesitation — NovaFlow is designed to get you there faster and more effectively.",
    teacher_quote: "This is more than a language course. It's a new level of confidence, new opportunities, and a new version of yourself.",
    teacher_cta_line: "Your language flow starts here.",
    stat_years: "5+ Years",
    stat_years_label: "Professional Teaching",
    stat_students: "200+",
    stat_students_label: "Successful Students",
    stat_immersive: "95%",
    stat_immersive_label: "Immersive Lessons",

    // Certifications Section
    certs_subtitle: "Academic Excellence",
    certs_title: "Certifications & Qualifications",
    certs_desc: "A comprehensive portfolio of approved international credentials, verifying advanced pedagogical expertise and professional linguistic mastery.",
    cert_badge_pedagogy: "Pedagogy",
    cert_tefl_name: "TEFL / TESOL Certification",
    cert_tefl_inst: "International TEFL Academy",
    cert_badge_instruction: "English Instruction",
    cert_celta_name: "Cambridge CELTA",
    cert_celta_inst: "University of Cambridge ESOL",
    cert_badge_psychology: "Psychology & Safety",
    cert_psychology_name: "Advanced Classroom Psychology & Student Care",
    cert_psychology_inst: "British Council — Future English Programme",
    cert_view_original: "View Original →",
    cert_view_certs_3: "View Certificates (3) →",
    auth_verified_title: "Verified Authenticity",
    auth_verified_desc: "All credentials are verified through direct institutional portals.",

    // Languages Section
    lang_tag: "Languages",
    lang_title: "Courses We Teach",
    lang_desc: "Unlock massive professional and personal opportunities by mastering one of our high-demand core languages.",
    course_en_title: "English",
    course_en_desc: "From corporate negotiations to international travel, gain full command of global conversation, grammar nuances, and dynamic speaking skills.",
    course_de_title: "German",
    course_de_desc: "Unlock career progress in Germany, Austria, and Switzerland. Focus heavily on precise grammar structure, sentence models, and workplace vocabulary.",
    course_ua_title: "Ukrainian",
    course_ua_desc: "Connect with rich culture, local heritage, and speaking communities. Perfect for absolute beginners and heritage speakers looking to build core conversational confidence.",
    course_levels_all: "All Levels (A1-C2)",
    course_levels_de: "All Levels (A1-B2)",
    course_levels_ua: "A1 - B2 Levels",
    course_lessons_30: "3 courses",
    course_lessons_25: "5 courses",
    course_lessons_35: "3 courses",
    explore_course: "Explore Course",

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

    // Level Test Section
    level_test_tag: "Free Assessment",
    level_test_title: "Find Out Your Exact Language Level",
    level_test_desc: "Take a quick, interactive test in just 10-15 minutes on the professional assessment platform Testizer. Discover your strengths and select the perfect course path.",
    level_test_feat1: "100% Free & Fast",
    level_test_feat2: "Grammar & Vocab Check",
    level_test_feat3: "Immediate CEFR Score",
    level_test_btn_text: "Start Free Test",

    // Contact Section
    contact_title: "Start Your Flow Today",
    contact_desc: "Ready to transform your communication skills? Book your free 1-on-1 placement lesson with one of our certified trainers. We'll assess your speaking level and design your custom roadmap.",
    contact_email_title: "Email Us Directly",
    contact_phone_title: "Call Our Support",
    form_label_name: "Full Name",
    form_label_phone: "Phone Number",
    form_label_email: "Email Address",
    form_label_lang: "Target Language",
    form_label_level: "Current Level",
    form_label_msg: "Special Requirements / Goals",
    placeholder_name: "John Doe",
    placeholder_phone: "+380 (50) 123-45-67",
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
    footer_about: "About Us",
    footer_languages: "Languages",
    footer_reviews: "Student Reviews",
    footer_contact: "Contact Support",
    footer_terms: "Terms of Use",
    footer_privacy: "Privacy Policy",
    footer_cookies: "Cookies Setting",
    footer_sitemap: "Sitemap"
  },
  uk: {
    // Navigation
    nav_home: "Головна",
    nav_about: "Про нас",
    nav_languages: "Мови",
    nav_reviews: "Відгуки",
    nav_contact: "Контакти",
    nav_cta: "Розпочати",
    nav_signin: "Увійти",

    // Hero Section
    hero_title: "Опануй <span class=\"purple-gradient-text\">мову</span> вільно. Відкрий нові <span class=\"purple-gradient-text\">можливості</span>.",
    hero_bullet_1: "Персоналізовані навчальні програми",
    hero_bullet_2: "Гнучкий графік для насиченого життя",
    hero_bullet_3: "Реальна розмовна практика",
    hero_bullet_4: "Помітний прогрес вже за 30 днів",
    hero_cta: "Почати навчання",

    // About Section / Features
    about_title: "Прискорте свій шлях до володіння мовою",
    about_desc: "Наша перевірена методика поєднує сучасні технології та орієнтований на людину підхід для досягнення швидких результатів.",
    feature_personalized_title: "Персоналізоване навчання",
    feature_personalized_desc: "Індивідуальна навчальна програма, побудована виключно навколо ваших цілей, інтересів та поточного рівня володіння мовою.",
    feature_flexible_title: "Гнучкий графік",
    feature_flexible_desc: "Легко бронюйте, переносьте або скасовуйте свої інтерактивні заняття, щоб вони ідеально вписувалися у ваш щоденний ритм життя.",
    feature_speaking_title: "Реальна розмовна мова",
    feature_speaking_desc: "Забудьте про нудні граматичні вправи. Почніть розмовляти з першого дня на прикладі реальних життєвих сценаріїв.",
    feature_progress_title: "Швидкий прогрес",
    feature_progress_desc: "Відстежуйте свої результати та відчуйте значний приплив впевненості у спілкуванні вже протягом перших 30 днів.",

    // Teacher Section
    teacher_title: "Зустрічай того, хто відкриє твою <span class=\"text-purple-600\">мовну свободу</span>",
    teacher_p1: "Англійська перетворила мрії на реальність для тисяч людей: дала кращу кар'єру, міжнародні зв'язки, подорожі, впевненість та свободу. Моя місія — допомогти вам досягти того ж самого.",
    teacher_p2: "Мене звати Кирило, я засновник мовної школи NovaFlow. Я створив цю платформу з однієї причини: більшість людей витрачають роки на \"вивчення\" англійської, але так і не відчувають впевненості, щоб заговорити.",
    teacher_p3: "У NovaFlow ми працюємо зовсім інакше. Жодних нудних шкільних уроків. Жодного зубріння нескінченних правил без практики. Жодних мовних бар'єрів.",
    teacher_p4: "Наші студенти навчаються через живі розмови, сучасні інтерактивні методи та систему, яка допомагає говорити природно та невимушено з самого початку. Кожне заняття спрямоване на те, щоб ви бачили реальний прогрес, зберігали високу мотивацію, а навчання приносило задоволення, а не стрес.",
    teacher_p5: "Незалежно від того, чи є ваша ціль подорожі, навчання за кордоном, побудова міжнародної кар'єри, складання іспитів або просто бажання вільно спілкуватися без вагань — NovaFlow створена, щоб ви досягли цього швидше та ефективніше.",
    teacher_quote: "Це більше ніж просто мовний курс. Це новий рівень впевненості, нові горизонти та нова версія вас самих.",
    teacher_cta_line: "Ваш мовний потік починається тут.",
    stat_years: "5+ років",
    stat_years_label: "Викладацького досвіду",
    stat_students: "200+",
    stat_students_label: "Успішних студентів",
    stat_immersive: "95%",
    stat_immersive_label: "Практичних занять",

    // Certifications Section
    certs_subtitle: "Академічна якість",
    certs_title: "Сертифікати та кваліфікація",
    certs_desc: "Широке портфоліо офіційних міжнародних сертифікатів, що підтверджують високу педагогічну експертизу та професійне володіння мовою.",
    cert_badge_pedagogy: "Педагогіка",
    cert_tefl_name: "Сертифікат TEFL / TESOL",
    cert_tefl_inst: "Міжнародна академія TEFL",
    cert_badge_instruction: "Викладання англійської",
    cert_celta_name: "Cambridge CELTA",
    cert_celta_inst: "Кембриджський університет ESOL",
    cert_badge_psychology: "Психологія та безпека",
    cert_psychology_name: "Курс психології навчання та підтримки студентів",
    cert_psychology_inst: "Британська Рада — Програма Future English",
    cert_view_original: "Дивитись оригінал →",
    cert_view_certs_3: "Дивитись сертифікати (3) →",
    auth_verified_title: "Перевірена автентичність",
    auth_verified_desc: "Усі кваліфікаційні документи офіційно верифіковані через сертифікаційні портали установ.",

    // Languages Section
    lang_tag: "Мови",
    lang_title: "Курси, які ми викладаємо",
    lang_desc: "Відкрийте для себе масштабні професійні та особисті можливості, опанувавши одну з наших основних затребуваних мов.",
    course_en_title: "Англійська",
    course_en_desc: "Від бізнес-переговорів до подорожей по всьому світу. Опануйте вільне спілкування, тонкощі граматики та навички динамічної презентації.",
    course_de_title: "Німецька",
    course_de_desc: "Відкрийте нові кар'єрні можливості в Німеччині, Австрії та Швейцарії. Фокус на точній граматиці, мовних моделях та діловій лексиці.",
    course_ua_title: "Українська мова",
    course_ua_desc: "Доторкніться до багатої культури, традицій та мовної спільноти. Ідеально підходить для початківців та тих, хто хоче розширити свої розмовні навички.",
    course_levels_all: "Усі рівні (A1-C2)",
    course_levels_de: "Усі рівні (A1-B2)",
    course_levels_ua: "Рівні A1 - B2",
    course_lessons_30: "3 курси",
    course_lessons_25: "5 курсів",
    course_lessons_35: "3 курси",
    explore_course: "Детальніше про курс",

    // Reviews Section
    reviews_tag: "Відгуки",
    reviews_title: "Що говорять наші студенти",
    reviews_desc: "Тисячі студентів вже подолали мовний бар'єр завдяки нашій індивідуальній розмовній карті навчання.",
    form_review_title: "Поділіться своїм досвідом",
    form_review_desc: "Ваш відгук допоможе іншим зробити правильний вибір.",
    form_rating_label: "Ваша оцінка:",
    form_name_placeholder: "Ваше повне ім'я",
    form_text_placeholder: "Напишіть свій відгук...",
    form_submit_btn: "Надіслати відгук",

    // Level Test Section
    level_test_tag: "Безкоштовна Оцінка",
    level_test_title: "Визначте свій точний рівень мови",
    level_test_desc: "Пройдіть швидкий інтерактивний тест за 10-15 хвилин на професійній платформі оцінювання Testizer. Дізнайтеся свої сильні сторони та оберіть ідеальний план навчання.",
    level_test_feat1: "100% Безкоштовно та Швидко",
    level_test_feat2: "Перевірка граматики та лексики",
    level_test_feat3: "Миттєвий результат за CEFR",
    level_test_btn_text: "Розпочати безкоштовний тест",

    // Contact Section
    contact_title: "Розпочніть свій шлях сьогодні",
    contact_desc: "Готові трансформувати свої комунікативні навички? Запишіться на безкоштовне індивідуальне вступне заняття з сертифікованим викладачем. Ми визначимо ваш рівень та розробимо персональну програму.",
    contact_email_title: "Напишіть нам напряму",
    contact_phone_title: "Зателефонуйте у підтримку",
    form_label_name: "Повне ім'я",
    form_label_phone: "Номер телефону",
    form_label_email: "Електронна пошта",
    form_label_lang: "Мова навчання",
    form_label_level: "Поточний рівень",
    form_label_msg: "Особливі побажання / Цілі",
    placeholder_name: "Іван Петренко",
    placeholder_phone: "+380 (50) 123-45-67",
    placeholder_email: "ivan@example.com",
    select_lang_placeholder: "Оберіть мову",
    select_level_placeholder: "Оберіть рівень",
    option_level_0: "Абсолютний початківець (A0)",
    option_level_1: "Елементарний (A1-A2)",
    option_level_2: "Середній (B1-B2)",
    option_level_3: "Просунутий (C1-C2)",
    placeholder_msg: "Розкажіть про ваші навчальні цілі...",
    form_btn: "Записатись на безкоштовний урок",
    form_success: "🎉 Вітаємо! Ваш запит успішно надіслано. Ми зв'яжемося з вами протягом 2 годин для підтвердження часу консультації.",

    // Footer
    footer_desc: "Розвиваємо впевнене розмовне мовлення в усьому світі за допомогою передових методик занурення та гнучких мобільних рішень.",
    footer_col_school: "Школа",
    footer_col_legal: "Юридична інформація",
    footer_col_newsletter: "Розсилка новин",
    footer_newsletter_desc: "Підпишіться, щоб отримувати щотижневі добірки лексики, корисні матеріали та спеціальні акційні пропозиції.",
    newsletter_placeholder: "Ваша електронна адреса",
    newsletter_btn: "Приєднатися",
    footer_copy: "© 2026 Мовна школа NovaFlow. Всі права захищені.",
    footer_about: "Про нас",
    footer_languages: "Курси мов",
    footer_reviews: "Відгуки студентів",
    footer_contact: "Служба підтримки",
    footer_terms: "Умови використання",
    footer_privacy: "Політика конфіденційності",
    footer_cookies: "Налаштування файлів cookies",
    footer_sitemap: "Карта сайту"
  },
  de: {
    // Navigation
    nav_home: "Startseite",
    nav_about: "Über uns",
    nav_languages: "Sprachen",
    nav_reviews: "Bewertungen",
    nav_contact: "Kontakt",
    nav_cta: "Jetzt starten",
    nav_signin: "Einloggen",

    // Hero Section
    hero_title: "Sprich mit <span class=\"purple-gradient-text\">Selbstvertrauen</span>. Verändere dein <span class=\"purple-gradient-text\">Leben</span>.",
    hero_bullet_1: "Personalisierte Lernpfade",
    hero_bullet_2: "Flexible Zeitpläne für vielbeschäftigte Menschen",
    hero_bullet_3: "Praktische Sprechübungen in realen Situationen",
    hero_bullet_4: "Schnelle Fortschritte in 30 Tagen",
    hero_cta: "Starten Sie Ihre Reise",

    // About Section / Features
    about_title: "Beschleunigen Sie Ihren Weg zur Sprachbeherrschung",
    about_desc: "Unsere bewährte Methodik verbindet moderne Technologie mit benutzerorientierten Unterrichtsmethoden für schnellere Ergebnisse.",
    feature_personalized_title: "Personalisiertes Lernen",
    feature_personalized_desc: "Ein maßgeschneiderter Lehrplan, der ganz auf Ihre persönlichen Ziele, Interessen und Ihr aktuelles Sprachniveau abgestimmt ist.",
    feature_flexible_title: "Flexibler Zeitplan",
    feature_flexible_desc: "Buchen, verschieben oder stornieren Sie Ihre interaktiven Lektionen ganz einfach, so dass sie perfekt in Ihren Alltag passen.",
    feature_speaking_title: "Echtes Sprechen",
    feature_speaking_desc: "Vergessen Sie langweilige Grammatikübungen. Beginnen Sie vom ersten Tag an anhand von realen Alltagsszenarien zu sprechen.",
    feature_progress_title: "Schneller Fortschritt",
    feature_progress_desc: "Verfolgen Sie Ihre Ergebnisse und spüren Sie bereits in den ersten 30 Tagen eine deutliche Steigerung Ihrer Redefreiheit.",

    // Teacher Section
    teacher_title: "Triff deinen Wegweiser zu deiner <span class=\"text-purple-600\">Sprachfreiheit</span>",
    teacher_p1: "Englisch hat für Tausende von Menschen Chancen in die Realität umgesetzt — bessere Karrieren, internationale Kontakte, Reisen, Selbstvertrauen und Freiheit. Meine Mission ist es, Ihnen dabei zu helfen, dasselbe zu erreichen.",
    teacher_p2: "Mein Name ist Kyrylo, ich bin der Gründer der NovaFlow Sprachschule. Ich habe diese Plattform aus einem einzigen Grund ins Leben gerufen: Die meisten Menschen verbringen Jahre damit, Englisch zu \"lernen\", fühlen sich aber nie sicher genug, um tatsächlich zu sprechen.",
    teacher_p3: "Bei NovaFlow machen wir die Dinge anders. Kein langweiliger Schulunterricht. Kein Auswendiglernen endloser Regeln ohne Praxis. Keine Blockaden.",
    teacher_p4: "Unsere Schüler lernen durch echte Gespräche, moderne interaktive Methoden und ein System, das Ihnen hilft, von Anfang an natürlich und selbstbewusst zu sprechen. Jede Lektion ist darauf ausgelegt, sichtbare Fortschritte zu erzielen, die Motivation hoch zu halten und das Sprachenlernen spannend statt stressig zu gestalten.",
    teacher_p5: "Ob Ihr Ziel eine Reise, ein Auslandsstudium, der Aufbau einer internationalen Karriere, das Bestehen von Prüfungen oder einfach das zögerungsfreie Sprechen ist — NovaFlow bringt Sie schneller und effektiver ans Ziel.",
    teacher_quote: "Dies ist mehr als ein Sprachkurs. Es ist ein neues Niveau an Selbstvertrauen, neue Möglichkeiten und eine neue Version Ihrer selbst.",
    teacher_cta_line: "Ihr Sprachfluss beginnt hier.",
    stat_years: "5+ Jahre",
    stat_years_label: "Lehrerfahrung",
    stat_students: "200+",
    stat_students_label: "Erfolgreiche Schüler",
    stat_immersive: "95%",
    stat_immersive_label: "Interaktive Lektionen",

    // Certifications Section
    certs_subtitle: "Akademische Exzellenz",
    certs_title: "Zertifikate & Qualifikationen",
    certs_desc: "Ein umfassendes Portfolio an anerkannten internationalen Zertifikaten, die fortgeschrittene pädagogische Expertise und professionelle Sprachbeherrschung belegen.",
    cert_badge_pedagogy: "Pädagogik",
    cert_tefl_name: "TEFL / TESOL Zertifizierung",
    cert_tefl_inst: "Internationale TEFL-Akademie",
    cert_badge_instruction: "Englischunterricht",
    cert_celta_name: "Cambridge CELTA",
    cert_celta_inst: "Universität Cambridge ESOL",
    cert_badge_psychology: "Psychologie & Sicherheit",
    cert_psychology_name: "Fortgeschrittene Klassenzimmerpsychologie & Schülerbetreuung",
    cert_psychology_inst: "British Council — Future English Programm",
    cert_view_original: "Original ansehen →",
    cert_view_certs_3: "Zertifikate ansehen (3) →",
    auth_verified_title: "Verifizierte Echtheit",
    auth_verified_desc: "Alle Qualifikationsdokumente sind direkt über institutionelle Portale verifiziert.",

    // Languages Section
    lang_tag: "Sprachen",
    lang_title: "Sprachen, die wir unterrichten",
    lang_desc: "Erschließen Sie sich enorme berufliche und persönliche Möglichkeiten, indem Sie eine unserer stark nachgefragten Hauptsprachen beherrschen.",
    course_en_title: "Englisch",
    course_en_desc: "Von Geschäftsverhandlungen bis zu internationalen Reisen – erlangen Sie die volle Kontrolle über Gespräche, grammatikalische Feinheiten und dynamisches Sprechen.",
    course_de_title: "Deutsch",
    course_de_desc: "Erschließen Sie sich berufliche Aufstiegschancen in Deutschland, Österreich und der Schweiz. Fokus auf präziser Grammatik, Satzstrukturen und Fachvokabular.",
    course_ua_title: "Ukrainisch",
    course_ua_desc: "Verbinden Sie sich mit reicher Kultur, Traditionen und einer lebendigen Sprechgemeinschaft. Perfekt für Anfänger und Wiedereinsteiger.",
    course_levels_all: "Alle Niveaus (A1-C2)",
    course_levels_de: "Alle Niveaus (A1-B2)",
    course_levels_ua: "Niveaus A1 - B2",
    course_lessons_30: "3 Kurse",
    course_lessons_25: "5 Kurse",
    course_lessons_35: "3 Kurse",
    explore_course: "Kurs erkunden",

    // Reviews Section
    reviews_tag: "Bewertungen",
    reviews_title: "Was unsere Schüler sagen",
    reviews_desc: "Tausende von Schülern haben ihren weg zur Flüssigkeit mit unserer personalisierten Lernkarte beschleunigt.",
    form_review_title: "Teilen Sie Ihre Erfahrung",
    form_review_desc: "Ihr Feedback hilft anderen, die richtige Wahl zu treffen.",
    form_rating_label: "Ihre Bewertung:",
    form_name_placeholder: "Ihr vollständiger Name",
    form_text_placeholder: "Schreiben Sie Ihre Bewertung...",
    form_submit_btn: "Bewertung absenden",

    // Level Test Section
    level_test_tag: "Kostenlose Bewertung",
    level_test_title: "Finden Sie Ihr genaues Sprachniveau heraus",
    level_test_desc: "Machen Sie in nur 10-15 Minuten einen schnellen, interaktiven Test auf der professionellen Bewertungsplattform Testizer. Entdecken Sie Ihre Stärken und wählen Sie den perfekten Kurspfad.",
    level_test_feat1: "100% kostenlos & schnell",
    level_test_feat2: "Grammatik- & Vokabeltest",
    level_test_feat3: "Sofortiges CEFR-Ergebnis",
    level_test_btn_text: "Kostenlosen Test starten",

    // Contact Section
    contact_title: "Beginnen Sie heute Ihren Flow",
    contact_desc: "Bereit, Ihre Kommunikationsfähigkeiten zu verbessern? Buchen Sie Ihre kostenlose 1-zu-1-Probestunde mit einem unserer zertifizierten Trainer. Wir bewerten Ihr Sprachniveau und erstellen Ihren individuellen Lernplan.",
    contact_email_title: "Schreiben Sie uns direkt",
    contact_phone_title: "Rufen Sie unseren Support an",
    form_label_name: "Vollständiger Name",
    form_label_phone: "Telefonnummer",
    form_label_email: "E-Mail-Adresse",
    form_label_lang: "Zielsprache",
    form_label_level: "Aktuelles Niveau",
    form_label_msg: "Besondere Anforderungen / Ziele",
    placeholder_name: "Max Mustermann",
    placeholder_phone: "+380 (50) 123-45-67",
    placeholder_email: "max@example.com",
    select_lang_placeholder: "Sprache auswählen",
    select_level_placeholder: "Niveau auswählen",
    option_level_0: "Absoluter Anfänger (A0)",
    option_level_1: "Grundstufe (A1-A2)",
    option_level_2: "Mittelstufe (B1-B2)",
    option_level_3: "Fortgeschritten (C1-C2)",
    placeholder_msg: "Erzählen Sie uns von Ihren Lernzielen...",
    form_btn: "Kostenlose Probestunde buchen",
    form_success: "🎉 Herzlichen Glückwunsch! Ihre Anfrage wurde gesendet. Wir werden Ihnen innerhalb von 2 ostd. eine E-Mail senden, um Ihre Beratungszeit zu bestätigen.",

    // Footer
    footer_desc: "Förderung des Sprachflusses weltweit durch hochmoderne Unterrichtsmethoden und flexible mobile Plattformen.",
    footer_col_school: "Schule",
    footer_col_legal: "Rechtliches",
    footer_col_newsletter: "Newsletter",
    footer_newsletter_desc: "Abonnieren Sie, um wöchentliche Vokabel-Updates, Ressourcen und Benachrichtigungen zu speziellen Testangeboten zu erhalten.",
    newsletter_placeholder: "Ihre E-Mail-Adresse",
    newsletter_btn: "Beitreten",
    footer_copy: "© 2026 NovaFlow Sprachschule. Alle Rechte vorbehalten.",
    footer_about: "Über uns",
    footer_languages: "Sprachen",
    footer_reviews: "Studenten-Bewertungen",
    footer_contact: "Support kontaktieren",
    footer_terms: "Nutzungsbedingungen",
    footer_privacy: "Datenschutzerklärung",
    footer_cookies: "Cookie-Einstellungen",
    footer_sitemap: "Sitemap"
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('novaflowLang') as Language;
    if (saved && (saved === 'en' || saved === 'uk' || saved === 'de')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('novaflowLang', lang);
  };

  const t = (key: string) => {
    return landingTranslations[language]?.[key] || landingTranslations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
