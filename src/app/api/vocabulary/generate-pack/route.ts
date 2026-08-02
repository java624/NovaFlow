import { NextResponse } from 'next/server';
import { VocabularyItem, CEFRLevel, PartOfSpeech } from '@/types/vocabulary';

export const dynamic = 'force-dynamic';

interface GeneratePackRequest {
  rawInput: string;
  targetLanguage: string;
  level?: string;
}

// Map target language names to MyMemory API language codes
const LANGUAGE_CODES: Record<string, string> = {
  English: 'en',
  German: 'de',
  French: 'fr',
  Spanish: 'es',
  Polish: 'pl',
  Italian: 'it',
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GeneratePackRequest;
    const { rawInput, targetLanguage = 'English', level = 'B1' } = body;

    if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
      return NextResponse.json({ error: 'rawInput is required' }, { status: 400 });
    }

    const words = rawInput
      .split(/[,\n;]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length === 0) {
      return NextResponse.json({ error: 'Не знайдено жодного слова у введеному тексті' }, { status: 400 });
    }

    if (words.length > 30) {
      return NextResponse.json(
        { error: 'Максимум 30 слів за один пакет. Розділіть на кілька пакетів.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // 1. TRY GEMINI AI BATCH GENERATION
    if (apiKey && apiKey.startsWith('AIza')) {
      try {
        const items = await generateWithGemini(words, targetLanguage, level, apiKey);
        if (items) {
          return NextResponse.json({ success: true, items, source: 'gemini_ai' });
        }
      } catch (aiErr) {
        console.warn('Gemini batch API call failed, switching to fallback', aiErr);
      }
    }

    // 2. FALLBACK: Live Dictionary + Translation for each word
    const fallbackItems: VocabularyItem[] = [];
    for (let i = 0; i < words.length; i++) {
      const item = await fetchLiveDictionaryAndTranslation(
        words[i],
        level as CEFRLevel,
        i,
        targetLanguage
      );
      fallbackItems.push(item);
    }
    return NextResponse.json({ success: true, items: fallbackItems, source: 'live_dictionary' });

  } catch (error: any) {
    console.error('Error generating vocabulary pack:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate vocabulary pack' },
      { status: 500 }
    );
  }
}

