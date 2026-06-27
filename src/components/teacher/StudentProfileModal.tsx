'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentProfile } from './types';

interface StudentProfileModalProps {
  student: StudentProfile;
  visible: boolean;
  onClose: () => void;
  onSaved: (updated: StudentProfile) => void;
}

export default function StudentProfileModal({ student, visible, onClose, onSaved }: StudentProfileModalProps) {
  const supabase = createClient();
  const [form, setForm] = useState({
    first_name: student.first_name || '',
    last_name: student.last_name || '',
    birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
    lessons_left: student.lessons_left || 0,
    learning_language: student.learning_language || '',
  });
  const [profileAlert, setProfileAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const getAvatarUrl = (s: StudentProfile) =>
    s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name || s.first_name || 'Учень')}&background=5e077e&color=fff&size=160`;

  const saveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim()) { setProfileAlert({ msg: "⚠️ Поле обов'язкове.", type: 'error' }); return; }
    try {
      const fn = `${form.first_name} ${form.last_name}`.trim();
      const { data: upd, error } = await supabase.from('profiles').update({
        first_name: form.first_name, last_name: form.last_name,
        birth_date: form.birth_date || null, lessons_left: form.lessons_left,
        learning_language: form.learning_language, full_name: fn,
        updated_at: new Date().toISOString(),
      }).eq('id', student.id).select().single();
      if (error) throw error;
      setProfileAlert({ msg: '✅ Дані збережено!', type: 'success' });
      if (upd) onSaved(upd as StudentProfile);
      setTimeout(() => onClose(), 1500);
    } catch (err: unknown) {
      setProfileAlert({ msg: `❌ ${err instanceof Error ? err.message : ''}`, type: 'error' });
    }
  }, [form, supabase, student.id, onSaved, onClose]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (file.size > 3145728) { alert('Максимум 3 МБ.'); return; }
    try {
      const fp = `${student.id}_avatar.${file.name.split('.').pop()}`;
      const { error: ue } = await supabase.storage.from('avatars').upload(fp, file, { cacheControl: '3600', upsert: true });
      if (ue) throw ue;
      const url = `${supabase.storage.from('avatars').getPublicUrl(fp).data.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', student.id);
      onSaved({ ...student, avatar_url: url });
      setProfileAlert({ msg: '✅ Аватарку оновлено!', type: 'success' });
    } catch (err: unknown) { setProfileAlert({ msg: `❌ ${err instanceof Error ? err.message : ''}`, type: 'error' }); }
  }, [student, supabase, onSaved]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer">
            <img src={getAvatarUrl(student)} alt={student.full_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-50" />
            <div onClick={() => document.getElementById('modal-avatar-file')?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white text-xl opacity-0 group-hover:opacity-100 cursor-pointer">📷</div>
            <input id="modal-avatar-file" type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-3">{student.full_name}</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">👤 Ім&apos;я:</label>
              <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">🆔 Прізвище:</label>
              <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">🎂 Дата народження:</label>
            <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">🎓 Баланс:</label>
            <input type="number" min={0} value={form.lessons_left} onChange={(e) => setForm({ ...form, lessons_left: parseInt(e.target.value) || 0 })} required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">🌍 Мова:</label>
            <input type="text" value={form.learning_language} onChange={(e) => setForm({ ...form, learning_language: e.target.value })} placeholder="english:English B2"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all" /></div>
          {profileAlert && <div className={`px-4 py-3 rounded-xl text-sm font-medium ${profileAlert.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{profileAlert.msg}</div>}
          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-md hover:shadow-lg">💾 Зберегти</button>
        </form>
      </div>
    </div>
  );
}