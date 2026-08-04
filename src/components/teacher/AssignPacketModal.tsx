'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { StudentProfile } from './types';

interface AssignPacketModalProps {
  packetId: string;
  packetTitle: string;
  students: StudentProfile[];
  visible: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignPacketModal({
  packetId,
  packetTitle,
  students,
  visible,
  onClose,
  onAssigned,
}: AssignPacketModalProps) {
  const supabase = createClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAssign = useCallback(async () => {
    if (selectedIds.length === 0) {
      setError('Оберіть хоча б одного учня.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let successCount = 0;
    const failed: string[] = [];

    for (const studentId of selectedIds) {
      const { error: insertErr } = await supabase.from('packet_assignments').insert({
        packet_id: Number(packetId),
        student_id: studentId,
        due_date: dueDate || null,
      });
      if (insertErr) {
        if (insertErr.code === '23505') {
          successCount += 1;
        } else {
          failed.push(studentId);
        }
      } else {
        successCount += 1;
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      toast.success(`Пакет «${packetTitle}» призначено ${successCount} учням`);
      onAssigned();
      onClose();
      setSelectedIds([]);
      setDueDate('');
    }

    if (failed.length > 0) {
      const names = failed.map((id) => students.find((s) => s.id === id)?.full_name || id);
      setError(`Не вдалося призначити: ${names.join(', ')}`);
    }
  }, [selectedIds, dueDate, packetId, packetTitle, supabase, students, onAssigned, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Задати пакет учневі</h2>
        <p className="text-sm text-purple-700 font-medium mb-4">{packetTitle}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">📅 Дедлайн (необов&apos;язково)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </div>

        <p className="text-sm font-medium text-gray-700 mb-2">Оберіть учнів:</p>
        <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
          {students.length === 0 ? (
            <p className="text-sm text-gray-400">Немає учнів у списку.</p>
          ) : (
            students.map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedIds.includes(s.id)
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-900">{s.full_name}</span>
              </label>
            ))
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200 mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
          >
            Скасувати
          </button>
          <button
            onClick={handleAssign}
            disabled={isSubmitting || selectedIds.length === 0}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl"
          >
            {isSubmitting ? 'Призначаємо...' : '📤 Надіслати'}
          </button>
        </div>
      </div>
    </div>
  );
}
