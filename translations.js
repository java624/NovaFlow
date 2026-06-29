/**
 * File: translations.js
 * Purpose: handle language switching with in-page translation updates
 */

// Translation dictionary
const translations = {
  en: {
    // Page titles
    page_title_index: "NovaFlow Language School",
    page_title_english: "NovaFlow Language School - English Course",
    page_title_german: "NovaFlow Language School - German Course",
    page_title_ukrainian: "NovaFlow Language School - Ukrainian Course",

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
    teacher_photo_title: "Teacher's Photo",
    teacher_photo_subtitle: "Light background, smiling portrait",
    teacher_title: "Meet Your Guide to <span class=\"gradient-accent\">Fluency</span>",
    teacher_p1: "English changed opportunities into reality for thousands of people — better careers, international connections, travel, confidence, and freedom. My mission is to help you achieve the same.",
    teacher_p2: "My name is Kyrylo, I'm the founder of NovaFlow Language School, and I created this platform for one reason: most people spend years \"studying\" English without ever feeling confident enough to actually speak it.",
    teacher_p3: "At NovaFlow, we do things differently.<br><span class=\"sub-highlight\">No boring school-style lessons. No memorizing endless rules without practice. No feeling stuck.</span>",
    teacher_p4: "Our students learn through real conversations, modern interactive methods, and a system designed to help you speak naturally and confidently from the very beginning. Every lesson is built to create visible progress, keep motivation high, and make language learning feel exciting instead of stressful.",
    teacher_p5: "Whether your goal is to travel, study abroad, build an international career, pass exams, or finally speak English without hesitation — NovaFlow is designed to get you there faster and more effectively.",
    teacher_quote: "This is more than a language course. <br>It's a new level of confidence, new opportunities, and a new version of yourself.",
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
    contact_email_title: "Email Us Directly",
    contact_phone_title: "Call Our Support",
    form_label_name: "Full Name",
    form_label_phone: "Phone Number",
    form_label_email: "Email Address",
    form_label_lang: "Target Language",
    form_label_level: "Current Level",
    form_label_msg: "Special Requirements / Goals",
    placeholder_name: "John Doe",
    placeholder_phone: "+380759648499",
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
    level_test_tag: "Free Assessment",
    level_test_title: "Find Out Your Exact Language Level",
    level_test_desc: "Take a quick, interactive test in just 10-15 minutes on the professional assessment platform Testizer. Discover your strengths and select the perfect course path.",
    level_test_feat1: "100% Free & Fast",
    level_test_feat2: "Grammar & Vocab Check",
    level_test_feat3: "Immediate CEFR Score",
    level_test_btn_text: "Start Free Test",

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
    footer_sitemap: "Sitemap",

    // English Course Page Specific
    course_syllabus_title: "What You Will Master",
    pricing_tag: "Pricing Plans",
    course_en_badge: "English Course",
    course_en_hero_title: "Master <span class=\"purple-gradient-text\">English</span>. Speak with Global Impact",
    course_en_hero_desc: "Unlock global opportunities. Master advanced grammar, business presentation models, and professional speaking confidence with elite coaches.",
    pricing_btn_start: "Book Free Placement",
    course_syllabus_desc: "Our highly immersive curriculum is broken into progressive syllabus checkpoints built for speaking fluency.",
    prog_en_title1: "Core Communication",
    prog_en_desc1: "Build vocabulary essentials, daily dialogue agility, and absolute listening confidence from Day 1.",
    prog_en_title2: "Professional Agility",
    prog_en_desc2: "Master high-end business negotiations, mock resume reviews, and dynamic public presentation strategies.",
    prog_en_title3: "Advanced Mastery",
    prog_en_desc3: "Perfect your grammar nuances, idiomatic speaking, and prepare for international IELTS/TOEFL exams.",
    price_free_title: "First Free Lesson",
    price_free_val: "Free",
    price_free_span: " / 40 min session",
    price_free_desc: "Perfect for testing our platform and outlining your speaking roadmap.",
    feat_free_1: "1-on-1 Placement Lesson",
    feat_free_2: "Custom Speaking Assessment",
    feat_free_3: "Tailored Study Plan",
    btn_book_free: "Book Free Lesson",
    badge_popular: "Popular",
    price_beginners_title: "For Beginners (A1-A2)",
    price_beginners_val: "$12",
    price_beginners_span: " / 1hr Lesson",
    price_beginners_discount: "Save BIG: Buy 10 lessons for just $11/hr!",
    price_beginners_desc: "Perfect for beginners who want to build a strong foundation in English and start speaking confidently.",
    feat_beginners_1: "Basic Grammar & Vocabulary",
    feat_beginners_2: "Speaking Practice",
    feat_beginners_3: "Listening Exercises",
    feat_beginners_4: "Homework & Feedback",
    btn_start_learning: "Get 10 Lessons Pack",
    price_comm_title: "English for Communication",
    price_comm_val: "$12",
    price_comm_span: " / 1hr Lesson",
    price_comm_desc: "Focus on real-life communication and improve your confidence in everyday conversations.",
    feat_comm_1: "Speaking-Focused Lessons",
    feat_comm_2: "Everyday Vocabulary",
    feat_comm_3: "Pronunciation Training",
    feat_comm_4: "Interactive Discussions",
    price_business_title: "Career & Business English",
    price_business_val: "$15",
    price_business_span: " / 1hr Lesson",
    price_business_desc: "Develop professional communication skills for work, meetings, and international business.",
    feat_business_1: "Business Vocabulary",
    feat_business_2: "Email Writing",
    feat_business_3: "Meeting & Presentation Skills",
    feat_business_4: "Professional Speaking Practice",
    price_exam_title: "Exam & Test Preparation",
    price_exam_val: "$18",
    price_exam_span: " / 1hr Lesson",
    price_exam_desc: "Get fully prepared for IELTS, TOEFL, or Cambridge exams with targeted strategies and practice tests.",
    feat_exam_1: "Exam Strategies & Formats",
    feat_exam_2: "Mock Speaking & Writing Tests",
    feat_exam_3: "Advanced Grammar & Structures",
    feat_exam_4: "Time Management Tactics",
    course_book_title: "Book Your Placement Lesson",
    course_book_desc: "Ready to start your customized road path? Complete our short registration form and our coordinators will reach out in 2 hours.",

    // Quiz Section
    quiz_title_1: "What language do you want to master?",
    quiz_opt_1a: "English Course",
    quiz_opt_1b: "German Course",
    quiz_opt_1c: "Ukrainian Course",
    quiz_title_2: "What is your primary learning goal?",
    quiz_opt_2a: "Career progress / Job interviews",
    quiz_opt_2b: "Travel or international relocation",
    quiz_opt_2c: "Conversing with relatives / Interest",
    quiz_title_3: "How much time can you dedicate daily?",
    quiz_opt_3a: "15 minutes - Light Flow path",
    quiz_opt_3b: "30 minutes - Recommended Regular path",
    quiz_opt_3c: "1 hour+ - Intensive Immersion path",
    quiz_result_title: "Your Custom Roadmap is Ready!",
    quiz_result_desc: "Based on your inputs, we have selected an optimized path: <strong id=\"quiz-summary-bold\">English</strong> for <strong id=\"quiz-goal-bold\">Career</strong> dedicating <strong id=\"quiz-time-bold\">30 mins</strong> daily. You can lock in your first speaking session immediately.",
    quiz_btn_book: "Book Free Roadmap Session"
  },
  uk: {
    // Page titles
    page_title_index: "Мовна школа NovaFlow",
    page_title_english: "Мовна школа NovaFlow - Курс англійської",
    page_title_german: "Мовна школа NovaFlow - Курс німецької",
    page_title_ukrainian: "Мовна школа NovaFlow - Курс української",

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
    teacher_photo_title: "Фото викладача",
    teacher_photo_subtitle: "Світлий фон, портрет з посмішкою",
    teacher_title: 'Зустрічай того, хто відкриє твою <span class="gradient-accent">мовну свободу</span>',
    teacher_p1: "Англійська перетворила мрії на реальність для тисяч людей: дала кращу кар'єру, міжнародні зв'язки, подорожі, впевненість та свободу. Моя місія — допомогти вам досягти того ж самого.",
    teacher_p2: "Мене звати Кирило, я засновник мовної школи NovaFlow. Я створив цю платформу з однієї причини: більшість людей витрачають роки на \"вивчення\" англійської, але так і не відчувають впевненості, щоб заговорити.",
    teacher_p3: "У NovaFlow ми працюємо зовсім інакше.<br><span class=\"sub-highlight\">Жодних нудних шкільних уроків. Жодного зубріння нескінченних правил без практики. Жодних мовних бар'єрів.</span>",
    teacher_p4: "Наші студенти навчаються через живі розмови, сучасні інтерактивні методи та систему, яка допомагає говорити природно та невимушено з самого початку. Кожне заняття спрямоване на те, щоб ви бачили реальний прогрес, зберігали високу мотивацію, а навчання приносило задоволення, а не стрес.",
    teacher_p5: "Незалежно від того, чи є ваша ціль подорожі, навчання за кордоном, побудова міжнародної кар'єри, складання іспитів або просто бажання вільно спілкуватися без вагань — NovaFlow створена, щоб ви досягли цього швидше та ефективніше.",
    teacher_quote: "Це більше ніж просто мовний курс. <br>Це новий рівень впевненості, нові горизонти та нова версія вас самих.",
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
    course_levels_de: "Усі рівні (A1-C1)",
    course_levels_ua: "Рівні A1 - B2",
    course_lessons_30: "3 курси",
    course_lessons_25: "5 курсів",
    course_lessons_35: "3 курси",
    explore_course: "Детальніше про курс",

    // Lab Section
    lab_title: "Інтерактивна мовна лабораторія",
    lab_listen: "Слухати / Говорити",
    lab_next: "Наступна фраза",

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
    placeholder_phone: "+380759648499",
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
    level_test_tag: "Безкоштовна Оцінка",
    level_test_title: "Визначте свій точний рівень мови",
    level_test_desc: "Пройдіть швидкий інтерактивний тест за 10-15 хвилин на професійній платформі оцінювання Testizer. Дізнайтеся свої сильні сторони та оберіть ідеальний план навчання.",
    level_test_feat1: "100% Безкоштовно та Швидко",
    level_test_feat2: "Перевірка граматики та лексики",
    level_test_feat3: "Миттєвий результат за CEFR",
    level_test_btn_text: "Розпочати безкоштовний тест",

    // Footer
    footer_desc: "Розвиваємо впевнене розмовне мовлення в усьому світі за допомогою передових методик занурення та гнучких мобільних рішень.",
    footer_col_school: "Школа",
    footer_col_legal: "Юридична інформація",
    footer_col_newsletter: "Розсилка новини",
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
    footer_sitemap: "Карта сайту",

    // English Course Page Specific
    course_syllabus_title: "Програма навчання",
    pricing_tag: "Ціни та плани",
    course_en_badge: "Курс англійської",
    course_en_hero_title: "Опануйте <span class=\"purple-gradient-text\">англійську</span>. Спілкуйтеся впевнено на глобальному рівні",
    course_en_hero_desc: "Відкрийте для себе світові можливості. Вивчайте сучасну граматику, освоюйте моделі бізнес-презентацій та тренуйте впевнене спілкування з провідними експертами.",
    pricing_btn_start: "Пройти оцінку рівня",
    course_syllabus_desc: "Наша інтенсивна програма розділена на логічні етапи навчання, спрямовані на швидке досягнення розмовної свободи.",
    prog_en_title1: "Базова комунікація",
    prog_en_desc1: "Формуйте ключовий словниковий запас, тренуйте повсякденні діалоги та впевненість у сприйнятті на слух з першого дня.",
    prog_en_title2: "Професійний розвиток",
    prog_en_desc2: "Опануйте ділові переговори, складіть резюме міжнародного зразка та навчіться проводити переконливі презентації.",
    prog_en_title3: "Високий рівень та іспити",
    prog_en_desc3: "Вдосконалюйте складні граматичні структури, ідіоми та готуйтеся до міжнародних іспитів IELTS/TOEFL.",
    price_free_title: "Перше безкоштовне заняття",
    price_free_val: "Безкоштовно",
    price_free_span: " / 40 хвилин",
    price_free_desc: "Ідеальний варіант, щоб протестувати нашу платформу та скласти індивідуальний план навчання.",
    feat_free_1: "Індивідуальний вступний урок",
    feat_free_2: "Професійна оцінка мовних навичок",
    feat_free_3: "Персоналізована програма розвитку",
    btn_book_free: "Записатися безкоштовно",
    badge_popular: "Популярний",
    price_beginners_title: "Для початківців (A1-A2)",
    price_beginners_val: "$12",
    price_beginners_span: " / 1 година",
    price_beginners_discount: "Економія: Купуйте пакет з 10 занять лише за $11/год!",
    price_beginners_desc: "Чудово підійде тим, хто хоче побудувати міцну базу англійської та швидко подолати страх розмови.",
    feat_beginners_1: "Базова граматика та словниковий запас",
    feat_beginners_2: "Практика розмовного мовлення",
    feat_beginners_3: "Вправи на аудіювання",
    feat_beginners_4: "Домашні завдання та детальний фідбек",
    btn_start_learning: "Придбати пакет з 10 уроків",
    price_comm_title: "Розмовна англійська",
    price_comm_val: "$12",
    price_comm_span: " / 1 година",
    price_comm_desc: "Упор на повсякденну комунікацію, розширення словникового запасу та вільне спілкування на будь-які теми.",
    feat_comm_1: "Заняття, орієнтовані на розмовну мову",
    feat_comm_2: "Сучасна жива лексика",
    feat_comm_3: "Постановка правильної вимови",
    feat_comm_4: "Інтерактивні обговорення та дебати",
    price_business_title: "Бізнес та кар'єра",
    price_business_val: "$15",
    price_business_span: " / 1 година",
    price_business_desc: "Розвивайте професійні навички спілкування для роботи, ділової переписки та співбесід.",
    feat_business_1: "Бізнес-лексика та термінологія",
    feat_business_2: "Практика ділового листування",
    feat_business_3: "Навички проведення зустрічей та презентацій",
    feat_business_4: "Практика розмовного спілкування у робочих ситуаціях",
    price_exam_title: "Підготовка до іспитів",
    price_exam_val: "$18",
    price_exam_span: " / 1 година",
    price_exam_desc: "Ефективна підготовка до складання іспитів IELTS, TOEFL або Cambridge з розбором стратегій та тестів.",
    feat_exam_1: "Стратегії та формати тестування",
    feat_exam_2: "Пробні іспити (Speaking & Writing)",
    feat_exam_3: "Складна граматика та академічні структури",
    feat_exam_4: "Тактики тайм-менеджменту на іспиті",
    course_book_title: "Запишіться на вступний урок",
    course_book_desc: "Готові розпочати навчання за індивідуальною програмою? Заповніть форму, і наш координатор зв'яжеться з вами протягом 2 годин.",

    // Quiz Section
    quiz_title_1: "Яку мову ви бажаєте вивчати?",
    quiz_opt_1a: "Курс англійської мови",
    quiz_opt_1b: "Курс німецької мови",
    quiz_opt_1c: "Курс української мови",
    quiz_title_2: "Яка ваша основна мета навчання?",
    quiz_opt_2a: "Розвиток кар'єри / Співбесіди",
    quiz_opt_2b: "Подорожі або переїзд за кордон",
    quiz_opt_2c: "Спілкування з родиною / Особистий інтерес",
    quiz_title_3: "Скільки часу ви готові приділяти щодня?",
    quiz_opt_3a: "15 хвилин — Легкий темп",
    quiz_opt_3b: "30 хвилин — Рекомендований оптимальний темп",
    quiz_opt_3c: "1 година+ — Інтенсивне занурення",
    quiz_result_title: "Ваш індивідуальний план готовий!",
    quiz_result_desc: "На основі ваших відповідей ми підібрали найкращий шлях: курс <strong id=\"quiz-summary-bold\">Англійської</strong> для <strong id=\"quiz-goal-bold\">Кар'єри</strong> з щоденними заняттями по <strong id=\"quiz-time-bold\">30 хвилин</strong>. Ви можете забронювати свій перший урок просто зараз.",
    quiz_btn_book: "Забронювати безкоштовне заняття"
  },
  de: {
    // Page titles
    page_title_index: "NovaFlow Sprachschule",
    page_title_english: "NovaFlow Sprachschule - Englisch Kurs",
    page_title_german: "NovaFlow Sprachschule - Deutsch Kurs",
    page_title_ukrainian: "NovaFlow Sprachschule - Ukrainisch Kurs",

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
    hero_cta: "Ihre Reise beginnen",

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
    teacher_photo_title: "Foto des Lehrers",
    teacher_photo_subtitle: "Heller Hintergrund, lächelndes Porträt",
    teacher_title: "Triff deinen Wegweiser zu deiner <span class=\"gradient-accent\">Sprachfreiheit</span>",
    teacher_p1: "Englisch hat für Tausende von Menschen Chancen in die Realität umgesetzt — bessere Karrieren, internationale Kontakte, Reisen, Selbstvertrauen und Freiheit. Meine Mission ist es, Ihnen dabei zu helfen, dasselbe zu erreichen.",
    teacher_p2: "Mein Name ist Kyrylo, ich bin der Gründer der NovaFlow Sprachschule. Ich habe diese Plattform aus einem einzigen Grund ins Leben gerufen: Die meisten Menschen verbringen Jahre damit, Englisch zu \"lernen\", fühlen sich aber nie sicher genug, um tatsächlich zu sprechen.",
    teacher_p3: "Bei NovaFlow machen wir die Dinge anders.<br><span class=\"sub-highlight\">Kein langweiliger Schulunterricht. Kein Auswendiglernen endloser Regeln ohne Praxis. Keine Blockaden.</span>",
    teacher_p4: "Unsere Schüler lernen durch echte Gespräche, moderne interaktive Methoden und ein System, das Ihnen hilft, von Anfang an natürlich und selbstbewusst zu sprechen. Jede Lektion ist darauf ausgelegt, sichtbare Fortschritte zu erzielen, die Motivation hoch zu halten und das Sprachenlernen spannend statt stressig zu gestalten.",
    teacher_p5: "Ob Ihr Ziel eine Reise, ein Auslandsstudium, der Aufbau einer internationalen Karriere, das Bestehen von Prüfungen oder einfach das zögerungsfreie Sprechen ist — NovaFlow bringt Sie schneller und effektiver ans Ziel.",
    teacher_quote: "Dies ist mehr als ein Sprachkurs. <br>Es ist ein neues Niveau an Selbstvertrauen, neue Möglichkeiten und eine neue Version Ihrer selbst.",
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
    course_ua_title: "Ukrainische",
    course_ua_desc: "Verbinden Sie sich mit reicher Kultur, Traditionen und einer lebendigen Sprechgemeinschaft. Perfekt für Anfänger und Wiedereinsteiger.",
    course_levels_all: "Alle Niveaus (A1-C2)",
    course_levels_de: "Alle Niveaus (A1-B2)",
    course_levels_ua: "Niveaus A1 - B2",
    course_lessons_30: "3 Kurse",
    course_lessons_25: "5 Kurse",
    course_lessons_35: "3 Kurse",
    explore_course: "Kurs erkunden",

    // Lab Section
    lab_title: "Interaktives Sprachlabor",
    lab_listen: "Hören / Sprechen",
    lab_next: "Nächster Satz",

    // Reviews Section
    reviews_tag: "Bewertungen",
    reviews_title: "Was unsere Schüler sagen",
    reviews_desc: "Tausende von Schülern haben ihren Weg zur Flüssigkeit mit unserer personalisierten Lernkarte beschleunigt.",
    form_review_title: "Teilen Sie Ihre Erfahrung",
    form_review_desc: "Ihr Feedback hilft anderen, die richtige Wahl zu treffen.",
    form_rating_label: "Ihre Bewertung:",
    form_name_placeholder: "Ihr vollständiger Name",
    form_text_placeholder: "Schreiben Sie Ihre Bewertung...",
    form_submit_btn: "Bewertung absenden",

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
    placeholder_phone: "+380759648499",
    placeholder_email: "max@example.com",
    select_lang_placeholder: "Sprache auswählen",
    select_level_placeholder: "Niveau auswählen",
    option_level_0: "Absoluter Anfänger (A0)",
    option_level_1: "Grundstufe (A1-A2)",
    option_level_2: "Mittelstufe (B1-B2)",
    option_level_3: "Fortgeschritten (C1-C2)",
    placeholder_msg: "Erzählen Sie uns von Ihren Lernzielen...",
    form_btn: "Kostenlose Probestunde buchen",
    form_success: "🎉 Herzlichen Glückwunsch! Ihre Anfrage wurde gesendet. Wir werden Ihnen innerhalb von 2 Stunden eine E-Mail senden, um Ihre Beratungszeit zu bestätigen.",
    level_test_tag: "Kostenlose Bewertung",
    level_test_title: "Finden Sie Ihr genaues Sprachniveau heraus",
    level_test_desc: "Machen Sie in nur 10-15 Minuten einen schnellen, interaktiven Test auf der professionellen Bewertungsplattform Testizer. Entdecken Sie Ihre Stärken und wählen Sie den perfekten Kurspfad.",
    level_test_feat1: "100% kostenlos & schnell",
    level_test_feat2: "Grammatik- & Vokabeltest",
    level_test_feat3: "Sofortiges CEFR-Ergebnis",
    level_test_btn_text: "Kostenlosen Test starten",

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
    footer_sitemap: "Sitemap",

    // English Course Page Specific
    course_syllabus_title: "Lehrplan",
    pricing_tag: "Preise & Pläne",
    course_en_badge: "Englisch Kurs",
    course_en_hero_title: "Meistern Sie <span class=\"purple-gradient-text\">Englisch</span>. Sprechen Sie mit globaler Wirkung",
    course_en_hero_desc: "Erschließen Sie sich globale Möglichkeiten. Meistern Sie fortgeschrittene Grammatik, Präsentationstechniken und gewinnen Sie professionelles Sprechselbstvertrauen mit erstklassigen Trainern.",
    pricing_btn_start: "Kostenlosen Einstufungstest machen",
    course_syllabus_desc: "Unser intensiver Lehrplan ist in aufeinander aufbauende Module unterteilt, die auf fließendes Sprechen ausgelegt sind.",
    prog_en_title1: "Kernkommunikation",
    prog_en_desc1: "Bauen Sie ab dem ersten Tag grundlegenden Wortschatz, Flexibilität im Alltag und Hörverständnis auf.",
    prog_en_title2: "Professionelle Agilität",
    prog_en_desc2: "Meistern Sie anspruchsvolle Geschäftsverhandlungen, Lebenslauf-Coaching und dynamische Präsentationstechniken.",
    prog_en_title3: "Fortgeschrittene Beherrschung",
    prog_en_desc3: "Perfektionieren Sie Ihre Grammatik, lernen Sie Redewendungen und bereiten Sie sich auf internationale IELTS/TOEFL-Prüfungen vor.",
    price_free_title: "Erste kostenlose Lektion",
    price_free_val: "Kostenlos",
    price_free_span: " / 40 Min. Sitzung",
    price_free_desc: "Perfekt, um unsere Plattform zu testen und Ihren persönlichen Lernplan zu erstellen.",
    feat_free_1: "1-zu-1-Einstufungslektion",
    feat_free_2: "Individuelle Bewertung der Sprechfähigkeiten",
    feat_free_3: "Maßgeschneiderter Studienplan",
    btn_book_free: "Kostenlose Probestunde buchen",
    badge_popular: "Beliebt",
    price_beginners_title: "Für Anfänger (A1-A2)",
    price_beginners_val: "12 $",
    price_beginners_span: " / 1 Std. Lektion",
    price_beginners_discount: "Großes Sparpaket: Kaufen Sie 10 Lektionen für nur 11 $/Std.!",
    price_beginners_desc: "Ideal für Anfänger, die eine solide Grundlage aufbauen und selbstbewusst sprechen möchten.",
    feat_beginners_1: "Grundlegende Grammatik & Wortschatz",
    feat_beginners_2: "Sprechpraxis",
    feat_beginners_3: "Hörübungen",
    feat_beginners_4: "Hausaufgaben & Feedback",
    btn_start_learning: "10-Lektionen-Paket holen",
    price_comm_title: "Englisch für Kommunikation",
    price_comm_val: "12 $",
    price_comm_span: " / 1 Std. Lektion",
    price_comm_desc: "Konzentrieren Sie sich auf die alltägliche Kommunikation und verbessern Sie Ihre Sicherheit in Alltagsgesprächen.",
    feat_comm_1: "Sprechorientierter Unterricht",
    feat_comm_2: "Alltagswortschatz",
    feat_comm_3: "Aussprachetraining",
    feat_comm_4: "Interaktive Diskussionen",
    price_business_title: "Karriere- & Business-Englisch",
    price_business_val: "15 $",
    price_business_span: " / 1 Std. Lektion",
    price_business_desc: "Entwickeln Sie professionelle Kommunikationsfähigkeiten für Arbeit, Meetings und internationales Geschäft.",
    feat_business_1: "Business-Vokabular",
    feat_business_2: "E-Mail-Korrespondenz",
    feat_business_3: "Meeting- & Präsentationstechniken",
    feat_business_4: "Professionelles Sprechtraining",
    price_exam_title: "Prüfungsvorbereitung",
    price_exam_val: "18 $",
    price_exam_span: " / 1 Std. Lektion",
    price_exam_desc: "Bereiten Sie sich mit gezielten Strategien und Testprüfungen optimal auf IELTS, TOEFL oder Cambridge-Zertifikate vor.",
    feat_exam_1: "Prüfungsstrategien & Formate",
    feat_exam_2: "Testprüfungen (Sprechen & Schreiben)",
    feat_exam_3: "Fortgeschrittene Grammatik & Strukturen",
    feat_exam_4: "Zeitmanagement-Taktiken",
    course_book_title: "Buchen Sie Ihre Einstufungslektion",
    course_book_desc: "Bereit für Ihren maßgeschneiderten Lernpfad? Füllen Sie das kurze Formular aus und wir melden uns innerhalb von 2 Stunden.",

    // Quiz Section
    quiz_title_1: "Welche Sprache möchten Sie meistern?",
    quiz_opt_1a: "Englisch Kurs",
    quiz_opt_1b: "Deutsch Kurs",
    quiz_opt_1c: "Ukrainisch Kurs",
    quiz_title_2: "Was ist Ihr primäres Lernziel?",
    quiz_opt_2a: "Karrierefortschritt / Vorstellungsgespräche",
    quiz_opt_2b: "Reisen oder Auswanderung",
    quiz_opt_2c: "Gespräche mit Verwandten / Interesse",
    quiz_title_3: "Wie viel Zeit können Sie täglich investieren?",
    quiz_opt_3a: "15 Minuten - Entspannter Lernfluss",
    quiz_opt_3b: "30 Minuten - Empfohlener regulärer Pfad",
    quiz_opt_3c: "1 Stunde+ - Intensives Eintauchen",
    quiz_result_title: "Ihr individueller Lernpfad ist bereit!",
    quiz_result_desc: "Basierend auf Ihren Angaben haben wir einen optimierten Pfad ausgewählt: <strong id=\"quiz-summary-bold\">Englisch</strong> für die <strong id=\"quiz-goal-bold\">Karriere</strong> mit täglich <strong id=\"quiz-time-bold\">30 Minuten</strong>. Sie können Ihre erste Probestunde sofort buchen.",
    quiz_btn_book: "Kostenlose Beratung buchen"
  }
};

