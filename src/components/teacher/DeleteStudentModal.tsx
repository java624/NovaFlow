'use client';

import { useState, useCallback } from 'react';
import { StudentProfile } from './types';

interface DeleteStudentModalProps {
  student: StudentProfile;
  visible: boolean;
  onClose: () => void;
  onDeleted: (studentId: string) => void;
}

export default function DeleteStudentModal({
  student,
  visible,
  onClose,
  onDeleted,
}: DeleteStudentModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Вчитель повинен ввести слово "ВИДАЛИТИ" або повне ім'я учня
  const fullName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Учень';
  const requiredText = 'ВИДАЛИТИ';
  const isConfirmed = confirmText.trim().toUpperCase() === requiredText || confirmText.trim() === fullName;

  const handleDelete = useCallback(async () => {
    if (!isConfirmed || deleting) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch('/api/teacher/delete-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Помилка видалення учня');
      }

      onDeleted(student.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не вдалося видалити учня. Спробуйте ще раз.');
    } finally {
      setDeleting(false);
    }
  }, [isConfirmed, deleting, student.id, onDeleted, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !deleting) onClose(); }}
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          disabled={deleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none disabled:opacity-40"
        >
          ✕
        </button>

        {/* Warning icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl mb-4">
            🗑️
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">
            Ви дійсно бажаєте повністю видалити учня <span className="text-red-600">{fullName}</span>?
          </h2>
        </div>

        {/* Explanation */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800 leading-relaxed">
            ⚠️ <strong>Ця дія є незворотною.</strong> Усі дані учня, історія платежів та баланс уроків будуть назавжди видалені з бази даних.
          </p>
        </div>

        {/* Confirmation input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Для підтвердження введіть <span className="font-bold text-red-600">ВИДАЛИТИ</span> або повне ім'я учня:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
            placeholder={requiredText}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all disabled:opacity-50"
            autoFocus
          />
          {confirmText && !isConfirmed && (
            <p className="text-xs text-red-500 mt-1.5">
              Текст не збігається. Введіть <strong>{requiredText}</strong> або <strong>{fullName}</strong>.
            </p>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 mb-4">
            ❌ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Скасувати
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Видаляю...
              </>
            ) : (
              '🗑️ Остаточно видалити'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}