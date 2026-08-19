'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { StudentProfile } from './types';
import { loadTeacherPackLibrary, deleteWordPacket, TeacherLibraryPack } from '@/lib/vocabularySupabase';
import AssignVocabularyModal from './AssignVocabularyModal';
import AssignPacketModal from './AssignPacketModal';

interface TeacherPackLibraryTabProps {
  teacherId: string;
  students: StudentProfile[];
}

export default function TeacherPackLibraryTab({ teacherId, students }: TeacherPackLibraryTabProps) {
  const supabase = useMemo(() => createClient(), []);
  const [packs, setPacks] = useState<TeacherLibraryPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignPacket, setAssignPacket] = useState<TeacherLibraryPack | null>(null);

  const loadPacks = useCallback(async () => {
    setLoading(true);
    const data = await loadTeacherPackLibrary(supabase, teacherId);
    setPacks(data);
    setLoading(false);
  }, [supabase, teacherId]);

  const handleDeletePack = useCallback(async (pack: TeacherLibraryPack) => {
    const msg = `Ви дійсно хочете видалити пакет «${pack.title}» остаточно?\n\nЦе також видалить усі слова пакета та призначення цього пакета всім учням.`;
    if (!confirm(msg)) return;
    const { error } = await deleteWordPacket(supabase, pack.id);
    if (error) {
      console.error('Failed to delete word packet permanently:', error);
      toast.error('Не вдалося видалити пакет.');
      return;
    }
    toast.success('✅ Пакет видалено остаточно');
    setPacks((prev) => prev.filter((p) => p.id !== pack.id));
  }, [supabase]);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📚 Словник</h2>
          <p className="text-sm text-gray-500 mt-1">
            Усі створені вами пакети. Призначайте їх учням одним кліком.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-sm hover:from-purple-700 hover:to-purple-600 transition-all"
        >
          ✨ Створити новий пакет
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <span className="inline-block w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm">Завантаження...</p>
        </div>
      ) : packs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-bold text-gray-900">Бібліотека порожня</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Створіть перший пакет слів — ШІ згенерує переклади та приклади для кожного слова.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold"
          >
            Створити пакет
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{pack.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {pack.targetLanguage} • {pack.level} • {pack.wordCount} слів
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Призначено {pack.assignedCount} учням •{' '}
                    {new Date(pack.createdAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <span className="text-2xl flex-shrink-0">📦</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setAssignPacket(pack)}
                  className="flex-1 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl transition-colors"
                >
                  👤 Задати учневі
                </button>
                <button
                  onClick={() => handleDeletePack(pack)}
                  title="Видалити остаточно"
                  aria-label={`Видалити пакет «${pack.title}» остаточно`}
                  className="px-3 py-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && students.length > 0 && (
        <AssignVocabularyModal
          students={students}
          visible={showCreateModal}
          teacherId={teacherId}
          onClose={() => setShowCreateModal(false)}
          onAssigned={() => {
            setShowCreateModal(false);
            loadPacks();
          }}
        />
      )}

      {showCreateModal && students.length === 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <p className="text-gray-700 mb-4">Спочатку додайте учнів, щоб створити пакет.</p>
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold">
              Закрити
            </button>
          </div>
        </div>
      )}

      {assignPacket && (
        <AssignPacketModal
          packetId={assignPacket.id}
          packetTitle={assignPacket.title}
          students={students}
          visible={Boolean(assignPacket)}
          onClose={() => setAssignPacket(null)}
          onAssigned={loadPacks}
        />
      )}
    </div>
  );
}
