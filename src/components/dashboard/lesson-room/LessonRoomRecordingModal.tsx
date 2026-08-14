'use client';

import React from 'react';

interface LessonRoomRecordingModalProps {
  isOpen: boolean;
  recordingBlob: Blob | null;
  safeChannel: string;
  onClose: () => void;
}

export default function LessonRoomRecordingModal({
  isOpen,
  recordingBlob,
  safeChannel,
  onClose,
}: LessonRoomRecordingModalProps) {
  if (!isOpen || !recordingBlob) return null;

  const handleDownload = () => {
    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `NovaFlow_Lesson_${safeChannel}_${dateStr}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 z-[300] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✅</span>
          <h3 className="text-lg font-semibold text-white">Запис уроку збережено!</h3>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Ви можете завантажити файл на свій пристрій, а потім завантажити його на Google Drive школи
          та вставити посилання у матеріали уроку.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <span>⬇️</span>
            <span>Завантажити на пристрій</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all text-sm border border-white/5"
          >
            Закрити
          </button>
        </div>
        <p className="text-[11px] text-amber-400/80 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>Запис зберігається протягом 10 днів. Будь ласка, завантажте файл на свій пристрій, якщо він вам потрібен.</span>
        </p>
      </div>
    </div>
  );
}