// Course page translations overrides/complements
// German Page overrides
const dePageTranslations = {
  course_de_badge: {
    en: "German Course",
    uk: "Курс німецької",
    de: "Deutsch Kurs"
  },
  course_de_hero_title: {
    en: "Master <span class=\"purple-gradient-text\">German</span>. Speak with Precision",
    uk: "Опануйте <span class=\"purple-gradient-text\">німецьку</span>. Розмовляйте з точністю",
    de: "Meistern Sie <span class=\"purple-gradient-text\">Deutsch</span>. Sprechen Sie mit Präzision"
  },
  course_de_hero_desc: {
    en: "Open career avenues in Germany, Austria, and Switzerland. Master precise case grammar structure, workplace vocab, and speak confidently.",
    uk: "Відкрийте кар'єрні можливості в Німеччині, Австрії та Швейцарії. Опануйте відмінки, граматичну структуру, ділову лексику та розмовляйте впевнено.",
    de: "Öffnen Sie Karrierewege in Deutschland, Österreich und der Schweiz. Meistern Sie präzise Kasus-Grammatikstrukturen, Fachvokabular und sprechen Sie selbstbewusst."
  },
  prog_de_title1: {
    en: "Conversational agility",
    uk: "Розмовна гнучкість",
    de: "Konversationelle Agilität"
  },
  prog_de_desc1: {
    en: "Master basic sentence architectures, everyday active dialogues, and build clear core pronunciation skills.",
    uk: "Опануйте базові структури речень, щоденні активні діалоги та сформуйте правильну вимову.",
    de: "Meistern Sie grundlegende Satzstrukturen, alltägliche aktive Dialoge und bauen Sie eine klare Aussprache auf."
  },
  prog_de_title2: {
    en: "Grammar Alignment",
    uk: "Узгодження граматики",
    de: "Grammatik-Ausrichtung"
  },
  prog_de_desc2: {
    en: "Formulate correct case configurations (Dativ/Akkusativ), sub-clause connectors, and workplace writing agility.",
    uk: "Навчіться правильно вживати відмінки (Dativ/Akkusativ), сполучники підрядних речень та розвивайте навички ділового листування.",
    de: "Formulieren Sie korrekte Kasusstrukturen (Dativ/Akkusativ), Nebensatzverbindungen und erlangen Sie Schreibsicherheit für den Beruf."
  },
  prog_de_title3: {
    en: "Professional Fluency",
    uk: "Професійне мовлення",
    de: "Professionelle Sprachflüssigkeit"
  },
  prog_de_desc3: {
    en: "Conduct complex corporate negotiations, resume layout coaching, and master spontaneous debates.",
    uk: "Навчіться проводити складні корпоративні переговори, складіть професійне резюме та беріть участь у спонтанних дебатах.",
    de: "Führen Sie komplexe Verhandlungen, erhalten Sie Lebenslauf-Coaching und meistern Sie spontane Diskussionen."
  }
};

