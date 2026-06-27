'use client';

import { Tab, Homework, Lesson, StudentProfile } from './types';
import CalendarView from './CalendarView';

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface DashboardTabHomeProps {
  profile: StudentProfile | null;
  hasLessons: boolean;
  learningLang: string;
  activeHomework: Homework | null;
  nextLesson: Lesson | null;
  allLessons: Lesson[];
  onSwitchTab: (tab: Tab) => void;
}


function TrialBanner({ onSwitchTab }: { onSwitchTab: (tab: Tab) => void }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-purple-50/30 border border-amber-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-amber-900">🚀 Твій пробний період активний!</h2>
          <p className="text-sm text-amber-700 mt-2 max-w-xl">
            Тобі доступно 1 безкоштовне заняття. Оплати повноцінний курс, щоб відкрити домашні завдання,
            розклад та розширені матеріали від Кирила.
          </p>
        </div>
        <button
          onClick={() => onSwitchTab('payments')}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
        >
          💎 Обрати тарифний план
        </button>
      </div>
    </div>
  );
}

function NextLessonCard({ nextLesson }: { nextLesson: Lesson | null }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 border-t-4 border-t-green-500 hover:shadow-md transition-shadow">
      <div className="p-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full mb-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Наступний урок
        </span>
        {nextLesson ? (
          <>
            <h2 className="text-lg font-bold text-gray-900">
              🕐 {new Date(nextLesson.start_time).toLocaleTimeString('uk-UA', {
                hour: '2-digit', minute: '2-digit',
              })}
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">👨‍🏫 Викладач: Кирило</p>
            <a
              href="https://zoom.us"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors shadow-sm"
            >
              📹 Join Lesson
            </a>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-600">Розклад не заплановано</h2>
            <p className="text-sm text-gray-500 mt-1">Твій викладач ще не призначив наступне заняття.</p>
          </>
        )}
      </div>
    </div>
  );
}

function ActiveHomeworkCard({ activeHomework, onSwitchTab }: { activeHomework: Homework | null; onSwitchTab: (tab: Tab) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Активне домашнє завдання</h3>
        {activeHomework ? (
          <>
            <h4 className="font-bold text-gray-900">{activeHomework.title}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activeHomework.description}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              🕐 Дедлайн: {formatDate(activeHomework.deadline)}
            </p>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-3 ${
              activeHomework.status === 'completed'
                ? 'bg-green-50 text-green-700'
                : activeHomework.status === 'reviewed'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {activeHomework.status === 'completed' ? '✅ Виконано' :
               activeHomework.status === 'reviewed' ? '🔍 Перевірено' : '⏳ Очікує виконання'}
            </span>
            <button
              onClick={() => onSwitchTab('homework')}
              className="block mt-3 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              Перейти до ДЗ →
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-500">Активних завдань немає</p>
        )}
      </div>
    </div>
  );
}


export default function DashboardTabHome({
  profile,
  hasLessons,
  learningLang,
  activeHomework,
  nextLesson,
  allLessons,
  onSwitchTab,
}: DashboardTabHomeProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {!hasLessons && <TrialBanner onSwitchTab={onSwitchTab} />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Поточний прогрес</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700">
              {learningLang === 'german' ? 'German' :
               learningLang === 'ukrainian' ? 'Ukrainian' : 'English'} {hasLessons ? 'B2' : 'A1'}
            </span>
            <span className="text-2xl font-bold text-gray-900">{hasLessons ? '72' : '0'}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${hasLessons ? 72 : 0}%` }}
            />
          </div>
        </div>

        {/* Paid Content Group */}
        {hasLessons && (
          <div className="lg:col-span-2 space-y-4">
            <NextLessonCard nextLesson={nextLesson} />
            <ActiveHomeworkCard activeHomework={activeHomework} onSwitchTab={onSwitchTab} />
          </div>
        )}

        {/* Balance Card — завжди видима, актуальні дані з БД */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-xl">🎓</div>
            <div>
              <p className="text-xs font-medium text-gray-500">Баланс занять</p>
              <h3 className="text-2xl font-bold text-gray-900">{profile?.lessons_left ?? 0}</h3>
              <p className="text-xs text-gray-400">уроків залишилося</p>
              {(profile?.lessons_left ?? 0) === 0 && (
                <button
                  onClick={() => onSwitchTab('payments')}
                  className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  💳 Поповнити баланс
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">📅 Розклад занять</h2>
          <p className="text-sm text-gray-500 mt-1">Тут відображаються всі твої заплановані уроки.</p>
        </div>
        <CalendarView lessons={allLessons} />
      </div>
    </div>
  );
}