async function generateWithGemini(
  words: string[],
  targetLanguage: string,
  level: string,
  apiKey: string
): Promise<VocabularyItem[] | null> {
  const promptText = `
Ти — експертний лінгвіст та методист платформи NovaFlow.
Твоє завдання — перетворити список вхідних слів/фраз (українською мовою) у масив багатих навчальних карток словника.

ВХІДНІ ДАНІ:
Список слів/фраз (українською): ${JSON.stringify(words)}
Цільова мова (мова, яку вивчає учень): ${targetLanguage}
Мова перекладу (рідна мова учня): Українська
Рівень учня: ${level}

КРИТИЧНО ВАЖЛИВО — НАПРЯМОК ПЕРЕКЛАДУ:
- Поле "word" має містити ПЕРЕКЛАД вхідного слова ЦІЛЬОВОЮ МОВОЮ (${targetLanguage}).
  Наприклад: вхідне слово "літак" + цільова мова "German" → "word": "Flugzeug".
  Вхідне слово "літак" + цільова мова "English" → "word": "airplane".
- Поле "primaryTranslation" має містити ПЕРЕКЛАД назад українською (початкове слово).
  Наприклад: "word": "Flugzeug" → "primaryTranslation": "літак".
- Поле "definition" має бути поясненням ЦІЛЬОВОЮ МОВОЮ (${targetLanguage}).
- Поле "contextExamples" — речення ЦІЛЬОВОЮ МОВОЮ (${targetLanguage}) з перекладом українською.
- Поле "mnemonicHint" — асоціація українською.

ВИМОГИ ДО ВІДПОВІДІ:
Поверни СТРОГО масив об'єктів у форматі JSON без жодних додаткових пояснень чи розмітки markdown:
[
  {
    "word": "перекладене слово цільовою мовою (${targetLanguage})",
    "phonetic": "/транскрипція IPA/",
    "partOfSpeech": "noun|verb|adjective|adverb|idiom|phrasal_verb",
    "cefrLevel": "A1|A2|B1|B2|C1|C2",
    "primaryTranslation": "Переклад українською (початкове слово)",
    "alternativeTranslations": ["альтернативний переклад 1", "альтернативний переклад 2"],
    "definition": "Просте пояснення значення цільовою мовою (${targetLanguage})",
    "mnemonicHint": "Яскрава підказка-асоціація українською",
    "collocations": ["словосполучення 1 цільовою мовою", "словосполучення 2 цільовою мовою"],
    "contextExamples": [
      { "sentence": "Приклад 1 цільовою мовою (${targetLanguage})", "translation": "Переклад 1 українською" },
      { "sentence": "Приклад 2 цільовою мовою (${targetLanguage})", "translation": "Переклад 2 українською" }
    ],
    "synonyms": ["синонім 1 цільовою мовою", "синонім 2 цільовою мовою"],
    "antonyms": ["антонім 1 цільовою мовою"]
  }
]

Правила:
- Кожен елемент масиву відповідає ОДНОМУ слову зі списку.
- Збережи порядок слів як у вхідному списку.
- Для кожного слова згенеруй точний переклад цільовою мовою, IPA-транскрипцію, дефініцію, 1-2 контекстні речення з перекладом.
- Якщо слово є фразою (наприклад "затримка рейсу"), збережи його як фразу цільовою мовою.
`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    }
  );

  if (!geminiRes.ok) return null;

  const geminiData = await geminiRes.json();
  let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const now = Date.now();
  return parsed.map((p: any, idx: number) => ({
    id: `vocab-pack-${now}-${idx}`,
    word: p.word || words[idx] || 'Unknown',
    phonetic: p.phonetic || `/${(p.word || words[idx] || '').toLowerCase()}/`,
    partOfSpeech: (p.partOfSpeech as PartOfSpeech) || 'noun',
    cefrLevel: (p.cefrLevel as CEFRLevel) || (level as CEFRLevel) || 'B1',
    primaryTranslation: p.primaryTranslation || words[idx] || 'Переклад',
    alternativeTranslations: p.alternativeTranslations || [],
    definition: p.definition || `Meaning of ${p.word || words[idx]} in context.`,
    mnemonicHint: p.mnemonicHint || `Асоціація для швидкого запам'ятовування слова "${p.word || words[idx]}".`,
    collocations: p.collocations || [],
    contextExamples: p.contextExamples || [
      {
        sentence: `We studied "${p.word || words[idx]}" during our online class.`,
        translation: `Ми вивчали це слово під час нашого онлайн-уроку.`
      }
    ],
    synonyms: p.synonyms || [],
    antonyms: p.antonyms || [],
    quiz: {
      question: `Select the word that completes: "They discussed ___ in the meeting."`,
      options: [p.word || words[idx], 'Option B', 'Option C', 'Option D'],
      correctIndex: 0
    },
    status: 'learning',
    boxLevel: 1,
    nextReviewDate: new Date().toISOString(),
    addedBy: 'teacher',
    createdAt: new Date().toISOString()
  }));
}

