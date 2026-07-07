'use client';

import { useEffect } from 'react';
import { Lesson, Tab } from '../types';

/**
 * Hook that renders a list of lessons into the calendar DOM element
 * when the lessons tab is active.
 */
export function useCalendarInit(activeTab: Tab, allLessons: Lesson[]) {
  useEffect(() => {
    if (activeTab !== 'lessons' || allLessons.length === 0) return;

    const timer = setTimeout(() => {
      const el = document.getElementById('student-calendar-element');
      if (!el) return;

      el.innerHTML = '';

      const listContainer = document.createElement('div');
      listContainer.className = 'space-y-3 mt-4';

      allLessons.forEach(lesson => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl';
        
        const startTime = new Date(lesson.start_time).toLocaleString('uk-UA', {
          month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        item.innerHTML = `
          <div>
            <p class="text-sm font-semibold text-gray-900">${(lesson as { title?: string }).title || 'Урок мови'}</p>
            <p class="text-xs text-gray-500 mt-0.5">📅 ${startTime}</p>
          </div>
          <span class="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Заплановано</span>
        `;
        listContainer.appendChild(item);
      });

      el.appendChild(listContainer);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab, allLessons]);
}
