'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentProfile, Homework, Lesson } from './types';
import TeacherReviewCanvas from '@/components/dashboard/TeacherReviewCanvas';

interface TeacherWorkspaceTabProps {
  selectedStudent: StudentProfile;
  onStudentsChange: () => void;
}

export default function TeacherWorkspaceTab({ selectedStudent, onStudentsChange }: TeacherWorkspaceTabProps) {
  const supabase = createClient();
  const [studentLessons, setStudentLessons] = useState<Lesson[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const studentCalendarRef = useRef<HTMLDivElement>(null);
  const stuCalendarInstanceRef = useRef<{ destroy: () => void } | null>(null);

  // Homework form
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [hwDeadline, setHwDeadline] = useState('');
  const [hwSubmitting, setHwSubmitting] = useState(false);

  // Review
  const [currentReviewHwId, setCurrentReviewHwId] = useState<string | null>(null);
  const [currentReviewImageUrl, setCurrentReviewImageUrl] = useState<string | null>(null);
  const [currentReviewTitle, setCurrentReviewTitle] = useState('');
  const [currentReviewComment, setCurrentReviewComment] = useState('');

  // Preview modal
  const [previewModal, setPreviewModal] = useState<{
    visible: boolean; title: string; desc: string; imgUrl: string;
  }>({ visible: false, title: '', desc: '', imgUrl: '' });

  const studentId = selectedStudent.id;

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

  // Load data
  const loadStudentLessons = useCallback(async () => {
    const { data } = await supabase.from('lessons').select('*').eq('student_id', studentId);
    if (data) setStudentLessons(data);
  }, [supabase, studentId]);

  const loadHomeworks = useCallback(async () => {
    const { data } = await supabase.from('homeworks').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
    if (data) setHomeworks(data);
  }, [supabase, studentId]);

  const [isCalendarFullscreen, setIsCalendarFullscreen] = useState(false);
  const lastDateRef = useRef<string | null>(null);
  const lastViewRef = useRef<string | null>(null);

  // Realtime subscription for this student's workspace data
  useEffect(() => {
    loadStudentLessons();
    loadHomeworks();

    const channel = supabase
      .channel(`teacher-workspace-${studentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons', filter: `student_id=eq.${studentId}` },
        () => {
          loadStudentLessons();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homeworks', filter: `student_id=eq.${studentId}` },
        () => {
          loadHomeworks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, loadStudentLessons, loadHomeworks, supabase]);

  // Student Calendar — re-initializes on lessons, mobile-breakpoint, or fullscreen change
  useEffect(() => {
    if (!studentCalendarRef.current) return;
    let mounted = true;

    // Destroy previous instance before recreating for new view
    if (stuCalendarInstanceRef.current) {
      stuCalendarInstanceRef.current.destroy();
      stuCalendarInstanceRef.current = null;
    }

    (async () => {
      try {
        const { Calendar } = await import('@fullcalendar/core');
        const tGrid = (await import('@fullcalendar/timegrid')).default;
        const iPlugin = (await import('@fullcalendar/interaction')).default;
        if (!mounted || !studentCalendarRef.current) return;
        const events = studentLessons.map((l) => ({
          id: l.id, title: l.title || `Урок: ${selectedStudent.full_name}`,
          start: l.start_time, end: l.end_time,
          backgroundColor: '#a855f7', borderColor: '#9333ea', textColor: '#ffffff',
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cal = new (Calendar as any)(studentCalendarRef.current, {
          plugins: [tGrid, iPlugin],
          // Single-day view on mobile for readability
          initialView: lastViewRef.current || (isMobile ? 'timeGridDay' : 'timeGridWeek'),
          initialDate: lastDateRef.current ? new Date(lastDateRef.current) : undefined,
          locale: 'uk',
          firstDay: 1, slotMinTime: '08:00:00', slotMaxTime: '22:00:00', allDaySlot: false,
          editable: false, selectable: true, height: isCalendarFullscreen ? 'parent' : 'auto', events,
          headerToolbar: isMobile
            ? { left: 'prev,next', center: 'title', right: 'timeGridDay,timeGridWeek' }
            : { left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' },
          datesSet: (dateInfo: any) => {
            lastDateRef.current = dateInfo.view.calendar.getDate().toISOString();
            lastViewRef.current = dateInfo.view.type;
          },
          select: async (info: { startStr: string; endStr: string }) => {
            if (confirm(`Запланувати урок для ${selectedStudent.full_name}?`)) {
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              const teacherId = currentUser?.id || null;

              const { data: nl } = await supabase.from('lessons').insert([{
                title: `Урок: ${selectedStudent.full_name}`, start_time: info.startStr,
                end_time: info.endStr, student_id: studentId,
                teacher_id: teacherId,
              }]).select().single();
              if (nl) {
                setStudentLessons((prev) => [...prev, nl]);
                alert('Урок додано!');
              } else alert('Помилка бази даних');
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eventClick: async (info: any) => {
            const action = prompt('1 - Проведено (списати)\n2 - Видалити');
            if (action === '1') {
              const { data: p } = await supabase.from('profiles').select('lessons_left').eq('id', studentId).single();
              const nb = Math.max(0, (p?.lessons_left || 0) - 1);
              const { error: ue } = await supabase.from('profiles').update({ lessons_left: nb }).eq('id', studentId);
              if (!ue) {
                await supabase.from('lessons').delete().eq('id', info.event.id);
                info.event.remove();
                setStudentLessons((prev) => prev.filter((l) => l.id !== info.event.id));
                alert(`Урок проведено! Баланс: ${nb}`);
                onStudentsChange();
              } else alert('Помилка: ' + ue.message);
            } else if (action === '2' && confirm('Видалити без списання?')) {
              await supabase.from('lessons').delete().eq('id', info.event.id);
              info.event.remove();
              setStudentLessons((prev) => prev.filter((l) => l.id !== info.event.id));
              alert('Скасовано.');
            }
          },
        });
        cal.render();
        stuCalendarInstanceRef.current = cal;
      } catch (err) { console.error('Calendar error:', err); }
    })();
    return () => { mounted = false; if (stuCalendarInstanceRef.current) { stuCalendarInstanceRef.current.destroy(); stuCalendarInstanceRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentLessons, isMobile, isCalendarFullscreen]);

  const handleHomeworkSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwDesc || !hwDeadline) { alert('Заповніть всі поля!'); return; }
    setHwSubmitting(true);
    let uplUrl: string | null = null;
    if (hwFile) {
      try {
        const fp = `hw_${studentId}_${Date.now()}.${hwFile.name.split('.').pop()}`;
        const { error: ue } = await supabase.storage.from('homework-attachments').upload(fp, hwFile);
        if (ue) throw ue;
        uplUrl = supabase.storage.from('homework-attachments').getPublicUrl(fp).data.publicUrl;
      } catch {
        if (!confirm(`Не вдалося завантажити файл. Відправити без файлу?`)) { setHwSubmitting(false); return; }
      }
    }
    const { error: dbError } = await supabase.from('homeworks').insert([{
      student_id: studentId, title: hwTitle, description: hwDesc,
      deadline: hwDeadline, attachment_url: uplUrl, status: 'pending',
    }]);
    if (!dbError) {
      alert('✅ ДЗ опубліковано!');
      setHwTitle(''); setHwDesc(''); setHwFile(null); setHwDeadline('');
      loadHomeworks();
    }
    setHwSubmitting(false);
  }, [studentId, hwTitle, hwDesc, hwFile, hwDeadline, supabase, loadHomeworks]);

  const deleteHomework = useCallback(async (hwId: string, attUrl: string | null | undefined) => {
    if (!confirm('Видалити назавжди?')) return;
    if (attUrl && attUrl !== 'null' && attUrl.includes('/homework-attachments/')) {
      const segs = attUrl.split('/homework-attachments/');
      if (segs.length > 1) await supabase.storage.from('homework-attachments').remove([segs[1]]);
    }
    const { error } = await supabase.from('homeworks').delete().eq('id', hwId);
    if (!error) { alert('✅ Видалено!'); loadHomeworks(); }
  }, [supabase, loadHomeworks]);

  const openTeacherReview = useCallback((hw: Homework) => {
    const img = hw.student_response_url && hw.student_response_url !== 'null'
      ? hw.student_response_url
      : hw.attachment_url || '';
    setCurrentReviewHwId(hw.id); setCurrentReviewImageUrl(img);
    setCurrentReviewTitle(hw.title); setCurrentReviewComment(hw.teacher_comment || '');
  }, []);

  const closeTeacherReview = useCallback(() => {
    setCurrentReviewHwId(null); setCurrentReviewImageUrl(null);
    setCurrentReviewTitle(''); setCurrentReviewComment('');
  }, []);

  const onReviewSaved = useCallback(() => {
    loadHomeworks();
    closeTeacherReview();
  }, [loadHomeworks, closeTeacherReview]);

  const formatDate = (d: string) => new Date(d).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Status Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              🎯 {selectedStudent.full_name}
              {selectedStudent.learning_language && (
                <span className="text-xs font-medium text-gray-500">— {selectedStudent.learning_language.split(':').pop()}</span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Поточний сеанс керування</p>
          </div>
          <div className="bg-purple-50 rounded-xl px-4 py-2 text-center">
            <span className="text-xs text-gray-500 block">Баланс</span>
            <span className="text-xl font-bold text-purple-700">{selectedStudent.lessons_left || 0}</span>
          </div>
        </div>
      </div>

      {/* Calendar + HW Form */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={isCalendarFullscreen ? "fixed inset-0 z-50 bg-white p-6 flex flex-col" : "bg-white rounded-2xl p-6 shadow-sm border border-gray-100"}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">📅 Розклад {isCalendarFullscreen && `— ${selectedStudent.full_name}`}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCalendarFullscreen(!isCalendarFullscreen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                {isCalendarFullscreen ? '🔽 Згорнути' : '⛶ Повний екран'}
              </button>
              <button onClick={() => alert("Виділіть час у сітці календаря!")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl">
                ➕ Додати урок
              </button>
            </div>
          </div>
          {/* Overflow wrapper keeps the calendar scrollable on narrow screens */}
          <div className={`w-full ${isCalendarFullscreen ? "flex-1 overflow-y-auto" : "overflow-x-auto"}`}>
            <div
              ref={studentCalendarRef}
              id="student-calendar-element"
              className={isCalendarFullscreen ? "h-full min-w-0" : "min-h-[350px] min-w-0"}
              style={isMobile || isCalendarFullscreen ? undefined : { minWidth: '640px' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">📝 Видати ДЗ</h2>
          <form onSubmit={handleHomeworkSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тема:</label>
              <input type="text" value={hwTitle} onChange={(e) => setHwTitle(e.target.value)}
                placeholder="Past Simple vs Present Perfect" required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Опис:</label>
              <textarea value={hwDesc} onChange={(e) => setHwDesc(e.target.value)} rows={4} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Файл:</label>
              <input type="file" accept="image/*" onChange={(e) => setHwFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дедлайн:</label>
              <input type="datetime-local" value={hwDeadline} onChange={(e) => setHwDeadline(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            </div>
            <button type="submit" disabled={hwSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50">
              {hwSubmitting ? '⏳ Надсилаю...' : '📤 Надіслати'}
            </button>
          </form>
        </div>
      </div>

      {/* Homework Journal */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Журнал завдань</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Тема</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Дедлайн</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Статус</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-600">Дія</th>
              </tr>
            </thead>
            <tbody>
              {homeworks.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Немає завдань.</td></tr>
              ) : (
                homeworks.map((hw) => {
                  const sc = ({ pending: 'bg-amber-50 text-amber-700', completed: 'bg-green-50 text-green-700', done: 'bg-green-50 text-green-700', reviewed: 'bg-blue-50 text-blue-700' })[hw.status] || 'bg-gray-50 text-gray-600';
                  const sl = ({ pending: '⏳ Очікує', completed: '✅ Виконано', done: '✅ Виконано', reviewed: '🔍 Перевірено' })[hw.status] || hw.status;
                  const hasFile = hw.attachment_url && hw.attachment_url !== 'null';
                  const hasResp = hw.student_response_url && hw.student_response_url !== 'null' && hw.student_response_url !== 'undefined';
                  const canReview = hw.status === 'completed' || hw.status === 'done';
                  return (
                    <tr key={hw.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-gray-900">{hw.title}</td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{formatDate(hw.deadline)}</td>
                      <td className="py-3 px-3"><span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${sc}`}>{sl}</span></td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-2">
                          {(canReview || hw.status === 'reviewed') && (
                            <button onClick={() => openTeacherReview(hw)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg ${hw.status === 'reviewed' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-500 text-white'}`}>
                              {hw.status === 'reviewed' ? '👁️ Редагувати' : '📝 Перевірити'}
                            </button>
                          )}
                          {(hasFile || hasResp) && (
                            <button onClick={() => setPreviewModal({
                              visible: true, title: hw.title, desc: hw.description || '',
                              imgUrl: hasResp ? hw.student_response_url! : hw.attachment_url!,
                            })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg">
                              📂 Файл
                            </button>
                          )}
                          <button onClick={() => deleteHomework(hw.id, hw.attachment_url)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Review Canvas */}
      {currentReviewHwId && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🎯 Перевірка роботи</h3>
            <button onClick={closeTeacherReview} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
          </div>
          <TeacherReviewCanvas imageUrl={currentReviewImageUrl || ''} homeworkId={currentReviewHwId}
            currentTitle={currentReviewTitle} currentComment={currentReviewComment} onSave={onReviewSaved} />
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.visible && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModal({ ...previewModal, visible: false })}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewModal({ ...previewModal, visible: false })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
            <h3 className="text-lg font-bold text-gray-900 mb-2 pr-8">{previewModal.title}</h3>
            {previewModal.desc && <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">{previewModal.desc}</p>}
            {previewModal.imgUrl && (
              <div className="bg-gray-100 rounded-xl p-2 flex items-center justify-center overflow-hidden max-h-[500px]">
                <img src={previewModal.imgUrl} alt="" className="max-w-full max-h-[480px] object-contain rounded-lg" />
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
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