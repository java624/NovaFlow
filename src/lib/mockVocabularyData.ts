import { VocabularyItem, Wordpack, VocabularyStats } from '@/types/vocabulary';

export const INITIAL_VOCABULARY_ITEMS: VocabularyItem[] = [
  {
    id: 'vocab-1',
    word: 'Resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    partOfSpeech: 'noun',
    cefrLevel: 'B2',
    primaryTranslation: 'Стійкість / життєздатність',
    alternativeTranslations: ['пружність', 'гнучкість'],
    definition: 'The capacity to withstand or recover quickly from difficult conditions.',
    mnemonicHint: 'Уяви гумовий м’ячик (Resilient), який відскакує назад після удару!',
    collocations: ['build resilience', 'emotional resilience', 'remarkable resilience'],
    contextExamples: [
      {
        sentence: 'The company showed great resilience during the economic crisis.',
        translation: 'Компанія проявила велику стійкість під час економічної кризи.'
      },
      {
        sentence: 'Building psychological resilience is essential for modern leaders.',
        translation: 'Розбудова психологічної стійкості є необхідною для сучасних лідерів.'
      }
    ],
    synonyms: ['toughness', 'adaptability', 'fortitude'],
    antonyms: ['fragility', 'vulnerability'],
    quiz: {
      question: 'Her ___ helped her overcome all the obstacles in her path.',
      options: ['resilience', 'fragility', 'hesitation', 'reluctance'],
      correctIndex: 0
    },
    status: 'learning',
    boxLevel: 2,
    nextReviewDate: new Date().toISOString(),
    addedBy: 'teacher',
    wordpackId: 'wp-business-1',
    createdAt: '2026-07-28T10:00:00Z'
  },
  {
    id: 'vocab-2',
    word: 'Ambiguate',
    phonetic: '/æmˈbɪɡ.ju.eɪt/',
    partOfSpeech: 'verb',
    cefrLevel: 'C1',
    primaryTranslation: 'Робити нечітким / двозначним',
    alternativeTranslations: ['заплутувати'],
    definition: 'To make something ambiguous or open to more than one interpretation.',
    mnemonicHint: 'AMBIGUous + ATE = коли з’їв інформацію так, що зробив її нечіткою.',
    collocations: ['deliberately ambiguate', 'ambiguate the term'],
    contextExamples: [
      {
        sentence: 'Avoid using passive voice if it serves only to ambiguate the subject.',
        translation: 'Уникайте пасивного стану, якщо він слугує лише для заплутування підмета.'
      }
    ],
    synonyms: ['obscure', 'confuse', 'muddle'],
    antonyms: ['clarify', 'elucidate'],
    quiz: {
      question: 'Which word means to make something unclear or open to multiple meanings?',
      options: ['ambiguate', 'clarify', 'simplify', 'illuminate'],
      correctIndex: 0
    },
    status: 'learning',
    boxLevel: 1,
    nextReviewDate: new Date().toISOString(),
    addedBy: 'student',
    wordpackId: null,
    createdAt: '2026-07-29T14:30:00Z'
  },
  {
    id: 'vocab-3',
    word: 'Fulfill',
    phonetic: '/fʊlˈfɪl/',
    partOfSpeech: 'verb',
    cefrLevel: 'B1',
    primaryTranslation: 'Виконувати / здійснювати',
    alternativeTranslations: ['задовольняти', 'реалізовувати'],
    definition: 'To achieve or carry out something desired, promised, or required.',
    mnemonicHint: 'FULL (повний) + FILL (наповнювати) = наповнити обіцянку вповні!',
    collocations: ['fulfill a promise', 'fulfill expectations', 'fulfill requirements'],
    contextExamples: [
      {
        sentence: 'We pledge to fulfill all delivery guarantees on time.',
        translation: 'Ми зобов’язуємося виконати всі гарантії доставки вчасно.'
      },
      {
        sentence: 'Finding a passion helps you fulfill your potential.',
        translation: 'Пошук пристрасті допомагає реалізувати свій потенціал.'
      }
    ],
    synonyms: ['accomplish', 'satisfy', 'execute'],
    antonyms: ['fail', 'neglect'],
    quiz: {
      question: 'He managed to ___ his childhood dream of becoming a pilot.',
      options: ['fulfill', 'reject', 'delay', 'ignore'],
      correctIndex: 0
    },
    status: 'mastered',
    boxLevel: 5,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    addedBy: 'teacher',
    wordpackId: 'wp-general-b1',
    createdAt: '2026-07-20T09:00:00Z'
  },
  {
    id: 'vocab-4',
    word: 'Pivot',
    phonetic: '/ˈpɪv.ət/',
    partOfSpeech: 'verb',
    cefrLevel: 'B2',
    primaryTranslation: 'Змінювати напрямок / розвертатися',
    alternativeTranslations: ['поворотна точка', 'обертатися'],
    definition: 'To turn or change direction sharply, especially in business strategy.',
    mnemonicHint: 'Уяви баскетболіста, який стоїть на одній нозі і різко розвертається (Pivoting).',
    collocations: ['pivot quickly', 'strategic pivot', 'pivot to a new market'],
    contextExamples: [
      {
        sentence: 'The startup decided to pivot after receiving initial customer feedback.',
        translation: 'Стартап вирішив змінити напрямок після отримання перших відгуків клієнтів.'
      }
    ],
    synonyms: ['shift', 'turn', 'reorient'],
    antonyms: ['persist', 'continue'],
    quiz: {
      question: 'When a market changes, agile companies need to ___ their strategy.',
      options: ['pivot', 'stagnate', 'freeze', 'collapse'],
      correctIndex: 0
    },
    status: 'review_needed',
    boxLevel: 2,
    nextReviewDate: new Date().toISOString(),
    addedBy: 'ai',
    wordpackId: 'wp-business-1',
    createdAt: '2026-07-30T11:15:00Z'
  },
  {
    id: 'vocab-5',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    cefrLevel: 'B2',
    primaryTranslation: 'Прагматичний / практичний',
    alternativeTranslations: ['раціональний', 'реалістичний'],
    definition: 'Dealing with things sensibly and realistically based on practical considerations.',
    mnemonicHint: 'PRACtical = PRAGmatic. Дивись на практику, а не лише на теорію!',
    collocations: ['pragmatic approach', 'pragmatic solution', 'stay pragmatic'],
    contextExamples: [
      {
        sentence: 'We need a pragmatic approach to solve this urgent bug.',
        translation: 'Нам потрібен прагматичний підхід, щоб вирішити цю термінову помилку.'
      }
    ],
    synonyms: ['practical', 'realistic', 'sensible'],
    antonyms: ['idealistic', 'impractical'],
    quiz: {
      question: 'Instead of debating theory, let’s choose a ___ solution.',
      options: ['pragmatic', 'fictional', 'reckless', 'absurd'],
      correctIndex: 0
    },
    status: 'learning',
    boxLevel: 3,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    addedBy: 'teacher',
    wordpackId: 'wp-general-b1',
    createdAt: '2026-07-25T16:40:00Z'
  }
];