// Ukrainian Page overrides
const ukPageTranslations = {
  course_uk_badge: {
    en: "Ukrainian Course",
    uk: "Курс української",
    de: "Ukrainisch Kurs"
  },
  course_uk_hero_title: {
    en: "Connect with <span class=\"purple-gradient-text\">Ukraine</span>. Melodic & Powerful",
    uk: "Зв'яжіться з <span class=\"purple-gradient-text\">Україною</span>. Мелодійна та сильна",
    de: "Verbinden Sie sich mit der <span class=\"purple-gradient-text\">Ukraine</span>. Melodisch & kraftvoll"
  },
  course_uk_hero_desc: {
    en: "Explore Ukrainian language, dynamic culture, and native conversational models. Ideal for heritage speakers and language explorers.",
    uk: "Відкрийте для себе українську мову, багату культуру та реальні розмовні моделі. Ідеально для нащадків українців за кордоном та поціновувачів мов.",
    de: "Entdecken Sie die ukrainische Sprache, die lebendige Kultur und echte Gesprächsmodelle. Ideal für Menschen mit ukrainischen Wurzeln und Sprachbegeisterte."
  },
  prog_uk_title1: {
    en: "Melodic Beginnings",
    uk: "Мелодійний початок",
    de: "Melodische Anfänge"
  },
  prog_uk_desc1: {
    en: "Learn Cyrillic alphabet, correct phonetic models, and core everyday survival vocabulary.",
    uk: "Вивчіть кириличний алфавіт, базові фонетичні моделі та ключові слова для щоденного виживання.",
    de: "Lernen Sie das kyrillische Alphabet, korrekte phonetische Modelle und den wichtigsten Alltagswortschatz."
  },
  prog_uk_title2: {
    en: "Cultural Connection",
    uk: "Культурний зв'язок",
    de: "Kulturelle Verbindung"
  },
  prog_uk_desc2: {
    en: "Dive into local idioms, classic heritage stories, and natural conversational exchange frameworks.",
    uk: "Пориньте у місцеві ідіоми, класичні народні розповіді та природні моделі повсякденного спілкування.",
    de: "Tauchen Sie ein in lokale Redewendungen, klassische Geschichten und natürliche Gesprächsstrukturen."
  },
  prog_uk_title3: {
    en: "Expressive Fluency",
    uk: "Виразне мовлення",
    de: "Ausdrucksstarke Flüssigkeit"
  },
  prog_uk_desc3: {
    en: "Master complex aspect cases, media comprehension, and speak confidently with native communities.",
    uk: "Опануйте відмінкові форми, розуміння медіаресурсів та вільно спілкуйтеся з носіями мови.",
    de: "Meistern Sie komplexe Kasusformen, Medienverständnis und sprechen Sie selbstbewusst mit Muttersprachlern."
  }
};

