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
  boxLevel: number;
  nextReviewDate: string;
  addedBy: 'teacher' | 'student' | 'ai';
  wordpackId?: string | null;
  createdAt: string;
}

export interface WordPacket {
  id: string;
  teacherId: string;
  title: string;
  targetLanguage: string;
  level?: string;
  createdAt: string;
  dueDate?: string;
  assignedStudentIds: string[];
  words: VocabularyItem[];
}

export interface PacketAssignment {
  id: string;
  packetId: string;
  studentId: string;
  dueDate?: string;
  assignedAt: string;
}

export interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  dueForReview: number;
  streakDays: number;
}
