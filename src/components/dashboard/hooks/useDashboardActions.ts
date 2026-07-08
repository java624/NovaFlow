'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseClient } from '@supabase/supabase-js';
import { Tab, StudentProfile, Homework } from '../types';

interface UseDashboardActionsParams {
  supabase: SupabaseClient;
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile | null) => void;
  profileForm: { first_name: string; last_name: string; birth_date: string };
  setProfileForm: React.Dispatch<React.SetStateAction<{ first_name: string; last_name: string; birth_date: string }>>;
  setProfileAlert: (alert: { msg: string; type: 'success' | 'error' } | null) => void;
  setActiveHomework: (hw: Homework | null) => void;
  setCurrentHomeworkId: (id: string | null) => void;
  setCurrentImageUrl: (url: string | null) => void;
  setReviewedHomework: (hw: Homework | null) => void;
  setActiveTab: (tab: Tab) => void;
  setSidebarOpen: (open: boolean) => void;
  setPurchasing: (p: boolean) => void;
  setShowCheckoutOverlay: (show: boolean) => void;
  loadProfile: (setActiveTab?: (tab: Tab) => void) => Promise<void>;
}

export function useDashboardActions({
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
}: UseDashboardActionsParams) {
  const router = useRouter();

  // =========================================================================
  // LOGOUT
  // =========================================================================
  const handleLogout = useCallback(async () => {
    if (confirm('Ти дійсно хочеш вийти з особистого кабінету?')) {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/login');
    }
  }, [supabase, router]);

  // =========================================================================
  // SWITCH TAB
  // =========================================================================
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
  }, [profile?.lessons_left, setActiveTab, setSidebarOpen]);

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
  }, [profile, profileForm, supabase, loadProfile, setProfileAlert]);

  // =========================================================================
  // UPLOAD AVATAR
  // =========================================================================
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
  }, [profile, supabase, setProfile, setProfileAlert]);

  // =========================================================================
  // BUY COURSE
  // =========================================================================
  const handleBuyCourse = useCallback(async (planName: string, price: number, lessonsCount: number, lang: string) => {
    if (!profile) return;
    setPurchasing(true);
    try {
      // price is per-lesson; compute total
      const totalAmount = Number(price) * lessonsCount;

      const response = await fetch(
        'https://vagrglarsxjtnsusyonv.supabase.co/functions/v1/wfp-create',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            amount: totalAmount,
            lessonsCount,
            planName,
            lang,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

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
  }, [profile, setPurchasing, setShowCheckoutOverlay]);

  // =========================================================================
  // SELECT HOMEWORK
  // =========================================================================
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
  }, [setActiveHomework, setCurrentHomeworkId, setCurrentImageUrl, setReviewedHomework, setActiveTab]);

  return {
    handleLogout,
    switchTab,
    saveProfile,
    uploadAvatar,
    handleBuyCourse,
    selectHomework,
  };
}
