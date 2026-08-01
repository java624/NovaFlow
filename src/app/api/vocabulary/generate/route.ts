import { NextResponse } from 'next/server';
import { VocabularyItem, CEFRLevel } from '@/types/vocabulary';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, targetLanguage = 'English', nativeLanguage = 'Ukrainian', level = 'B1' } = body;

    if (!word || typeof word !== 'string' || !word.trim()) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const cleanWord = word.trim();

    // Check if Gemini API key exists in environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey && process.env.GEMINI_API_KEY) {
      try {
        const promptText = `
Ти — експертний лінгвіст та методист платформи NovaFlow.
Твоє завдання — перетворити вхідне слово або фразу у багату навчальну картку словника.

ВХІДНІ ДАНІ:
Слово/фраза: "${cleanWord}"
Цільова мова: ${targetLanguage}
Мова перекладу: ${nativeLanguage}
Рівень учня: ${level}

ВИМОГИ ДО ВІДПОВІДІ:
Поверни СТРОГО один об'єкт у форматі JSON без жодних додаткових пояснень чи розмітки markdown:
{
  "word": "${cleanWord}",
  "phonetic": "/транскрипція/",
  "partOfSpeech": "noun | verb | adjective | adverb | idiom | phrasal_verb",
  "cefrLevel": "A1 | A2 | B1 | B2 | C1 | C2",
  "primaryTranslation": "Основний переклад українською",
  "alternativeTranslations": ["альтернативний 1", "альтернативний 2"],
  "definition": "Просте пояснення значення англійською",
  "mnemonicHint": "Яскрава підказка-асоціація українською",
  "collocations": ["словосполучення 1", "словосполучення 2"],
  "contextExamples": [
    { "sentence": "Приклад 1 англійською", "translation": "Переклад 1 українською" },
    { "sentence": "Приклад 2 англійською", "translation": "Переклад 2 українською" }
  ],
  "synonyms": ["синонім 1", "синонім 2"],
  "antonyms": ["антонім 1"],
  "quiz": {
    "question": "Речення з пропущеним словом ___",
    "options": ["Правильне слово", "Помилка 1", "Помилка 2", "Помилка 3"],
    "correctIndex": 0
  }
}
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

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const fullItem: VocabularyItem = {
              id: `vocab-${Date.now()}`,
              word: parsed.word || cleanWord,
              phonetic: parsed.phonetic || `/${cleanWord.toLowerCase()}/`,
              partOfSpeech: parsed.partOfSpeech || 'noun',
              cefrLevel: (parsed.cefrLevel as CEFRLevel) || (level as CEFRLevel) || 'B1',
              primaryTranslation: parsed.primaryTranslation || 'Переклад',
              alternativeTranslations: parsed.alternativeTranslations || [],
              definition: parsed.definition || 'Meaning of the word in context.',
              mnemonicHint: parsed.mnemonicHint || 'Асоціація для пам’яті.',
              collocations: parsed.collocations || [],
              contextExamples: parsed.contextExamples || [
                {
                  sentence: `I learned how to use ${cleanWord} effectively today.`,
                  translation: `Сьогодні я навчився ефективно використовувати це слово.`
                }
              ],
              synonyms: parsed.synonyms || [],
              antonyms: parsed.antonyms || [],
              quiz: parsed.quiz || {
                question: `Which word best fits the context of '${cleanWord}'?`,
                options: [cleanWord, 'Option B', 'Option C', 'Option D'],
                correctIndex: 0
              },
              status: 'learning',
              boxLevel: 1,
              nextReviewDate: new Date().toISOString(),
              addedBy: 'ai',
              createdAt: new Date().toISOString()
            };
            return NextResponse.json({ success: true, item: fullItem });
          }
        }
      } catch (aiErr) {
        console.warn('Gemini API call failed, using intelligent fallback generator', aiErr);
      }
    }

    // Intelligent Fallback Generator if AI key is missing or fails
    const mockItem: VocabularyItem = generateFallbackWord(cleanWord, level as CEFRLevel);
    return NextResponse.json({ success: true, item: mockItem, isFallback: true });

  } catch (error: any) {
    console.error('Error generating vocabulary item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate word' },
      { status: 500 }
    );
  }
}

function generateFallbackWord(word: string, defaultLevel: CEFRLevel = 'B1'): VocabularyItem {
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  return {
    id: `vocab-${Date.now()}`,
    word: capitalized,
    phonetic: `/${word.toLowerCase()}/`,
    partOfSpeech: word.endsWith('ly') ? 'adverb' : word.endsWith('ing') || word.endsWith('ed') ? 'verb' : 'noun',
    cefrLevel: defaultLevel,
    primaryTranslation: `Переклад для ${capitalized}`,
    alternativeTranslations: ['значення 1', 'значення 2'],
    definition: `Detailed definition and contextual usage for the word "${capitalized}".`,
    mnemonicHint: `Уяви яскраву асоціацію зі словом "${capitalized}", щоб швидко згадувати його у розмові.`,
    collocations: [`strong ${capitalized.toLowerCase()}`, `key ${capitalized.toLowerCase()}`],
    contextExamples: [
      {
        sentence: `It is important to remember how to use "${capitalized}" correctly.`,
        translation: `Важливо пам’ятати, як правильно використовувати "${capitalized}".`
      },
      {
        sentence: `Our teacher introduced "${capitalized}" during today’s interactive lesson.`,
        translation: `Наш викладач представив це слово під час сьогоднішнього уроку.`
      }
    ],
    synonyms: ['related_word_1', 'related_word_2'],
    antonyms: ['opposite_word_1'],
    quiz: {
      question: `Choose the correct word to complete: "She demonstrated impressive ___ in her work."`,
      options: [capitalized, 'Hesitation', 'Confusion', 'Disbelief'],
      correctIndex: 0
    },
    status: 'learning',
    boxLevel: 1,
    nextReviewDate: new Date().toISOString(),
    addedBy: 'ai',
    createdAt: new Date().toISOString()
  };
}
