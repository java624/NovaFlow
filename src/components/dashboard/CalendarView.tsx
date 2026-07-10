'use client';

import { useEffect, useRef, useState } from 'react';
import { Lesson } from './types';

interface CalendarViewProps {
  lessons: Lesson[];
}

/** Returns true when the viewport is narrower than 768 px (md breakpoint). */
function useIsMobile() {
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

  return isMobile;
}

export default function CalendarView({ lessons }: CalendarViewProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calInstanceRef = useRef<{ destroy: () => void; render: () => void } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!calendarRef.current || lessons.length === 0) return;
    let mounted = true;

    // Destroy any existing instance before (re-)creating for new view
    if (calInstanceRef.current) {
      calInstanceRef.current.destroy();
      calInstanceRef.current = null;
    }

    (async () => {
      try {
        const { Calendar } = await import('@fullcalendar/core');
        const dayGrid = (await import('@fullcalendar/daygrid')).default;
        const timeGrid = (await import('@fullcalendar/timegrid')).default;
        const interaction = (await import('@fullcalendar/interaction')).default;

        if (!mounted || !calendarRef.current) return;

        const events = lessons.map((lesson) => ({
          id: lesson.id,
          title: 'Урок з Кирилом 👨‍🏫',
          start: lesson.start_time,
          end: lesson.end_time,
          backgroundColor: '#a855f7',
          borderColor: '#9333ea',
          textColor: '#ffffff',
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const CalendarClass = Calendar as any;
        const cal = new CalendarClass(calendarRef.current, {
          plugins: [dayGrid, timeGrid, interaction],
          // Switch to single-day view on mobile for readability
          initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',
          locale: 'uk',
          firstDay: 1,
          slotMinTime: '08:00:00',
          slotMaxTime: '22:00:00',
          allDaySlot: false,
          height: 'auto',
          expandRows: true,
          headerToolbar: isMobile
            ? {
                // Compact toolbar for mobile: two balanced rows
                left: 'prev,next',
                center: 'title',
                right: 'timeGridDay,timeGridWeek',
              }
            : {
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay',
              },
          editable: false,
          selectable: false,
          events,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eventClick: (info: any) => {
            alert(`📌 Заплановане заняття:\nТема: ${info.event.title}\nЧас початку: ${info.event.start.toLocaleString('uk-UA')}`);
          },
        });

        cal.render();
        calInstanceRef.current = cal;
      } catch (err) {
        console.error('Calendar init error:', err);
      }
    })();

    return () => {
      mounted = false;
      if (calInstanceRef.current) {
        calInstanceRef.current.destroy();
        calInstanceRef.current = null;
      }
    };
    // Re-initialize whenever mobile breakpoint or lessons change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, isMobile]);

  return (
    <>
      {/*
        Responsive wrapper:
        - On mobile, let FullCalendar fill the full width in single-day view.
        - On desktop, render the full week grid as-is.
      */}
      <div className="w-full overflow-x-auto">
        <div
          ref={calendarRef}
          className="min-h-[350px] min-w-0"
          style={isMobile ? undefined : { minWidth: '640px' }}
        />
      </div>

      {/* FullCalendar mobile toolbar overrides */}
      <style>{`
        @media (max-width: 767px) {
          /* Stack toolbar sections vertically */
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
          /* Shrink button text so nothing overflows */
          .fc .fc-button {
            font-size: 0.75rem !important;
            padding: 0.3rem 0.6rem !important;
          }
          /* Keep title readable but compact */
          .fc .fc-toolbar-title {
            font-size: 0.95rem !important;
            text-align: center;
          }
          /* Time-slot text */
          .fc .fc-timegrid-slot-label {
            font-size: 0.7rem !important;
          }
          .fc .fc-event-title {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </>
  );
}

