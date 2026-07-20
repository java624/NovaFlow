'use client';

import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile } from './types';

// ─── Inline Telegram SVG Icon ───────────────────────────────────────────────
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

// ─── Check Icon ─────────────────────────────────────────────────────────────
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ─── Unlink Icon ─────────────────────────────────────────────────────────────
function UnlinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface TelegramConnectCardProps {
  profile: StudentProfile | null;
  supabase: SupabaseClient;
  onProfileUpdate: (updated: Partial<StudentProfile>) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TelegramConnectCard({
  profile,
  supabase,
  onProfileUpdate,
}: TelegramConnectCardProps) {
  const [unlinking, setUnlinking] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const isConnected = Boolean(profile?.telegram_chat_id);
  const botLink = `https://t.me/novaflow_edu_bot?start=${profile?.id ?? ''}`;

  // ── Open Telegram deep link ───────────────────────────────────────────────
  const handleConnect = () => {
    if (!profile?.id) return;
    window.open(botLink, '_blank', 'noopener,noreferrer');
  };

  // ── Remove telegram_chat_id from DB (optimistic) ──────────────────────────
  const handleUnlink = async () => {
    if (!profile?.id || !confirm('Відв\'язати Telegram від акаунту?')) return;
    setUnlinking(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ telegram_chat_id: null })
        .eq('id', profile.id);

      if (error) throw error;

      onProfileUpdate({ telegram_chat_id: null });
      setAlert({ msg: '✅ Telegram відключено.', type: 'success' });
    } catch (err: unknown) {
      setAlert({
        msg: `❌ Помилка: ${err instanceof Error ? err.message : 'Спробуйте знову'}`,
        type: 'error',
      });
    } finally {
      setUnlinking(false);
      setTimeout(() => setAlert(null), 3500);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${
        isConnected
          ? 'bg-gradient-to-br from-[#e8f7ff] via-white to-[#daf3ff] border-[#229ED9]/20'
          : 'bg-white border-gray-100 hover:shadow-md hover:border-[#229ED9]/30'
      }`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
          isConnected
            ? 'bg-gradient-to-r from-[#229ED9] via-[#1a8bc7] to-[#0d7ab8]'
            : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'
        }`}
      />

      {/* Decorative blobs — only visible when connected */}
      {isConnected && (
        <>
          <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#229ED9]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#229ED9]/08 blur-2xl" />
        </>
      )}

      <div className="relative p-6 sm:p-8">
        {/* ── Header row ────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          {/* Icon bubble */}
          <div
            className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl shadow-sm transition-transform duration-300 ${
              isConnected
                ? 'bg-gradient-to-br from-[#229ED9] to-[#1a8bc7] text-white'
                : 'bg-gray-100 text-gray-400 group-hover:bg-[#229ED9]/10'
            }`}
          >
            <TelegramIcon className="w-6 h-6" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Сповіщення в Telegram
              </h3>
              {isConnected && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 border border-green-200">
                  <CheckCircleIcon className="w-3 h-3" />
                  Підключено
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {isConnected
                ? 'Сповіщення від NovaFlow активовані. Ви отримуватимете нагадування про уроки та домашні завдання.'
                : 'Отримуй нагадування про уроки, домашні завдання та статус оплати прямо в месенджер.'}
            </p>
          </div>
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div className="my-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* ── Action area ───────────────────────────────────────────── */}
        {isConnected ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Active state info pill */}
            <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-[#229ED9]/8 border border-[#229ED9]/20">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-[#1a8bc7]">
                @novaflow_edu_bot — активний
              </span>
            </div>

            {/* Unlink button */}
            <button
              id="telegram-unlink-btn"
              onClick={handleUnlink}
              disabled={unlinking}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UnlinkIcon className="w-4 h-4" />
              {unlinking ? 'Відключення...' : 'Відв\'язати'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Bot hint */}
            <p className="flex-1 text-xs text-gray-400 flex items-center gap-1.5">
              <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
              Бот: <span className="font-semibold text-gray-500">@novaflow_edu_bot</span>
            </p>

            {/* Connect CTA */}
            <button
              id="telegram-connect-btn"
              onClick={handleConnect}
              className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.04] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #229ED9 0%, #1a8bc7 50%, #0d7ab8 100%)',
              }}
            >
              {/* Shimmer overlay */}
              <span
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)',
                }}
              />
              <TelegramIcon className="w-4.5 h-4.5 relative z-10 w-[18px] h-[18px]" />
              <span className="relative z-10">Підключити Telegram</span>
            </button>
          </div>
        )}

        {/* ── Reconnect hint when connected ─────────────────────────── */}
        {isConnected && (
          <p className="mt-3 text-xs text-gray-400">
            Потрібно перепідключити?{' '}
            <button
              onClick={handleConnect}
              className="text-[#229ED9] hover:underline font-medium transition-colors"
            >
              Відкрити бота знову →
            </button>
          </p>
        )}

        {/* ── Alert toast ───────────────────────────────────────────── */}
        {alert && (
          <div
            className={`mt-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              alert.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {alert.msg}
          </div>
        )}
      </div>
    </div>
  );
}