export const INITIAL_WORDPACKS: Wordpack[] = [
  {
    id: 'wp-business-1',
    title: 'Business English Essentials',
    description: 'Ключові слова для презентацій, переговорів та стратегічних сесій.',
    level: 'B2',
    icon: '💼',
    wordsCount: 12,
    wordIds: ['vocab-1', 'vocab-4'],
    createdAt: '2026-07-25T10:00:00Z'
  },
  {
    id: 'wp-general-b1',
    title: 'Daily Fluency Boost (B1)',
    description: 'Розмовні дієслова та фрази для впевненого спілкування щодня.',
    level: 'B1',
    icon: '🚀',
    wordsCount: 25,
    wordIds: ['vocab-3', 'vocab-5'],
    createdAt: '2026-07-20T10:00:00Z'
  },
  {
    id: 'wp-advanced-c1',
    title: 'C1 Academic & Expressive Vocabulary',
    description: 'Вишуканий словниковий запас для есе та глибоких дискусій.',
    level: 'C1',
    icon: '🎯',
    wordsCount: 18,
    wordIds: ['vocab-2'],
    createdAt: '2026-07-15T10:00:00Z'
  }
];

// Helper functions for LocalStorage persistence
const STORAGE_KEY_VOCAB = 'novaflow_vocabulary_items_v1';
const STORAGE_KEY_WORDPACKS = 'novaflow_wordpacks_v1';

export function getStoredVocabulary(): VocabularyItem[] {
  if (typeof window === 'undefined') return INITIAL_VOCABULARY_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOCAB);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VOCAB, JSON.stringify(INITIAL_VOCABULARY_ITEMS));
      return INITIAL_VOCABULARY_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load vocabulary from localStorage', err);
    return INITIAL_VOCABULARY_ITEMS;
  }
}

export function saveVocabulary(items: VocabularyItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_VOCAB, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save vocabulary to localStorage', err);
  }
}

export function getStoredWordpacks(): Wordpack[] {
  if (typeof window === 'undefined') return INITIAL_WORDPACKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORDPACKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_WORDPACKS, JSON.stringify(INITIAL_WORDPACKS));
      return INITIAL_WORDPACKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load wordpacks from localStorage', err);
    return INITIAL_WORDPACKS;
  }
}

export function saveWordpacks(packs: Wordpack[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WORDPACKS, JSON.stringify(packs));
  } catch (err) {
    console.error('Failed to save wordpacks to localStorage', err);
  }
}

export function calculateVocabularyStats(items: VocabularyItem[]): VocabularyStats {
  const now = new Date().getTime();
  const totalWords = items.length;
  const masteredWords = items.filter((i) => i.status === 'mastered').length;
  const learningWords = items.filter((i) => i.status === 'learning').length;
  const dueForReview = items.filter((i) => {
    if (i.status === 'mastered') return false;
    const reviewTime = new Date(i.nextReviewDate).getTime();
    return reviewTime <= now || i.status === 'review_needed';
  }).length;

  return {
    totalWords,
    masteredWords,
    learningWords,
    dueForReview,
    streakDays: 5 // Default active streak
  };
}
