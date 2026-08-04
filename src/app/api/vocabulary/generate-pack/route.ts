import { NextResponse } from 'next/server';
import { VocabularyItem } from '@/types/vocabulary';
import {
  buildPackPrompt,
  callGroqJSON,
  mapRawWordToVocabularyItem,
} from '@/lib/groqVocabulary';

export const dynamic = 'force-dynamic';

interface GeneratePackRequest {
  rawInput: string;
  targetLanguage: string;
  level?: string;
}

export async function POST(req: Request) {
  let words: string[] = [];

  try {
    const body = (await req.json()) as GeneratePackRequest;
    const { rawInput, targetLanguage = 'English', level = 'B1' } = body;

    if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
      return NextResponse.json({ error: 'rawInput is required' }, { status: 400 });
    }

    words = rawInput
      .split(/[,\n;]+|\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length === 0) {
      return NextResponse.json(
        { error: 'Не знайдено жодного слова у введеному тексті' },
        { status: 400 }
      );
    }

    if (words.length > 30) {
      return NextResponse.json(
        { error: 'Максимум 30 слів за один пакет. Розділіть на кілька пакетів.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY не налаштовано на сервері.' },
        { status: 500 }
      );
    }

    const prompt = buildPackPrompt(words, targetLanguage, level);
    const parsed = (await callGroqJSON(prompt, apiKey)) as { items?: unknown[] };
    const rawItems = parsed?.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error('Groq повернув некоректний формат даних.');
    }

    const items: VocabularyItem[] = rawItems.map((raw, idx) =>
      mapRawWordToVocabularyItem(
        raw as Parameters<typeof mapRawWordToVocabularyItem>[0],
        words[idx] || 'Unknown',
        level,
        'teacher',
        'vocab-pack',
        idx
      )
    );

    return NextResponse.json({ success: true, items, source: 'groq_ai' });
  } catch (error: unknown) {
    console.error('Error generating vocabulary pack:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не вдалося згенерувати пакет через ШІ. Спробуйте ще раз через кілька секунд.',
      },
      { status: 502 }
    );
  }
}