// Merge overrides into main translations dictionary
for (const [key, value] of Object.entries(dePageTranslations)) {
  for (const lang of ['en', 'uk', 'de']) {
    if (!translations[lang]) translations[lang] = {};
    translations[lang][key] = value[lang];
  }
}

for (const [key, value] of Object.entries(ukPageTranslations)) {
  for (const lang of ['en', 'uk', 'de']) {
    if (!translations[lang]) translations[lang] = {};
    translations[lang][key] = value[lang];
  }
}

// Current language state
let currentLang = localStorage.getItem('novaflowLang') || 'en';

// Function to update all page content
function updatePageLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('novaflowLang', lang);
  
  // Set html lang attribute
  document.documentElement.lang = lang;

  // Update document title dynamically based on the current page
  if (translations[lang]) {
    const pathname = window.location.pathname;
    if (pathname.includes('english.html')) {
      document.title = translations[lang]['page_title_english'] || "NovaFlow Language School - English Course";
    } else if (pathname.includes('german.html')) {
      document.title = translations[lang]['page_title_german'] || "NovaFlow Language School - German Course";
    } else if (pathname.includes('ukrainian.html')) {
      document.title = translations[lang]['page_title_ukrainian'] || "NovaFlow Language School - Ukrainian Course";
    } else {
      document.title = translations[lang]['page_title_index'] || "NovaFlow Language School";
    }
  }
  
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key] !== undefined) {
      const text = translations[lang][key];
      // Check if element has HTML (contains span tags or formatting tags)
      if (typeof text === 'string' && (text.includes('<') || text.includes('&'))) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });

  // Handle placeholders and other inputs
  const inputs = document.querySelectorAll('[placeholder]');
  inputs.forEach(input => {
    // If the input has data-i18n attribute for placeholder
    const key = input.getAttribute('data-i18n');
    if (key && translations[lang] && translations[lang][key]) {
      input.placeholder = translations[lang][key];
    }
  });
  
  // Update all language selects
  const langSelects = document.querySelectorAll('.lang-select');
  langSelects.forEach(select => {
    select.value = lang;
  });

  // Dispatch custom event for widgets (like language lab) that listen to it
  window.dispatchEvent(new CustomEvent('novaflowLangChanged', { detail: { lang } }));
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
