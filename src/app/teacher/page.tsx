'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Tab, StudentProfile, Lesson, Comment } from '@/components/teacher/types';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherDashboardTab from '@/components/teacher/TeacherDashboardTab';
import TeacherStudentsTab from '@/components/teacher/TeacherStudentsTab';
import TeacherWorkspaceTab from '@/components/teacher/TeacherWorkspaceTab';
import TeacherCommentsTab from '@/components/teacher/TeacherCommentsTab';
import StudentProfileModal from '@/components/teacher/StudentProfileModal';

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
    const { data } = await supabase.from('lessons').select('*, profiles:student_id ( full_name )').order('start_time', { ascending: true });
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
      const { data: raw } = await supabase.from('lessons').select('*, profiles:student_id ( full_name )');
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
    if (tab === 'workspace' && !selectedStudent) { alert('Спершу оберіть учня!'); return; }
    if (tab === 'comments') loadComments();
    setActiveTab(tab);
    setSidebarOpen(false);
  }, [selectedStudent, loadComments]);

  const openStudentWorkspace = useCallback(async (student: StudentProfile) => {
    setSelectedStudent(student);
    setActiveTab('workspace');
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
        <main className="flex-1 min-h-screen lg:pl-0">
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
                />
              )}

              {activeTab === 'students' && (
                <TeacherStudentsTab
                  students={students}
                  onStudentClick={openStudentWorkspace}
                />
              )}

              {activeTab === 'workspace' && selectedStudent && (
                <TeacherWorkspaceTab
                  selectedStudent={selectedStudent}
                  onStudentsChange={loadStudents}
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
        />
      )}
    </div>
  );
}