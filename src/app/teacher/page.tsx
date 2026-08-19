'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Tab, StudentProfile, Lesson, Comment } from '@/components/teacher/types';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherDashboardTab from '@/components/teacher/TeacherDashboardTab';
import TeacherStudentsTab from '@/components/teacher/TeacherStudentsTab';
import TeacherWorkspaceTab from '@/components/teacher/TeacherWorkspaceTab';
import TeacherPackLibraryTab from '@/components/teacher/TeacherPackLibraryTab';
import TeacherMaterialsTab from '@/components/teacher/TeacherMaterialsTab';
import TeacherCommentsTab from '@/components/teacher/TeacherCommentsTab';
import dynamic from 'next/dynamic';
import StudentProfileModal from '@/components/teacher/StudentProfileModal';
import StudentPaymentHistoryModal from '@/components/teacher/StudentPaymentHistoryModal';
import AssignVocabularyModal from '@/components/teacher/AssignVocabularyModal';

const LessonRoom = dynamic(() => import('@/components/dashboard/LessonRoom'), { ssr: false });

export default function TeacherDashboardPage() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [weeklyLessonsCount, setWeeklyLessonsCount] = useState(0);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [countdownText, setCountdownText] = useState('Немає запланованих занять');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [profileStudent, setProfileStudent] = useState<StudentProfile | null>(null);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [paymentHistoryStudent, setPaymentHistoryStudent] = useState<StudentProfile | null>(null);
  const [showAssignVocabModal, setShowAssignVocabModal] = useState(false);
  const [assignVocabStudent, setAssignVocabStudent] = useState<StudentProfile | null>(null);
  const [activeLessonChannel, setActiveLessonChannel] = useState<string | null>(null);
  const [pageToast, setPageToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

// =========================================================================
  // VERIFY TEACHER SESSION  
  // =========================================================================
  const verifySession = useCallback(async () => {
    try {
      // 1. Використовуємо getUser() — він валідує сесію напряму через Supabase сервер,
      //    на відміну від getSession(), який читає з локального cookie і може повернути null
      //    після client-side навігації через router.push() у Next.js App Router
      const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !currentUser) {
        console.log('[Teacher] Сесію не знайдено → редірект на /login', sessionError?.message);
        router.push('/login');
        return null;
      }

      // 2. Робимо запит до профілю користувача
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, lessons_left, avatar_url, learning_language, birth_date, created_at, role')
        .eq('id', currentUser.id)
        .maybeSingle(); // Використовуємо maybeSingle щоб уникнути жорстких помилок збоку бази

      if (profileError) {
        console.error('[Teacher] Помилка запиту профілю:', profileError.message);
        router.push('/login');
        return null;
      }

      if (!profileData) {
        console.error('[Teacher] Профіль не знайдено в таблиці profiles для ID:', currentUser.id);
        router.push('/login');
        return null;
      }

      // 3. Перевіряємо роль користувача
      if (profileData.role !== 'teacher') {
        console.error(`[Teacher] Доступ заборонено. Роль: "${profileData.role}", очікується: "teacher"`);
        // НЕ робимо signOut() — це може зруйнувати сесію при тимчасових помилках БД
        // Просто редіректимо на відповідну сторінку
        if (profileData.role === 'student') {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
        return null;
      }

      // Якщо все супер — записуємо в стейт
      setProfile(profileData as StudentProfile);
      return profileData;
    } catch (err) {
      console.error('[Teacher] Критична помилка верифікації сесії:', err);
      router.push('/login');
      return null;
    }
  }, [supabase, router]);

  // =========================================================================
  // DATA LOADING
  // =========================================================================
  const loadStudents = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('full_name', { ascending: true });
    if (error) {
      console.error('[Teacher] Помилка завантаження учнів:', error.message);
      return;
    }
    if (data) setStudents(data);
  }, [supabase]);

  const loadAllLessons = useCallback(async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*, profiles:student_id ( full_name )')
      .not('status', 'in', '("completed","cancelled")')
      .order('start_time', { ascending: true });
    if (data) setAllLessons(data as unknown as Lesson[]);
  }, [supabase]);

  const loadComments = useCallback(async () => {
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    if (data) setComments(data);
  }, [supabase]);

  const updateCountdown = useCallback((target: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const tt = new Date(target).getTime();
    const fn = () => {
      const d = tt - Date.now();
      if (d < 0) { clearInterval(countdownRef.current!); setCountdownText('Урок почався!'); return; }
      const days = Math.floor(d / 86400000);
      const hours = Math.floor((d % 86400000) / 3600000);
      const mins = Math.floor((d % 3600000) / 60000);
      setCountdownText(`${days > 0 ? `${days}д ` : ''}${hours}год ${mins}хв`);
    };
    fn();
    countdownRef.current = setInterval(fn, 1000);
  }, []);

  const loadDashboardStats = useCallback(async () => {
    try {
      const { count: sc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
      if (sc !== null) setActiveStudentsCount(sc);
      const { data: raw } = await supabase
        .from('lessons')
        .select('*, profiles:student_id ( full_name )')
        .not('status', 'in', '("completed","cancelled")');
      if (!raw) return;
      const now = new Date();
      const dow = now.getDay() || 7;
      const sw = new Date(now); sw.setDate(now.getDate() - dow + 1); sw.setHours(0, 0, 0, 0);
      const ew = new Date(sw); ew.setDate(sw.getDate() + 6); ew.setHours(23, 59, 59, 999);
      let wc = 0; let nl: Record<string, unknown> | null = null; let mtd = Infinity;
      (raw as Record<string, unknown>[]).forEach((item) => {
        const ls = new Date(item.start_time as string);
        if (ls >= sw && ls <= ew) wc++;
        const td = ls.getTime() - now.getTime();
        if (td > 0 && td < mtd) { mtd = td; nl = item; }
      });
      setWeeklyLessonsCount(wc);
      const nextObj = nl as unknown as Lesson | null;
      setNextLesson(nextObj);
      if (nextObj) updateCountdown(nextObj.start_time); else setCountdownText('Відпочивайте!');
    } catch (err) { console.error('Stats error:', err); }
  }, [supabase, updateCountdown]);

  // =========================================================================
  // INIT
  // =========================================================================
  useEffect(() => {
    (async () => {
      const prof = await verifySession();
      if (prof) {
        await loadStudents();
        await loadAllLessons();
        await loadDashboardStats();
      }
      setLoading(false);
    })();
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription to keep stats, calendar, and students lists synchronized
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('teacher-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => {
          loadAllLessons();
          loadDashboardStats();
          loadStudents();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadStudents();
          loadDashboardStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homeworks' },
        () => {
          loadStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, supabase, loadAllLessons, loadDashboardStats, loadStudents]);

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const handleLogout = useCallback(async () => {
    if (confirm('Вийти?')) {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/login');
    }
  }, [supabase, router]);

  const switchTab = useCallback((tab: Tab) => {
    if (tab === 'workspace' && !selectedStudent) { toast.warning('⚠️ Спершу оберіть учня!'); return; }
    if (tab === 'comments') loadComments();
    setActiveTab(tab);
    setSidebarOpen(false);
  }, [selectedStudent, loadComments]);

  const openStudentWorkspace = useCallback(async (student: StudentProfile) => {
    setSelectedStudent(student);
    setActiveTab('workspace');
  }, []);

  const handleEnterLesson = useCallback((channelName: string) => {
    setActiveLessonChannel(channelName);
  }, []);

  const handleLeaveLesson = useCallback(() => {
    setActiveLessonChannel(null);
  }, []);

  const openProfileModal = useCallback(() => {
    if (selectedStudent) {
      setProfileStudent(selectedStudent);
      setShowStudentModal(true);
    }
  }, [selectedStudent]);

  const handleStudentSaved = useCallback((updated: StudentProfile) => {
    setSelectedStudent(updated);
    loadStudents();
  }, [loadStudents]);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setPageToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setPageToast(null), 5000);
  }, []);

  const handleStudentDeleted = useCallback((studentId: string) => {
    // Оновлюємо список учнів
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setActiveStudentsCount((prev) => Math.max(0, prev - 1));

    // Якщо видалений учень був обраний — скидаємо вибір
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
      setProfileStudent(null);
      setShowStudentModal(false);
      setActiveTab('students');
    }

    // Показуємо тост-повідомлення
    showToast('Учня успішно видалено з системи', 'success');
  }, [selectedStudent, showToast]);

  const deleteComment = useCallback(async (id: string) => {
    if (!confirm('Видалити назавжди?')) return;
    await supabase.from('comments').delete().eq('id', id);
    loadComments();
  }, [supabase, loadComments]);

  const saveCommentReply = useCallback(async (id: string, reply: string) => {
    if (!reply.trim()) return;
    await supabase.from('comments').update({ teacher_reply: reply.trim() }).eq('id', id);
    loadComments();
  }, [supabase, loadComments]);

  const getAvatarUrl = (s: StudentProfile) =>
    s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name || s.first_name || 'Учень')}&background=5e077e&color=fff&size=80`;

  // If lesson room is active, render it fullscreen
  if (activeLessonChannel) {
    return (
      <LessonRoom
        channelName={activeLessonChannel}
        onLeave={handleLeaveLesson}
        userName={profile?.full_name || 'Викладач'}
        userRole="teacher"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Завантаження панелі викладача...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name ? `Вітаємо, ${profile.full_name} 👋` : 'Вітаємо 👋';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg text-gray-900">NovaFlow</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <TeacherSidebar
          activeTab={activeTab}
          onTabChange={switchTab}
          selectedStudentName={selectedStudent?.full_name}
          selectedStudentAvatar={selectedStudent ? getAvatarUrl(selectedStudent) : undefined}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:pl-64">
          <div className="pt-14 lg:pt-0">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">{displayName}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Керування розкладом, балансом учнів та домашніми завданнями.</p>
                </div>
                {selectedStudent && (
                  <button onClick={openProfileModal} className="flex-shrink-0 relative group" title="Профіль учня">
                    <img src={getAvatarUrl(selectedStudent)} alt={selectedStudent.full_name}
                      className="w-10 h-10 rounded-full ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all cursor-pointer object-cover" />
                  </button>
                )}
              </div>
            </header>

            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <TeacherDashboardTab
                  activeStudentsCount={activeStudentsCount}
                  weeklyLessonsCount={weeklyLessonsCount}
                  nextLesson={nextLesson}
                  countdownText={countdownText}
                  allLessons={allLessons}
                  students={students}
                  onStudentClick={openStudentWorkspace}
                  onEnterLesson={handleEnterLesson}
                />
              )}

              {activeTab === 'students' && (
                <TeacherStudentsTab
                  students={students}
                  onStudentClick={openStudentWorkspace}
                  onViewPaymentHistory={(st) => {
                    setPaymentHistoryStudent(st);
                    setShowPaymentHistoryModal(true);
                  }}
                  onStudentDeleted={handleStudentDeleted}
                />
              )}

              {activeTab === 'workspace' && selectedStudent && (
                <TeacherWorkspaceTab
                  selectedStudent={selectedStudent}
                  teacherId={profile?.id}
                  onStudentsChange={loadStudents}
                  onEnterLesson={handleEnterLesson}
                />
              )}

              {activeTab === 'materials' && (
                <TeacherMaterialsTab
                  teacherId={profile?.id}
                  students={students}
                  selectedStudent={selectedStudent}
                />
              )}

              {activeTab === 'pack-library' && profile && (
                <TeacherPackLibraryTab
                  teacherId={profile.id}
                  students={students}
                />
              )}

              {activeTab === 'comments' && (
                <TeacherCommentsTab
                  comments={comments}
                  onDelete={deleteComment}
                  onSaveReply={saveCommentReply}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Student Profile Modal */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          visible={showStudentModal}
          onClose={() => { setShowStudentModal(false); setProfileStudent(null); }}
          onSaved={handleStudentSaved}
          onViewPaymentHistory={(st) => {
            setPaymentHistoryStudent(st);
            setShowPaymentHistoryModal(true);
          }}
          onStudentDeleted={handleStudentDeleted}
          onAssignVocabulary={(st) => {
            setAssignVocabStudent(st);
            setShowAssignVocabModal(true);
          }}
        />
      )}

      {/* Student Payment History Modal */}
      {paymentHistoryStudent && (
        <StudentPaymentHistoryModal
          student={paymentHistoryStudent}
          visible={showPaymentHistoryModal}
          onClose={() => {
            setShowPaymentHistoryModal(false);
            setPaymentHistoryStudent(null);
          }}
        />
      )}

      {/* Assign Vocabulary Modal */}
      {assignVocabStudent && (
        <AssignVocabularyModal
          student={assignVocabStudent}
          visible={showAssignVocabModal}
          teacherId={profile?.id}
          onClose={() => {
            setShowAssignVocabModal(false);
            setAssignVocabStudent(null);
          }}
          onAssigned={(pack) => {
            setPageToast({
              msg: `✅ Пакет слів "${pack.title}" надіслано учню!`,
              type: 'success'
            });
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => setPageToast(null), 3000);
          }}
        />
      )}

      {/* Toast Notification */}
      {pageToast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 flex items-center gap-3 w-[calc(100%-2rem)] max-w-md rounded-2xl shadow-2xl px-5 py-4 border animate-toast-in ${
            pageToast.type === 'success'
              ? 'bg-white border-green-200'
              : 'bg-white border-red-200'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <span
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${
              pageToast.type === 'success'
                ? 'bg-gradient-to-br from-green-600 to-green-400'
                : 'bg-gradient-to-br from-red-600 to-red-400'
            }`}
          >
            {pageToast.type === 'success' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </span>
          <p className="flex-1 text-sm font-medium text-gray-800 leading-relaxed">{pageToast.msg}</p>
          <button
            onClick={() => setPageToast(null)}
            className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700"
            aria-label="Закрити сповіщення"
          >
            ✕
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .animate-toast-in { animation: toast-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>
    </div>
  );
}
