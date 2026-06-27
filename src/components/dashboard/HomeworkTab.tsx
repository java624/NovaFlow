'use client';

import { Homework, StudentProfile } from './types';
import { formatDate } from './DashboardTabHome';
import HomeworkCanvas from './HomeworkCanvas';

interface HomeworkTabProps {
  profile: StudentProfile | null;
  homeworks: Homework[];
  activeHomework: Homework | null;
  reviewedHomework: Homework | null;
  currentImageUrl: string | null;
  currentHomeworkId: string | null;
  onLoadHomeworks: (studentId: string) => void;
  onSelectHomework: (hw: Homework) => void;
  onCloseReview: () => void;
}

export default function HomeworkTab({
  profile, homeworks, activeHomework, reviewedHomework,
  currentImageUrl, currentHomeworkId,
  onLoadHomeworks, onSelectHomework, onCloseReview,
}: HomeworkTabProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 🔴 ГОЛОВНЕ АКТИВНЕ ЗАВДАННЯ */}
      {activeHomework && (
        <div id="homework-alert-box" className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 id="tab-homework-title" className="font-bold text-lg text-gray-900">{activeHomework.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              activeHomework.status === 'reviewed' ? 'bg-green-100 text-green-700' :
              activeHomework.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {activeHomework.status === 'reviewed' ? '✅ Перевірено' :
               activeHomework.status === 'submitted' ? '⏳ На перевірці' : '📝 Нове завдання'}
            </span>
          </div>
          <p id="tab-homework-desc" className="text-sm text-gray-700 mt-2">
            {activeHomework.description || 'Опис відсутній'}
          </p>
          <p id="tab-homework-deadline" className="text-sm text-gray-500 mt-2 flex items-center gap-1">
            🕐 Здати до: {formatDate(activeHomework.deadline)}
          </p>
          {currentImageUrl && currentHomeworkId && (
            <div id="tab-homework-action-block" className="mt-4">
              <button type="button"
                onClick={() => {
                  const editorEl = document.getElementById('homework-editor-zone');
                  if (editorEl) {
                    editorEl.classList.toggle('hidden');
                    editorEl.style.display = editorEl.classList.contains('hidden') ? 'none' : 'block';
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all">
                📝 Відкрити інтерактивну дошку
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🎨 ІНТЕРАКТИВНА ДОШКА (КАНВАС) */}
      {currentImageUrl && currentHomeworkId && (
        <div id="homework-editor-zone" className="hidden">
          <HomeworkCanvas
            imageUrl={currentImageUrl}
            homeworkId={currentHomeworkId}
            onSave={() => { if (profile) onLoadHomeworks(profile.id); }}
          />
        </div>
      )}

      {/* 🟢 РЕЗУЛЬТАТ ПЕРЕВІРКИ ВЧИТЕЛЕМ */}
      {reviewedHomework && reviewedHomework.status === 'reviewed' && (
        <div id="student-review-zone" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-green-600 flex items-center gap-2">📋 Результат перевірки вчителем</h3>
            <button onClick={onCloseReview} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Тут ви можете побачити виправлення вчителя на зображенні та його зауваження.</p>
          {reviewedHomework.student_response_url && (
            <div className="bg-gray-50 rounded-xl p-2 mb-4 flex items-center justify-center overflow-hidden max-h-[500px] border border-dashed border-gray-200">
              <img src={`${reviewedHomework.student_response_url}?t=${Date.now()}`}
                alt="Перевірене завдання"
                className="max-w-full max-h-[480px] object-contain rounded-lg" />
            </div>
          )}
          <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl p-4 text-sm text-gray-700 whitespace-pre-line max-h-[250px] overflow-y-auto">
            {reviewedHomework.teacher_comment ? (
              <><strong className="text-indigo-700 flex items-center gap-1 mb-2">💬 Коментар вчителя:</strong><p>{reviewedHomework.teacher_comment}</p></>
            ) : (
              <p className="text-gray-500 italic">Текстових коментарів до цього завдання поки немає.</p>
            )}
          </div>
        </div>
      )}

      {/* 📊 🆕 НОВИЙ БЛОК: ІСТОРІЯ ДОМАШНІХ ЗАВДАНЬ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-900 mb-4">📚 Історія домашніх завдань</h3>
        {homeworks.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Тобі ще не задавали домашніх завдань.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homeworks.map((hw) => (
              <button
                key={hw.id}
                type="button"
                onClick={() => onSelectHomework(hw)}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between h-32 hover:shadow-sm ${
                  activeHomework?.id === hw.id
                    ? 'border-purple-500 bg-purple-50/30'
                    : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{hw.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{hw.description || 'Без опису'}</p>
                </div>
                <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-gray-100/50">
                  <span className="text-[10px] text-gray-400">
                    {formatDate(hw.created_at)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    hw.status === 'reviewed' ? 'bg-green-50 text-green-700' :
                    hw.status === 'submitted' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {hw.status === 'reviewed' ? 'Перевірено' :
                     hw.status === 'submitted' ? 'На перевірці' : 'Нове'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}