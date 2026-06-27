'use client';

import { StudentProfile } from './types';
import { COURSES, LANG_CONFIG, DISCOUNT_THRESHOLD, DISCOUNT_PRICE } from './config';

interface PaymentsTabProps {
  profile: StudentProfile | null;
  learningLang: string;
  selectedCourseName: string | null;
  showCoursePicker: boolean;
  lessonCount: number;
  purchasing: boolean;
  onSetSelectedCourseName: (name: string | null) => void;
  onSetShowCoursePicker: (show: boolean) => void;
  onSetLessonCount: (count: number) => void;
  onBuyCourse: (planName: string, price: number, lessonsCount: number, lang: string) => void;
}

function LanguageBanner({ profile, learningLang }: { profile: StudentProfile | null; learningLang: string }) {
  const langCfg = LANG_CONFIG[learningLang] || LANG_CONFIG.english;
  return (
    <div className="rounded-2xl p-6 border border-gray-100 shadow-sm"
      style={{ background: langCfg.gradient, borderLeft: `4px solid ${langCfg.color}` }}>
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <span className="text-3xl">{langCfg.flag}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">Ти вивчаєш: {langCfg.label}</h3>
          <p className="text-sm text-gray-500">Обери план та продовж свій мовний шлях з NovaFlow</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-2xl font-bold text-purple-600">{profile?.lessons_left ?? 0}</span>
          <p className="text-xs text-gray-500">уроків залишилося</p>
        </div>
      </div>
    </div>
  );
}

function CoursePurchaseView({
  course, lessonCount, purchasing, learningLang, onBuyCourse, onSetLessonCount, onBackToPicker,
}: {
  course: { name: string; pricePerLesson: number; desc: string };
  lessonCount: number; purchasing: boolean; learningLang: string;
  onBuyCourse: (name: string, price: number, count: number, lang: string) => void;
  onSetLessonCount: (count: number) => void;
  onBackToPicker: () => void;
}) {
  const total = lessonCount >= DISCOUNT_THRESHOLD
    ? DISCOUNT_PRICE * lessonCount
    : course.pricePerLesson * lessonCount;

  return (
    <div className="sm:col-span-2 lg:col-span-3 max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
          Твій поточний курс
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
          <p className="text-sm text-gray-500 mt-2">{course.desc}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Обери кількість уроків:</label>
          <input type="range" min={1} max={20} value={lessonCount}
            onChange={(e) => onSetLessonCount(parseInt(e.target.value))}
            className="w-full accent-purple-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span><span>10 (Знижка)</span><span>20</span>
          </div>
        </div>

        <div className="text-center space-y-1 mb-6">
          <p className="text-sm text-gray-500">
            Кількість: <span className="text-xl font-bold text-purple-700">{lessonCount}</span> уроків
          </p>
          <p className="text-sm text-gray-500">
            До сплати: <span className="text-xl font-bold text-emerald-600">${total}</span>
          </p>
          {lessonCount >= DISCOUNT_THRESHOLD && (
            <p className="text-xs text-amber-600 font-medium">🎉 Застосовано знижку $1 за урок!</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => onBuyCourse(course.name, lessonCount >= DISCOUNT_THRESHOLD ? DISCOUNT_PRICE : course.pricePerLesson, lessonCount, learningLang)}
            disabled={purchasing}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {purchasing ? '⏳ Обробка...' : `💳 Оплатити ${lessonCount} уроків — $${total}`}
          </button>
          <button onClick={onBackToPicker}
            className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Змінити курс
          </button>
        </div>
      </div>
    </div>
  );
}


export default function PaymentsTab({
  profile, learningLang, selectedCourseName, showCoursePicker,
  lessonCount, purchasing, onSetSelectedCourseName,
  onSetShowCoursePicker, onSetLessonCount, onBuyCourse,
}: PaymentsTabProps) {
  const courseList = COURSES[learningLang] || COURSES.english;

  return (
    <div className="space-y-6 animate-fadeIn">
      <LanguageBanner profile={profile} learningLang={learningLang} />

      <div>
        <h2 className="text-xl font-bold text-gray-900">Поповнити баланс уроків</h2>
        <p className="text-sm text-gray-500 mt-1">Обери план та продовж навчання</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {selectedCourseName && !showCoursePicker ? (
          (() => {
            const course = courseList.find((c: { name: string }) => c.name === selectedCourseName) || courseList[0];
            return (
              <CoursePurchaseView
                course={course}
                lessonCount={lessonCount}
                purchasing={purchasing}
                learningLang={learningLang}
                onBuyCourse={onBuyCourse}
                onSetLessonCount={onSetLessonCount}
                onBackToPicker={() => { onSetShowCoursePicker(true); onSetLessonCount(10); }}
              />
            );
          })()
        ) : (
          courseList.map((course: { id: string; name: string; pricePerLesson: number; desc: string }) => (
            <div key={course.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{course.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">${course.pricePerLesson}</span>
                  <span className="text-sm text-gray-500">/ урок</span>
                </div>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{course.desc}</p>
              </div>
              <button onClick={() => { onSetSelectedCourseName(course.name); onSetShowCoursePicker(false); onSetLessonCount(10); }}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all">
                Обрати цей курс
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900">Хочеш змінити мову навчання?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Відвідай сторінку потрібного курсу та придбай план — він автоматично оновиться тут.
            </p>
          </div>
          <a href="/languages/english"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors shadow-sm">
            🏫 До курсів
          </a>
        </div>
      </div>
    </div>
  );
}

