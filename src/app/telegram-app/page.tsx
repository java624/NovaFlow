'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types matching the actual DB schema used across the project
// ---------------------------------------------------------------------------
interface TeacherInfo {
  full_name?: string;
  first_name?: string;
}

interface LessonRecord {
  id: string;
  title?: string;
  start_time: string;
  end_time?: string;
  status: string;
  teacher_id?: string;
  teacher?: TeacherInfo;
}

interface StudentProfile {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  lessons_left: number;
  avatar_url?: string;
  learning_language?: string;
  teacher_name?: string;
  telegram_chat_id?: string | null;
  role?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatLessonDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('uk-UA', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    }),
    time: d.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/10 ${className ?? 'h-4 w-full'}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TelegramMiniApp() {
  const supabase = createClient();

  // ----- state -----
  const [tgUser, setTgUser] = useState<{ id: number; first_name?: string } | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----- load data -----
  const loadData = useCallback(async (chatId: number) => {
    try {
      // 1. fetch profile by telegram_chat_id
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_chat_id', String(chatId))
        .maybeSingle();

      if (profErr) throw profErr;

      if (!prof) {
        setProfile(null);
        setLessons([]);
        return;
      }

      const typedProfile = prof as StudentProfile;
      setProfile(typedProfile);

      // 2. fetch upcoming lessons (scheduled & future)
      const now = new Date().toISOString();
      const { data: lessonRows, error: lesErr } = await supabase
        .from('lessons')
        .select(
          `id, title, start_time, end_time, status, teacher_id,
           teacher:profiles!lessons_teacher_id_fkey ( full_name, first_name )`
        )
        .eq('student_id', typedProfile.id)
        .neq('status', 'completed')
        .gte('start_time', now)
        .order('start_time', { ascending: true });

      if (lesErr) throw lesErr;
      setLessons((lessonRows ?? []) as unknown as LessonRecord[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Невідома помилка';
      console.error('[TelegramApp] loadData error:', err);
      setError(msg);
    }
  }, [supabase]);

  // ----- initial load -----
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        setTgUser({ id: user.id, first_name: user.first_name });
        setLoading(true);
        setError(null);
        loadData(user.id).finally(() => {
          setLoading(false);
        });
      } else {
        // Telegram context but no user data
        setLoading(false);
      }
    } else {
      // Not in Telegram – try demo mode with a hardcoded ID for local testing
      setLoading(false);
    }
  }, [loadData]);

  // ----- refresh handler -----
  const handleRefresh = useCallback(async () => {
    const chatId =
      tgUser?.id ??
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!chatId) return;

    setRefreshing(true);
    setError(null);
    await loadData(chatId);
    setRefreshing(false);
  }, [tgUser, loadData]);

  // ----- buy-lessons handler -----
  const handleBuyLessons = useCallback(() => {
    // Open the main site dashboard payments page in a new context,
    // or send the user to the bot for payment.
    // For Telegram Mini App the best UX is to open an external link.
    const url = 'https://novaflow-school.com/dashboard?tab=payments';
    if ((window as any).Telegram?.WebApp?.openLink) {
      (window as any).Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, []);

  // =========================================================================
  // RENDER
  // =========================================================================

  const showSkeleton = loading;

  // ----- Not in Telegram or no user data -----
  const noTelegramUser = !loading && !tgUser && (typeof window !== 'undefined' && !(window as any).Telegram?.WebApp?.initDataUnsafe?.user);

  return (
    <div className="min-h-screen text-white relative flex flex-col items-center p-6 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-500 overflow-hidden">

      {/* Watermark background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('/img/logo-pattern.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Scrollable content */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-5 mt-2 mb-6">

        {/* ---- Header ---- */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-md">
            NovaFlow 🚀
          </h1>
          <p className="mt-1 text-pink-100 text-sm">
            {tgUser?.first_name
              ? `Вітаємо, ${tgUser.first_name}!`
              : 'Особистий кабінет учня'}
          </p>
        </div>

        {/* ---- Error banner ---- */}
        {error && (
          <div className="p-4 bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-300/30 text-sm text-center">
            ❌ {error}
          </div>
        )}

        {/* ---- Not-in-Telegram placeholder ---- */}
        {noTelegramUser && (
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl text-center">
            <p className="text-lg">👋 Відкрийте цю сторінку в Telegram</p>
            <p className="text-sm text-gray-200 mt-2">
              Застосунок працює виключно всередині Telegram Mini App.
            </p>
          </div>
        )}

        {/* ---- Profile not found (not registered in bot) ---- */}
        {!loading && !error && tgUser && !profile && (
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl text-center">
            <p className="text-3xl mb-2">🤖</p>
            <h2 className="text-xl font-bold mb-2">Профіль не знайдено</h2>
            <p className="text-sm text-gray-200 leading-relaxed">
              Схоже, ви ще не зареєстровані в системі. 
              Будь ласка, перейдіть у нашого бота 
              <strong> @NovaFlowSchoolBot</strong> та натисніть 
              <em> /start</em>, щоб створити обліковий запис.
            </p>
          </div>
        )}

        {/* ---- LOADING SKELETON ---- */}
        {showSkeleton && (
          <>
            {/* Profile skeleton */}
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Lessons skeleton */}
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2"
                >
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---- PROFILE CARD ---- */}
        {profile && !showSkeleton && (
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              {/* Info */}
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">
                  {profile.full_name || `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Учень'}
                </h2>
                <p className="text-xs text-pink-100">
                  {profile.learning_language
                    ? `Вивчає: ${profile.learning_language}`
                    : 'Мовна школа NovaFlow'}
                </p>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-4 flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-200">📚 Баланс уроків</span>
              <span className="text-2xl font-extrabold tabular-nums">
                {profile.lessons_left ?? 0}
              </span>
            </div>
          </div>
        )}

        {/* ---- UPCOMING LESSONS ---- */}
        {profile && !showSkeleton && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-pink-100 mb-3">
              📅 Найближчі уроки
            </h3>

            {lessons.length === 0 ? (
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-sm text-gray-200">
                  Наразі немає запланованих занять.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const { date, time } = formatLessonDateTime(lesson.start_time);
                  const teacherName =
                    (lesson.teacher as TeacherInfo)?.full_name ||
                    (lesson.teacher as TeacherInfo)?.first_name ||
                    null;

                  return (
                    <div
                      key={lesson.id}
                      className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl card-lift transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">
                            {lesson.title || 'Заняття'}
                          </p>
                          <p className="text-xs text-gray-200 mt-1">
                            📍 {date} о {time}
                          </p>
                          {teacherName && (
                            <p className="text-xs text-gray-200 mt-0.5">
                              👨‍🏫 {teacherName}
                            </p>
                          )}
                        </div>
                        {/* Status badge */}
                        <span
                          className={`shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                            lesson.status === 'scheduled'
                              ? 'bg-green-500/20 text-green-200 border-green-300/30'
                              : lesson.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-200 border-red-300/30'
                              : 'bg-white/10 text-white/70 border-white/20'
                          }`}
                        >
                          {lesson.status === 'scheduled'
                            ? 'Заплановано'
                            : lesson.status === 'cancelled'
                            ? 'Скасовано'
                            : lesson.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---- ACTION BUTTONS ---- */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Buy lessons */}
          <button
            onClick={handleBuyLessons}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 backdrop-blur-lg border border-white/20 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg"
          >
            💳 Придбати уроки
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Оновлення…
              </span>
            ) : (
              '🔄 Оновити дані'
            )}
          </button>

          {/* Close button (only in Telegram) */}
          {typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.close && (
            <button
              onClick={() => (window as any).Telegram.WebApp.close()}
              className="w-full py-3 bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 text-white/70 font-medium rounded-xl transition-all text-sm active:scale-[0.98]"
            >
              Закрити
            </button>
          )}
        </div>
      </div>

      {/* Inline keyframes for spinner */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}