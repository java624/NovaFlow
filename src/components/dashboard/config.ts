// Courses and language configuration for the Student Dashboard

export interface CoursePlan {
  id: string;
  name: string;
  pricePerLesson: number;
  desc: string;
}

export const COURSES: Record<string, CoursePlan[]> = {
  english: [
    { id: 'en-beginners', name: 'For Beginners (A1-A2)', pricePerLesson: 12, desc: 'Perfect for beginners who want to build a strong foundation in English and start speaking confidently.' },
    { id: 'en-comm', name: 'English for Communication', pricePerLesson: 12, desc: 'Focus on real-life communication and improve your confidence in everyday conversations.' },
    { id: 'en-business', name: 'Career & Business English', pricePerLesson: 15, desc: 'Develop professional communication skills for work, meetings, and international business.' },
    { id: 'en-exam', name: 'Exam & Test Preparation', pricePerLesson: 18, desc: 'Get fully prepared for IELTS, TOEFL, or Cambridge exams with targeted strategies and practice tests.' },
  ],
  german: [
    { id: 'de-beginners', name: 'Deutsch für Anfänger (A1-A2)', pricePerLesson: 12, desc: 'Perfect for beginners who want to build a strong foundation.' },
    { id: 'de-comm', name: 'Deutsch für Kommunikation', pricePerLesson: 12, desc: 'Focus on real-life communication.' },
    { id: 'de-business', name: 'Geschäftsdeutsch', pricePerLesson: 15, desc: 'Develop professional communication skills for work.' },
    { id: 'de-exam', name: 'Goethe/TestDaF Vorbereitung', pricePerLesson: 18, desc: 'Get fully prepared for exams.' },
  ],
  ukrainian: [
    { id: 'uk-beginners', name: 'Українська для початківців', pricePerLesson: 12, desc: 'Основи мови та базові конструкції.' },
    { id: 'uk-comm', name: 'Українська для спілкування', pricePerLesson: 12, desc: 'Розмовна практика для повсякденного життя.' },
    { id: 'uk-business', name: 'Ділова українська мова', pricePerLesson: 15, desc: 'Для роботи, офіційних зустрічей та бізнесу.' },
  ],
};

export interface LangConfig {
  flag: string;
  label: string;
  color: string;
  gradient: string;
}

export const LANG_CONFIG: Record<string, LangConfig> = {
  english:   { flag: '🇬🇧', label: 'Англійська мова', color: '#0057b7', gradient: 'linear-gradient(135deg, #0057b722, #0057b711)' },
  german:    { flag: '🇩🇪', label: 'Німецька мова',   color: '#DD0000', gradient: 'linear-gradient(135deg, #DD000022, #DD000011)' },
  ukrainian: { flag: '🇺🇦', label: 'Українська мова', color: '#FFD700', gradient: 'linear-gradient(135deg, #0057B722, #FFD70022)' },
};

export const DISCOUNT_THRESHOLD = 10;
export const DISCOUNT_PRICE = 11;
