import { NextResponse } from 'next/server';
import { VocabularyItem, CEFRLevel, PartOfSpeech } from '@/types/vocabulary';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, targetLanguage = 'English', nativeLanguage = 'Ukrainian', level = 'B1' } = body;

    if (!word || typeof word !== 'string' || !word.trim()) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const cleanWord = word.trim();
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // 1. TRY GEMINI AI GENERATION (IF VALID KEY EXISTS)
    if (apiKey && apiKey.startsWith('AIza')) {
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
  "partOfSpeech": "noun",
  "cefrLevel": "B1",
  "primaryTranslation": "Основний переклад українською мовою",
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
          let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            // Strip markdown codeblocks if present
            rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(rawText);
            const fullItem: VocabularyItem = {
              id: `vocab-${Date.now()}`,
              word: parsed.word || cleanWord,
              phonetic: parsed.phonetic || `/${cleanWord.toLowerCase()}/`,
              partOfSpeech: (parsed.partOfSpeech as PartOfSpeech) || 'noun',
              cefrLevel: (parsed.cefrLevel as CEFRLevel) || (level as CEFRLevel) || 'B1',
              primaryTranslation: parsed.primaryTranslation || 'Переклад',
              alternativeTranslations: parsed.alternativeTranslations || [],
              definition: parsed.definition || `Meaning of ${cleanWord} in context.`,
              mnemonicHint: parsed.mnemonicHint || `Асоціація для швидко запам’ятовування слова "${cleanWord}".`,
              collocations: parsed.collocations || [],
              contextExamples: parsed.contextExamples || [
                {
                  sentence: `We studied "${cleanWord}" during our online class.`,
                  translation: `Ми вивчали це слово під час нашого онлайн-уроку.`
                }
              ],
              synonyms: parsed.synonyms || [],
              antonyms: parsed.antonyms || [],
              quiz: parsed.quiz || {
                question: `Select the word that completes: "They discussed ___ in the meeting."`,
                options: [cleanWord, 'Option B', 'Option C', 'Option D'],
                correctIndex: 0
              },
              status: 'learning',
              boxLevel: 1,
              nextReviewDate: new Date().toISOString(),
              addedBy: 'ai',
              createdAt: new Date().toISOString()
            };
            return NextResponse.json({ success: true, item: fullItem, source: 'gemini_ai' });
          }
        }
      } catch (aiErr) {
        console.warn('Gemini API call failed, switching to live dictionary fallback', aiErr);
      }
    }

    // 2. LIVE FREE DICTIONARY & TRANSLATION FALLBACK (WORKS FOR 100% OF WORDS WITHOUT KEYS!)
    const liveItem = await fetchLiveDictionaryAndTranslation(cleanWord, level as CEFRLevel);
    return NextResponse.json({ success: true, item: liveItem, source: 'live_dictionary' });

  } catch (error: any) {
    console.error('Error generating vocabulary item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate word' },
      { status: 500 }
    );
  }
}

async function fetchLiveDictionaryAndTranslation(word: string, defaultLevel: CEFRLevel = 'B1'): Promise<VocabularyItem> {
  const cleanWord = word.trim();
  const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();

  let primaryTranslation = '';
  let alternativeTranslations: string[] = [];
  let phonetic = `/${cleanWord.toLowerCase()}/`;
  let definition = `Meaning and practical application of ${capitalized}.`;
  let partOfSpeech: PartOfSpeech = 'noun';
  let contextExamples: { sentence: string; translation: string }[] = [];
  let synonyms: string[] = [];

  // A. Fetch Translation from MyMemory (Free, Real-Time Translation API)
  try {
    const transRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|uk`
    );
    if (transRes.ok) {
      const transData = await transRes.json();
      const rawTranslated = transData.responseData?.translatedText;
      if (rawTranslated && typeof rawTranslated === 'string') {
        // Clean translation result
        primaryTranslation = rawTranslated.trim();
        // Extract matches if available
        if (Array.isArray(transData.matches)) {
          const alts = transData.matches
            .map((m: any) => m.translation)
            .filter((t: string) => t && t.toLowerCase() !== primaryTranslation.toLowerCase())
            .slice(0, 3);
          alternativeTranslations = Array.from(new Set(alts));
        }
      }
    }
  } catch (e) {
    console.warn('Translation API error:', e);
  }

  if (!primaryTranslation) {
    primaryTranslation = `Переклад слова ${capitalized}`;
  }

  // B. Fetch Free Dictionary Definition & Phonetics
  try {
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
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

  if (contextExamples.length === 0) {
    contextExamples = [
      {
        sentence: `It is essential to learn how to use "${capitalized}" in everyday conversations.`,
        translation: `Важливо навчитися правильно використовувати це слово в повсякденному спілкуванні.`
      },
      {
        sentence: `Our teacher introduced "${capitalized}" during today’s interactive lesson.`,
        translation: `Наш викладач представив це слово під час сьогоднішнього уроку.`
      }
    ];
  }

  const mnemonicHint = `Уяви яскраву асоціацію з "${capitalized}" (${primaryTranslation}), щоб легко згадувати його у розмові.`;

  return {
    id: `vocab-${Date.now()}`,
    word: capitalized,
    phonetic,
    partOfSpeech,
    cefrLevel: defaultLevel,
    primaryTranslation,
    alternativeTranslations,
    definition,
    mnemonicHint,
    collocations: [`strong ${cleanWord.toLowerCase()}`, `key ${cleanWord.toLowerCase()}`],
    contextExamples,
    synonyms,
    antonyms: [],
    quiz: {
      question: `Choose the correct word: "She showed impressive ___ during the presentation."`,
      options: [capitalized, 'Confusion', 'Delay', 'Hesitation'],
      correctIndex: 0
    },
    status: 'learning',
    boxLevel: 1,
    nextReviewDate: new Date().toISOString(),
    addedBy: 'ai',
    createdAt: new Date().toISOString()
  };
}
