'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { StudentProfile, Homework, Lesson, PaymentHistory, Tab } from '../types';

export interface DashboardDataState {
  profile: StudentProfile | null;
  loading: boolean;
  homeworks: Homework[];
  activeHomework: Homework | null;
  nextLesson: Lesson | null;
  allLessons: Lesson[];
  currentHomeworkId: string | null;
  currentImageUrl: string | null;
  learningLang: string;
  selectedCourseName: string | null;
  paymentHistory: PaymentHistory[];
  paymentHistoryLoading: boolean;
  profileForm: { first_name: string; last_name: string; birth_date: string };
  profileAlert: { msg: string; type: 'success' | 'error' } | null;
}

export function useDashboardData() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // =========================================================================
  // STATE
  // =========================================================================
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [activeHomework, setActiveHomework] = useState<Homework | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [currentHomeworkId, setCurrentHomeworkId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [learningLang, setLearningLang] = useState('english');
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', birth_date: '' });
  const [profileAlert, setProfileAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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
  const handlePaymentReturn = useCallback(async (
    currentProfile: StudentProfile | null,
    setActiveTab: (tab: Tab) => void
  ) => {
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

      if (refreshedProfile && currentProfile) {
        setProfile({ ...currentProfile, lessons_left: refreshedProfile.lessons_left });
      }

      // Also refresh payment history
      await loadPaymentHistory(user.id);
    }

    // Show success toast
    showPaymentSuccessToast();
  }, [supabase, loadPaymentHistory]);

  function showPaymentSuccessToast() {
    const t = document.createElement('div');
    t.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-fadeIn';
    t.innerText = '✅ Оплата пройшла успішно! Уроки зараховано.';
    document.body.appendChild(t);
    setTimeout(() => { t.remove(); }, 4000);
  }

  // =========================================================================
  // LOAD PROFILE
  // =========================================================================
  const loadProfile = useCallback(async (setActiveTab?: (tab: Tab) => void) => {
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

        const newProfile = {
          ...typedProfile,
          first_name: profileData.first_name || fallbackFirst,
          last_name: profileData.last_name || fallbackLast,
          lessons_left: profileData.lessons_left !== undefined ? profileData.lessons_left : 0
        };

        setProfile(newProfile);

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
        if (setActiveTab) {
          await handlePaymentReturn(newProfile, setActiveTab);
        }
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router, loadHomeworks, loadAllLessons, loadNextLesson, loadPaymentHistory, handlePaymentReturn]);

  return {
    // State
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

    // Actions
    loadProfile,
    loadHomeworks,
    loadPaymentHistory,
  };
}
