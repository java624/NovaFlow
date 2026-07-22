'use client';

import { useRef } from 'react';
import { Lesson } from './types';

interface LessonsTabProps {
  allLessons: Lesson[];
  onEnterLesson: (channelName: string) => void;
}

export default function LessonsTab({ allLessons, onEnterLesson }: LessonsTabProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Розклад занять</h2>
      <p className="text-sm text-gray-500 mb-6">Тут відображаються всі твої заплановані уроки.</p>

      {/* List of upcoming lessons with "Увійти на урок" button */}
      {allLessons.length > 0 && (
        <div className="mb-6 space-y-3">
          {allLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  🕐 {new Date(lesson.start_time).toLocaleString('uk-UA', {
                    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                {lesson.end_time && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    до {new Date(lesson.end_time).toLocaleTimeString('uk-UA', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => onEnterLesson(lesson.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors shadow-sm"
              >
                📹 Увійти
              </button>
            </div>
          ))}
        </div>
      )}

      <div ref={calendarRef} id="student-calendar-element" className="min-h-[350px]" />
    </div>
  );
}
