export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom' | 'phrasal_verb';
export type MasteryStatus = 'learning' | 'mastered' | 'review_needed';
export type StudyMode = 'browse' | 'flashcards' | 'match' | 'quiz' | 'ai_chat';

export interface ContextExample {
  sentence: string;
  translation: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: PartOfSpeech;
  cefrLevel: CEFRLevel;
  primaryTranslation: string;
  alternativeTranslations: string[];
  definition: string;
  mnemonicHint: string;
  collocations: string[];
  contextExamples: ContextExample[];
  synonyms: string[];
  antonyms: string[];
  quiz: QuizItem;
  status: MasteryStatus;
  boxLevel: number; // 1 to 5 for Leitner System
  nextReviewDate: string;
  addedBy: 'teacher' | 'student' | 'ai';
  wordpackId?: string | null;
  createdAt: string;
}

export interface Wordpack {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  icon: string;
  wordsCount: number;
  wordIds: string[];
  assignedToStudentIds?: string[];
  createdAt: string;
}

export interface AssignedWordpack {
  id: string;
  title: string;
  targetLanguage: string;
  createdAt: string;
  dueDate?: string;
  assignedStudentIds: string[];
  createdByTeacherId: string;
  words: VocabularyItem[];
}

export interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  dueForReview: number;
  streakDays: number;
}
