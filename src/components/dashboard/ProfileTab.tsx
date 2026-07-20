'use client';

import { SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile } from './types';
import { getAvatarUrl } from './DashboardHeader';
import TelegramConnectCard from './TelegramConnectCard';

interface ProfileTabProps {
  profile: StudentProfile | null;
  profileForm: { first_name: string; last_name: string; birth_date: string };
  profileAlert: { msg: string; type: 'success' | 'error' } | null;
  onFormChange: (field: string, value: string) => void;
  onSave: (e: React.FormEvent) => void;
  onAvatarUpload: (file: File) => void;
  supabase: SupabaseClient;
  onProfileUpdate: (updated: Partial<StudentProfile>) => void;
}
export default function ProfileTab({
  profile, profileForm, profileAlert, onFormChange, onSave, onAvatarUpload,
  supabase, onProfileUpdate,
}: ProfileTabProps) {
  const avatarUrl = getAvatarUrl(profile);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Avatar & Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group cursor-pointer flex-shrink-0"
            onClick={() => document.getElementById('profile-avatar-file')?.click()}>
            <img src={avatarUrl} alt={profile?.full_name || 'Аватар'}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-purple-50 shadow-md" />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">📷</div>
            <input id="profile-avatar-file" type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onAvatarUpload(f); }} />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Павло'}</h2>
            <p className="text-sm text-gray-500">Студент платформи NovaFlow</p>

            {profile && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-gray-400 text-xs block">Викладач</span>
                  <span className="font-medium text-gray-800">{profile.teacher_name || 'Кирило'}</span>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-gray-400 text-xs block">Дата реєстрації</span>
                  <span className="font-medium text-gray-800">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('uk-UA') : '—'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-gray-400 text-xs block">Баланс уроків</span>
                  <span className="font-medium text-gray-800">{profile.lessons_left ?? 0}</span>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-gray-400 text-xs block">Мова навчання</span>
                  <span className="font-medium text-gray-800">
                    {profile.learning_language ? profile.learning_language.split(':')[0] : 'Не обрано'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">✏️ Редагувати профіль</h3>
        <form onSubmit={onSave} className="max-w-xl space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">👤 Ім&apos;я</label>
              <input type="text" value={profileForm.first_name}
                onChange={(e) => onFormChange('first_name', e.target.value)}
                placeholder="Введіть ваше ім'я" required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">🆔 Прізвище</label>
              <input type="text" value={profileForm.last_name}
                onChange={(e) => onFormChange('last_name', e.target.value)}
                placeholder="Введіть ваше прізвище"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">🎂 Дата народження</label>
            <input type="date" value={profileForm.birth_date}
              onChange={(e) => onFormChange('birth_date', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" />
          </div>

          {profileAlert && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
              profileAlert.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {profileAlert.msg}
            </div>
          )}

          <button type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all">
            💾 Зберегти зміни
          </button>
        </form>
      </div>

      {/* Telegram Connect */}
      <TelegramConnectCard
        profile={profile}
        supabase={supabase}
        onProfileUpdate={onProfileUpdate}
      />
    </div>
  );
}

