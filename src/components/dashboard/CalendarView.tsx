'use client';

import { useEffect, useRef } from 'react';
import { Lesson } from './types';

interface CalendarViewProps {
  lessons: Lesson[];
}

export default function CalendarView({ lessons }: CalendarViewProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calInstanceRef = useRef<{ destroy: () => void; render: () => void } | null>(null);

  useEffect(() => {
    if (!calendarRef.current || lessons.length === 0) return;
    let mounted = true;

    (async () => {
      try {
        const { Calendar } = await import('@fullcalendar/core');
        const dayGrid = (await import('@fullcalendar/daygrid')).default;
        const timeGrid = (await import('@fullcalendar/timegrid')).default;
        const interaction = (await import('@fullcalendar/interaction')).default;

        if (!mounted || !calendarRef.current || calInstanceRef.current) return;

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
          initialView: 'timeGridWeek',
          locale: 'uk',
          firstDay: 1,
          slotMinTime: '08:00:00',
          slotMaxTime: '22:00:00',
          allDaySlot: false,
          height: 'auto',
          expandRows: true,
          headerToolbar: {
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
  }, [lessons]);

  return <div ref={calendarRef} className="min-h-[350px]" />;
}