async function fetchLiveDictionaryAndTranslation(
  word: string,
  defaultLevel: CEFRLevel = 'B1',
  index: number = 0,
  targetLanguage: string = 'English'
): Promise<VocabularyItem> {
  const cleanWord = word.trim();
  const targetCode = LANGUAGE_CODES[targetLanguage] || 'en';

  let translatedWord = '';
  let primaryTranslation = cleanWord; // Початкове слово українською
  let alternativeTranslations: string[] = [];
  let phonetic = `/${cleanWord.toLowerCase()}/`;
  let definition = `Meaning and practical application of ${cleanWord}.`;
  let partOfSpeech: PartOfSpeech = 'noun';
  let contextExamples: { sentence: string; translation: string }[] = [];
  let synonyms: string[] = [];

  // A. Fetch Translation from MyMemory: uk -> target language
  try {
    const transRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=uk|${targetCode}`
    );
    if (transRes.ok) {
      const transData = await transRes.json();
      const rawTranslated = transData.responseData?.translatedText;
      if (rawTranslated && typeof rawTranslated === 'string') {
        translatedWord = rawTranslated.trim();
        if (Array.isArray(transData.matches)) {
          const alts = transData.matches
            .map((m: any) => m.translation)
            .filter((t: string) => t && t.toLowerCase() !== translatedWord.toLowerCase())
            .slice(0, 3);
          alternativeTranslations = Array.from(new Set(alts));
        }
      }
    }
  } catch (e) {
    console.warn('Translation API error:', e);
  }

  if (!translatedWord) {
    translatedWord = cleanWord;
  }

  // B. Fetch Free Dictionary Definition & Phonetics (for English target)
  if (targetCode === 'en') {
    try {
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(translatedWord)}`
      );
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        if (Array.isArray(dictData) && dictData[0]) {
          const entry = dictData[0];
          if (entry.phonetic) phonetic = entry.phonetic;
          else if (entry.phonetics && entry.phonetics[0]?.text) phonetic = entry.phonetics[0].text;

          if (Array.isArray(entry.meanings) && entry.meanings[0]) {
            const meaning = entry.meanings[0];
            if (meaning.partOfSpeech) {
              const pos = meaning.partOfSpeech.toLowerCase();
              if (['noun', 'verb', 'adjective', 'adverb', 'idiom'].includes(pos)) {
                partOfSpeech = pos as PartOfSpeech;
              }
            }
            if (Array.isArray(meaning.definitions) && meaning.definitions[0]) {
              const defObj = meaning.definitions[0];
              if (defObj.definition) definition = defObj.definition;
              if (defObj.example) {
                contextExamples.push({
                  sentence: defObj.example,
                  translation: `Приклад вживання: "${defObj.example}"`
                });
              }
              if (Array.isArray(defObj.synonyms) && defObj.synonyms.length > 0) {
                synonyms = defObj.synonyms.slice(0, 3);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Free Dictionary API error:', e);
    }
  }

  if (contextExamples.length === 0) {
    contextExamples = [
      {
        sentence: `It is essential to learn how to use "${translatedWord}" in everyday conversations.`,
        translation: `Важливо навчитися правильно використовувати це слово в повсякденному спілкуванні.`
      },
      {
        sentence: `Our teacher introduced "${translatedWord}" during today's interactive lesson.`,
        translation: `Наш викладач представив це слово під час сьогоднішнього уроку.`
      }
    ];
  }

  const mnemonicHint = `Уяви яскраву асоціацію з "${translatedWord}" (${primaryTranslation}), щоб легко згадувати його у розмові.`;

  return {
    id: `vocab-pack-${Date.now()}-${index}`,
    word: translatedWord,
    phonetic,
    partOfSpeech,
    cefrLevel: defaultLevel,
    primaryTranslation,
    alternativeTranslations,
    definition,
    mnemonicHint,
    collocations: [`strong ${translatedWord.toLowerCase()}`, `key ${translatedWord.toLowerCase()}`],
    contextExamples,
    synonyms,
    antonyms: [],
    quiz: {
      question: `Choose the correct word: "She showed impressive ___ during the presentation."`,
      options: [translatedWord, 'Confusion', 'Delay', 'Hesitation'],
      correctIndex: 0
    },
    status: 'learning',
    boxLevel: 1,
    nextReviewDate: new Date().toISOString(),
    addedBy: 'teacher',
    createdAt: new Date().toISOString()
  };
}