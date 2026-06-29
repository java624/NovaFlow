'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Tab, StudentProfile, Homework, Lesson, PaymentHistory } from '@/components/dashboard/types';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabHome from '@/components/dashboard/DashboardTabHome';
import HomeworkTab from '@/components/dashboard/HomeworkTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // =========================================================================
  // STATE
  // =========================================================================
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [activeHomework, setActiveHomework] = useState<Homework | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [currentHomeworkId, setCurrentHomeworkId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [learningLang, setLearningLang] = useState('english');
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckoutOverlay, setShowCheckoutOverlay] = useState(false);
  const [reviewedHomework, setReviewedHomework] = useState<Homework | null>(null);
  const [lessonCount, setLessonCount] = useState(10);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', birth_date: '' });
  const [profileAlert, setProfileAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);

  // =========================================================================
  // LOAD PROFILE
  // =========================================================================
  const loadProfile = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { router.push('/login'); return; }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, lessons_left, avatar_url, learning_language, birth_date, created_at, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        const typedProfile = profileData as StudentProfile;
        if (typedProfile.role === 'teacher') { router.push('/teacher'); return; }

        const nameParts = profileData.full_name ? profileData.full_name.split(' ') : [];
        const fallbackFirst = nameParts[0] || 'Павло';
        const fallbackLast = nameParts.slice(1).join(' ') || '';

        setProfile({
          ...typedProfile,
          first_name: profileData.first_name || fallbackFirst,
          last_name: profileData.last_name || fallbackLast,
          lessons_left: profileData.lessons_left !== undefined ? profileData.lessons_left : 0
        });

        setProfileForm({
          first_name: profileData.first_name || fallbackFirst,
          last_name: profileData.last_name || fallbackLast,
          birth_date: profileData.birth_date ? profileData.birth_date.split('T')[0] : '',
        });

        const rawLang = profileData.learning_language || 'english';
        const parts = rawLang.split(':');
        setLearningLang(parts[0]);
        setSelectedCourseName(parts.length > 1 ? parts[1] : null);

        await loadHomeworks(user.id);
        await loadAllLessons(user.id);
        await loadNextLesson(user.id);
        await loadPaymentHistory(user.id);

        // Handle payment return after all data is loaded
        handlePaymentReturn();
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router]);

  // =========================================================================
  // LOAD HOMEWORKS
  // =========================================================================
  const loadHomeworks = useCallback(async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('homeworks')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomeworks(data || []);

      if (data && data.length > 0) {
        const latest = data[0];
        setCurrentHomeworkId(latest.id);
        setActiveHomework(latest);

        const urlToLoad = latest.student_response_url && latest.student_response_url !== 'null'
          ? latest.student_response_url
          : latest.attachment_url && latest.attachment_url !== 'null'
          ? latest.attachment_url
          : null;

        setCurrentImageUrl(urlToLoad);
      }
    } catch (err) {
      console.error('Load homeworks error:', err);
    }
  }, [supabase]);

  // =========================================================================
  // LOAD LESSONS
  // =========================================================================
  const loadAllLessons = useCallback(async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId)
        .order('start_time', { ascending: true });
      if (error) throw error;
      setAllLessons(data || []);
    } catch (err) {
      console.error('Load lessons error:', err);
    }
  }, [supabase]);

  const loadNextLesson = useCallback(async (studentId: string) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId)
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(1);
      if (error) throw error;
      setNextLesson(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error('Load lesson error:', err);
    }
  }, [supabase]);

  // =========================================================================
  // LOAD PAYMENT HISTORY
  // =========================================================================
  const loadPaymentHistory = useCallback(async (userId: string) => {
    setPaymentHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (err) {
      console.error('Load payment history error:', err);
      // Non-fatal: payments table may not exist yet (migration not run)
      setPaymentHistory([]);
    } finally {
      setPaymentHistoryLoading(false);
    }
  }, [supabase]);

  // =========================================================================
  // HANDLE PAYMENT RETURN (after Stripe redirect)
  // =========================================================================
  const handlePaymentReturn = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;

    // Clean URL immediately
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('payment');
    cleanUrl.searchParams.delete('session_id');
    cleanUrl.searchParams.delete('mock');
    window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);

    setActiveTab('payments');

    // Refresh profile to get updated lessons_left
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: refreshedProfile } = await supabase
        .from('profiles')
        .select('lessons_left')
        .eq('id', user.id)
        .single();

      if (refreshedProfile && profile) {
        setProfile({ ...profile, lessons_left: refreshedProfile.lessons_left });
      }

      // Also refresh payment history
      await loadPaymentHistory(user.id);
    }

    // Show success toast
    showPaymentSuccessToast();
  }, [supabase, profile, loadPaymentHistory]);

  function showPaymentSuccessToast() {
    const t = document.createElement('div');
    t.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn';
    t.innerText = '✅ Оплата пройшла успішно! Уроки зараховано.';
    document.body.appendChild(t);
    setTimeout(() => { t.remove(); }, 4000);
  }

  // =========================================================================
  // INIT
  // =========================================================================
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // =========================================================================
  // ІНІЦІАЛІЗАЦІЯ КАЛЕНДАРЯ
  // =========================================================================
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
            <p class="text-sm font-semibold text-gray-900">${lesson.title || 'Урок мови'}</p>
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
  
  // =========================================================================
  // HANDLERS
  // =========================================================================
  const handleLogout = useCallback(async () => {
    if (confirm('Ти дійсно хочеш вийти з особистого кабінету?')) {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/login');
    }
  }, [supabase, router]);

  const switchTab = useCallback((tab: Tab) => {
    const hasLessons = (profile?.lessons_left || 0) > 0;
    const lockedTabs: Tab[] = ['lessons', 'homework', 'materials'];

    if (!hasLessons && lockedTabs.includes(tab)) {
      alert('Оплати курс, щоб розблокувати цей розділ!');
      setActiveTab('payments');
    } else {
      setActiveTab(tab);
    }
    setSidebarOpen(false);
  }, [profile?.lessons_left]);

  // =========================================================================
  // PROFILE SAVE
  // =========================================================================
  const saveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          birth_date: profileForm.birth_date || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
      setProfileAlert({ msg: '✅ Дані успішно збережено!', type: 'success' });
      setTimeout(() => setProfileAlert(null), 3000);
      await loadProfile();
    } catch (err: unknown) {
      setProfileAlert({ msg: `❌ Помилка: ${err instanceof Error ? err.message : ''}`, type: 'error' });
    }
  }, [profile, profileForm, supabase, loadProfile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!profile) return;
    if (file.size > 3145728) { alert('Максимум 3 МБ.'); return; }

    try {
      const fp = `${profile.id}_avatar.${file.name.split('.').pop()}`;
      const { error: ue } = await supabase.storage.from('avatars').upload(fp, file, { cacheControl: '3600', upsert: true });
      if (ue) throw ue;

      const url = `${supabase.storage.from('avatars').getPublicUrl(fp).data.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id);

      setProfile({ ...profile, avatar_url: url });
      setProfileAlert({ msg: '✅ Аватарку оновлено!', type: 'success' });
      setTimeout(() => setProfileAlert(null), 3000);
    } catch (err: unknown) {
      setProfileAlert({ msg: `❌ Помилка: ${err instanceof Error ? err.message : ''}`, type: 'error' });
    }
  }, [profile, supabase]);

  const handleBuyCourse = useCallback(async (planName: string, price: number, lessonsCount: number, lang: string) => {
    if (!profile) return;
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('checkout', {
        body: {
          planName, lang,
          price,
          lessonsCount,
          userId: profile.id,
          userEmail: '',
          origin: window.location.origin,
        },
      });
      if (error) throw new Error(error.message);
      const url = (data as { url?: string })?.url;
      if (url) {
        setShowCheckoutOverlay(true);
        window.location.href = url;
      } else {
        alert('Не вдалося створити платіж. Спробуйте ще раз.');
      }
    } catch (err: unknown) {
      alert(`Помилка: ${err instanceof Error ? err.message : ''}`);
    } finally {
      setPurchasing(false);
    }
  }, [profile, supabase]);

  const selectHomework = useCallback((hw: Homework) => {
    setActiveHomework(hw);
    setCurrentHomeworkId(hw.id);
    const urlToLoad = hw.student_response_url && hw.student_response_url !== 'null'
      ? hw.student_response_url
      : hw.attachment_url && hw.attachment_url !== 'null'
      ? hw.attachment_url
      : null;
    setCurrentImageUrl(urlToLoad);
    if (hw.status === 'reviewed') setReviewedHomework(hw);
    setActiveTab('homework');
  }, []);

  // =========================================================================
  // RENDER
  // =========================================================================
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasLessons = (profile?.lessons_left || 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20">
      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={switchTab}
          hasLessons={hasLessons}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:pl-0">
          <div className="pt-14 lg:pt-0">
            <DashboardHeader
              profile={profile}
              onMenuToggle={() => setSidebarOpen(true)}
            />

            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <DashboardTabHome
                  profile={profile}
                  hasLessons={hasLessons}
                  learningLang={learningLang}
                  activeHomework={activeHomework}
                  nextLesson={nextLesson}
                  allLessons={allLessons}
                  onSwitchTab={switchTab}
                />
              )}

              {activeTab === 'homework' && (
                <HomeworkTab
                  profile={profile}
                  homeworks={homeworks}
                  activeHomework={activeHomework}
                  reviewedHomework={reviewedHomework}
                  currentImageUrl={currentImageUrl}
                  currentHomeworkId={currentHomeworkId}
                  onLoadHomeworks={loadHomeworks}
                  onSelectHomework={selectHomework}
                  onCloseReview={() => setReviewedHomework(null)}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsTab
                  profile={profile}
                  learningLang={learningLang}
                  selectedCourseName={selectedCourseName}
                  showCoursePicker={showCoursePicker}
                  lessonCount={lessonCount}
                  purchasing={purchasing}
                  paymentHistory={paymentHistory}
                  paymentHistoryLoading={paymentHistoryLoading}
                  onSetSelectedCourseName={setSelectedCourseName}
                  onSetShowCoursePicker={setShowCoursePicker}
                  onSetLessonCount={setLessonCount}
                  onBuyCourse={handleBuyCourse}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  profile={profile}
                  profileForm={profileForm}
                  profileAlert={profileAlert}
                  onFormChange={(field, value) => setProfileForm(prev => ({ ...prev, [field]: value }))}
                  onSave={saveProfile}
                  onAvatarUpload={uploadAvatar}
                />
              )}

              {activeTab === 'lessons' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Розклад занять</h2>
                  <p className="text-sm text-gray-500 mb-6">Тут відображаються всі твої заплановані уроки.</p>
                  <div ref={calendarRef} id="student-calendar-element" className="min-h-[350px]" />
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-6xl mb-4">📂</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Матеріали скоро з'являться</h2>
                  <p className="text-sm text-gray-500 max-w-md">
                    Твій викладач незабаром додасть навчальні матеріали, презентації та корисні файли.
                    Слідкуй за оновленнями!
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Checkout Overlay */}
      {showCheckoutOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Перенаправлення на безпечну оплату…</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}