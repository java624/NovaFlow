'use client';

import { useState, useEffect } from 'react';
import { Tab, Homework } from '@/components/dashboard/types';
import { useDashboardData } from '@/components/dashboard/hooks/useDashboardData';
import { useDashboardActions } from '@/components/dashboard/hooks/useDashboardActions';
import { useCalendarInit } from '@/components/dashboard/hooks/useCalendarInit';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabHome from '@/components/dashboard/DashboardTabHome';
import HomeworkTab from '@/components/dashboard/HomeworkTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import LessonsTab from '@/components/dashboard/LessonsTab';
import MaterialsTab from '@/components/dashboard/MaterialsTab';
import CheckoutOverlay from '@/components/dashboard/CheckoutOverlay';

export default function DashboardPage() {
  // =========================================================================
  // LOCAL UI STATE
  // =========================================================================
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckoutOverlay, setShowCheckoutOverlay] = useState(false);
  const [reviewedHomework, setReviewedHomework] = useState<Homework | null>(null);
  const [lessonCount, setLessonCount] = useState(10);
  const [showCoursePicker, setShowCoursePicker] = useState(false);

  // =========================================================================
  // DATA HOOK
  // =========================================================================
  const {
    supabase,
    profile,
    setProfile,
    loading,
    homeworks,
    activeHomework,
    setActiveHomework,
    nextLesson,
    allLessons,
    currentHomeworkId,
    setCurrentHomeworkId,
    currentImageUrl,
    setCurrentImageUrl,
    learningLang,
    selectedCourseName,
    setSelectedCourseName,
    paymentHistory,
    paymentHistoryLoading,
    profileForm,
    setProfileForm,
    profileAlert,
    setProfileAlert,
    loadProfile,
    loadHomeworks,
  } = useDashboardData();

  // =========================================================================
  // ACTIONS HOOK
  // =========================================================================
  const {
    handleLogout,
    switchTab,
    saveProfile,
    uploadAvatar,
    handleBuyCourse,
    selectHomework,
  } = useDashboardActions({
    supabase,
    profile,
    setProfile,
    profileForm,
    setProfileForm,
    setProfileAlert,
    setActiveHomework,
    setCurrentHomeworkId,
    setCurrentImageUrl,
    setReviewedHomework,
    setActiveTab,
    setSidebarOpen,
    setPurchasing,
    setShowCheckoutOverlay,
    loadProfile,
  });

  // =========================================================================
  // CALENDAR INIT
  // =========================================================================
  useCalendarInit(activeTab, allLessons);

  // =========================================================================
  // INIT
  // =========================================================================
  useEffect(() => {
    loadProfile(setActiveTab);
  }, [loadProfile, setActiveTab]);

  // Realtime subscription for student dashboard changes
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`student-dashboard-realtime-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homeworks', filter: `student_id=eq.${profile.id}` },
        () => {
          loadHomeworks(profile.id);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons', filter: `student_id=eq.${profile.id}` },
        () => {
          loadProfile();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
        () => {
          loadProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase, loadHomeworks, loadProfile]);

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
        <main className="flex-1 min-h-screen lg:pl-64">
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
                  supabase={supabase}
                  onProfileUpdate={(updated) => setProfile(prev => prev ? { ...prev, ...updated } : prev)}
                />
              )}

              {activeTab === 'lessons' && <LessonsTab />}

              {activeTab === 'materials' && <MaterialsTab />}
            </div>
          </div>
        </main>
      </div>

      {/* Checkout Overlay */}
      <CheckoutOverlay visible={showCheckoutOverlay} />

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