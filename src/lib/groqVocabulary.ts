import { VocabularyItem, CEFRLevel, PartOfSpeech } from '@/types/vocabulary';

export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1200;

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export async function callGroqJSON(prompt: string, apiKey: string): Promise<unknown> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as GroqChatResponse;
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Groq повернув порожню відповідь.');
      }
      return JSON.parse(content);
    }

    const errBody = await response.text().catch(() => '');
    lastError = new Error(`Groq API помилка ${response.status}. ${errBody.slice(0, 200)}`);

    const retryable = response.status === 429 || response.status === 503;
    if (!retryable || attempt === MAX_RETRIES) {
      if (response.status === 503) {
        throw new Error(
          'Сервер штучного інтелекту тимчасово перевантажений. Спробуйте ще раз через кілька секунд.'
        );
      }
      throw lastError;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
  }

  throw lastError ?? new Error('Groq API недоступний.');
}

interface RawWordCard {
  word?: string;
  phonetic?: string;
  partOfSpeech?: string;
  cefrLevel?: string;
  primaryTranslation?: string;
  alternativeTranslations?: string[];
  definition?: string;
  mnemonicHint?: string;
  collocations?: string[];
  contextExamples?: { sentence: string; translation: string }[];
  synonyms?: string[];
  antonyms?: string[];
  quiz?: { question: string; options: string[]; correctIndex: number };
}

export function mapRawWordToVocabularyItem(
  raw: RawWordCard,
  fallbackWord: string,
  level: string,
  addedBy: 'teacher' | 'student' | 'ai',
  idPrefix: string,
  index: number
): VocabularyItem {
  const now = Date.now();
  return {
    id: `${idPrefix}-${now}-${index}`,
    word: raw.word || fallbackWord,
    phonetic: raw.phonetic || '',
    partOfSpeech: (raw.partOfSpeech as PartOfSpeech) || 'noun',
    cefrLevel: (raw.cefrLevel as CEFRLevel) || (level as CEFRLevel) || 'B1',
    primaryTranslation: raw.primaryTranslation || '',
    alternativeTranslations: raw.alternativeTranslations || [],
    definition: raw.definition || '',
    mnemonicHint: raw.mnemonicHint || '',
    collocations: raw.collocations || [],
    contextExamples: raw.contextExamples || [],
    synonyms: raw.synonyms || [],
    antonyms: raw.antonyms || [],
    quiz: raw.quiz || {
      question: '',
      options: [raw.word || fallbackWord],
      correctIndex: 0,
    },
    status: 'learning',
    boxLevel: 1,
    nextReviewDate: new Date().toISOString(),
    addedBy,
    createdAt: new Date().toISOString(),
  };
}

export function buildPackPrompt(words: string[], targetLanguage: string, level: string): string {
  return `
Ти — експертний лінгвіст та методист платформи NovaFlow.
Перетвори список вхідних слів/фраз у масив навчальних карток словника.

ВХІДНІ ДАНІ:
Список слів/фраз: ${JSON.stringify(words)}
Цільова мова (мова, яку вивчає учень): ${targetLanguage}
Мова перекладу (рідна мова учня): Українська
Рівень учня: ${level}

НАПРЯМОК ПЕРЕКЛАДУ:
- Автоматично визнач мову кожного вхідного слова/фрази.
- "word" — слово ЦІЛЬОВОЮ мовою (${targetLanguage}). Якщо вхідне слово українське — перекласти на ${targetLanguage}.
- "primaryTranslation" — переклад українською. Якщо цільова мова "Ukrainian" — переклад англійською.
- "definition" — просте пояснення ЦІЛЬОВОЮ мовою.
- "contextExamples" — рівно 2 приклади: речення ЦІЛЬОВОЮ мовою + переклад українською.
- "mnemonicHint" — яскрава асоціація українською.
- "quiz" — fill-the-gap питання ЦІЛЬОВОЮ мовою з цим словом, 4 варіанти, correctIndex — індекс правильної відповіді.

Збережи оригінальний порядок слів. Кожен елемент масиву — ОДНЕ слово зі списку.

Поверни СТРОГО JSON-об'єкт у форматі:
{
  "items": [
    {
      "word": "string",
      "phonetic": "string",
      "partOfSpeech": "noun|verb|adjective|adverb|idiom|phrasal_verb",
      "cefrLevel": "A1|A2|B1|B2|C1|C2",
      "primaryTranslation": "string",
      "alternativeTranslations": ["string"],
      "definition": "string",
      "mnemonicHint": "string",
      "collocations": ["string"],
      "contextExamples": [{ "sentence": "string", "translation": "string" }],
      "synonyms": ["string"],
      "antonyms": ["string"],
      "quiz": { "question": "string", "options": ["string"], "correctIndex": 0 }
    }
  ]
}
`.trim();
}

export function buildSingleWordPrompt(
  word: string,
  targetLanguage: string,
  nativeLanguage: string,
  level: string
): string {
  return `
Ти — експертний лінгвіст та методист платформи NovaFlow.
Перетвори вхідне слово або фразу у навчальну картку словника.

ВХІДНІ ДАНІ:
Слово/фраза: "${word}"
Цільова мова: ${targetLanguage}
Мова перекладу: ${nativeLanguage}
Рівень учня: ${level}

- "word" — слово ЦІЛЬОВОЮ мовою (${targetLanguage}).
- "primaryTranslation" — переклад мовою ${nativeLanguage}.
- "definition" — пояснення ЦІЛЬОВОЮ мовою.
- "contextExamples" — 2 приклади речень ЦІЛЬОВОЮ мовою з перекладом на ${nativeLanguage}.
- "mnemonicHint" — асоціація мовою ${nativeLanguage}.
- "quiz" — fill-the-gap питання з 4 варіантами, correctIndex — індекс правильної відповіді.

Поверни СТРОГО JSON-об'єкт з полями картки:
{
  "word": "string",
  "phonetic": "string",
  "partOfSpeech": "noun|verb|adjective|adverb|idiom|phrasal_verb",
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "primaryTranslation": "string",
  "alternativeTranslations": ["string"],
  "definition": "string",
  "mnemonicHint": "string",
  "collocations": ["string"],
  "contextExamples": [{ "sentence": "string", "translation": "string" }],
  "synonyms": ["string"],
  "antonyms": ["string"],
  "quiz": { "question": "string", "options": ["string"], "correctIndex": 0 }
}
`.trim();
}
