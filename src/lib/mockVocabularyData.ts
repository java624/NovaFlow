import { VocabularyItem, VocabularyStats, WordPacket } from '@/types/vocabulary';

/** Parse raw word input: comma, newline, semicolon, or space separated */
export function parseWordInput(rawInput: string): string[] {
  return rawInput
    .split(/[,\n;]+|\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

export function calculateAssignedProgress(packs: WordPacket[]) {
  const allWords = packs.flatMap((p) => p.words);
  const total = allWords.length;
  const mastered = allWords.filter((w) => w.status === 'mastered').length;
  return {
    total,
    mastered,
    remaining: total - mastered,
    percent: total > 0 ? Math.round((mastered / total) * 100) : 0,
  };
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
    streakDays: 5,
  };
}
