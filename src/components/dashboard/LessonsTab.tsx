import { useRef } from 'react';

export default function LessonsTab() {
  const calendarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Розклад занять</h2>
      <p className="text-sm text-gray-500 mb-6">Тут відображаються всі твої заплановані уроки.</p>
      <div ref={calendarRef} id="student-calendar-element" className="min-h-[350px]" />
    </div>
  );
}
