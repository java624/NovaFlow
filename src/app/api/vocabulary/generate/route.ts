import { NextResponse } from 'next/server';
import { VocabularyItem } from '@/types/vocabulary';
import {
  buildSingleWordPrompt,
  callGroqJSON,
  mapRawWordToVocabularyItem,
} from '@/lib/groqVocabulary';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, targetLanguage = 'English', nativeLanguage = 'Ukrainian', level = 'B1' } = body;

    if (!word || typeof word !== 'string' || !word.trim()) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const cleanWord = word.trim();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY не налаштовано на сервері.' },
        { status: 500 }
      );
    }

    const prompt = buildSingleWordPrompt(cleanWord, targetLanguage, nativeLanguage, level);
    const parsed = (await callGroqJSON(prompt, apiKey)) as Parameters<
      typeof mapRawWordToVocabularyItem
    >[0];

    const fullItem: VocabularyItem = {
      ...mapRawWordToVocabularyItem(parsed, cleanWord, level, 'ai', 'vocab', 0),
      id: `vocab-${Date.now()}`,
    };

    return NextResponse.json({ success: true, item: fullItem, source: 'groq_ai' });
  } catch (error: unknown) {
    console.error('Error generating vocabulary item:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не вдалося згенерувати слово через ШІ. Спробуйте ще раз через кілька секунд.',
      },
      { status: 502 }
    );
  }
}
