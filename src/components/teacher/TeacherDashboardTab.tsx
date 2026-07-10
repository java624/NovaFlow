'use client';

import { useEffect, useRef, useState } from 'react';
import { Lesson, StudentProfile } from './types';

interface TeacherDashboardTabProps {
  activeStudentsCount: number;
  weeklyLessonsCount: number;
  nextLesson: Lesson | null;
  countdownText: string;
  allLessons: Lesson[];
  students: StudentProfile[];
  onStudentClick: (student: StudentProfile) => void;
}

export default function TeacherDashboardTab({
  activeStudentsCount,
  weeklyLessonsCount,
  nextLesson,
  countdownText,
  allLessons,
  students,
  onStudentClick,
}: TeacherDashboardTabProps) {
  const generalCalendarRef = useRef<HTMLDivElement>(null);
  const genCalendarInstanceRef = useRef<{ destroy: () => void } | null>(null);

  // ── Mobile breakpoint tracker ─────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // General calendar — re-initializes on lessons or mobile-breakpoint change
  useEffect(() => {
    if (!generalCalendarRef.current || allLessons.length === 0) return;
    let mounted = true;

    // Destroy previous instance before recreating for new view
    if (genCalendarInstanceRef.current) {
      genCalendarInstanceRef.current.destroy();
      genCalendarInstanceRef.current = null;
    }

    (async () => {
      try {
        const { Calendar } = await import('@fullcalendar/core');
        const tGrid = (await import('@fullcalendar/timegrid')).default;
        const iPlugin = (await import('@fullcalendar/interaction')).default;
        if (!mounted || !generalCalendarRef.current) return;
        const events = allLessons.map((l) => ({
          id: l.id,
          title: l.profiles?.full_name
            ? `${l.profiles.full_name} — ${l.title || 'Урок'}`
            : l.title || 'Урок',
          start: l.start_time,
          end: l.end_time,
          backgroundColor: '#7C3AED',
          borderColor: '#5E077E',
          textColor: '#ffffff',
          extendedProps: {
            studentId: l.student_id,
            studentName: l.profiles?.full_name || 'Невідомий учень',
          },
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cal = new (Calendar as any)(generalCalendarRef.current, {
          plugins: [tGrid, iPlugin],
          // Single-day view on mobile for readability
          initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',
          locale: 'uk',
          firstDay: 1,
          slotMinTime: '08:00:00',
          slotMaxTime: '22:00:00',
          allDaySlot: false,
          editable: false,
          selectable: false,
          height: 'auto',
          events,
          headerToolbar: isMobile
            ? { left: 'prev,next', center: 'title', right: 'timeGridDay,timeGridWeek' }
            : { left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eventClick: (info: any) => {
            const sid = info.event.extendedProps.studentId;
            if (sid) {
              const found = students.find((s) => s.id === sid);
              if (found) onStudentClick(found);
            }
          },
        });
        cal.render();
        genCalendarInstanceRef.current = cal;
      } catch (err) {
        console.error('Calendar error:', err);
      }
    })();
    return () => {
      mounted = false;
      if (genCalendarInstanceRef.current) {
        genCalendarInstanceRef.current.destroy();
        genCalendarInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLessons, isMobile]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 border-t-4 border-t-green-500 overflow-hidden hover:shadow-md transition-shadow lg:col-span-2">
          <div className="p-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full mb-3">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Наступний урок
            </span>
            {nextLesson ? (
              <>
                <h2 className="text-lg font-bold text-gray-900">
                  {nextLesson.profiles?.full_name || 'Учень'}
                </h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <span>🕐</span> {countdownText}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Тема: {nextLesson.title || 'Очікування уроку'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-600">Немає майбутніх уроків</h2>
                <p className="text-sm text-gray-500 mt-1">{countdownText}</p>
              </>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-xl">🎓</div>
              <div>
                <p className="text-xs font-medium text-gray-500">Активні учні</p>
                <h3 className="text-2xl font-bold text-gray-900">{activeStudentsCount}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-xl">📅</div>
              <div>
                <p className="text-xs font-medium text-gray-500">Занять цього тижня</p>
                <h3 className="text-2xl font-bold text-gray-900">{weeklyLessonsCount}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Calendar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">📅 Загальний розклад викладача</h2>
          <p className="text-sm text-gray-500 mt-1">Тут відображаються заняття усіх ваших учнів.</p>
        </div>
        {/* Overflow wrapper keeps the calendar scrollable on narrow screens */}
        <div className="w-full overflow-x-auto">
          <div
            ref={generalCalendarRef}
            id="general-calendar-element"
            className="min-h-[350px] min-w-0"
            style={isMobile ? undefined : { minWidth: '640px' }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        /* FullCalendar responsive toolbar overrides */
        @media (max-width: 767px) {
          .fc .fc-toolbar {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.25rem;
          }
          .fc .fc-button {
            font-size: 0.75rem !important;
            padding: 0.3rem 0.6rem !important;
          }
          .fc .fc-toolbar-title {
            font-size: 0.95rem !important;
            text-align: center;
          }
          .fc .fc-timegrid-slot-label {
            font-size: 0.7rem !important;
          }
          .fc .fc-event-title {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </div>
  );
}