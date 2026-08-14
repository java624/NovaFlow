'use client';

import React from 'react';

interface LessonRoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers?: MediaDeviceInfo[];
  selectedCamId: string;
  selectedMicId: string;
  selectedSpeakerId?: string;
  onDeviceChange: (type: 'camera' | 'mic' | 'speaker', deviceId: string) => void;
}

export default function LessonRoomSettingsModal({
  isOpen,
  onClose,
  cameras,
  microphones,
  speakers = [],
  selectedCamId,
  selectedMicId,
  selectedSpeakerId = '',
  onDeviceChange,
}: LessonRoomSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative">
        <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <span>⚙️</span> Налаштування пристроїв аудіо та відео
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Camera Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              🎥 Камера
            </label>
            <select
              value={selectedCamId}
              onChange={(e) => onDeviceChange('camera', e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {cameras.length === 0 && <option value="">Камери не знайдено</option>}
              {cameras.map((cam) => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Камера ${cam.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Microphone Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              🎤 Мікрофон (Вхідний звук)
            </label>
            <select
              value={selectedMicId}
              onChange={(e) => onDeviceChange('mic', e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {microphones.length === 0 && <option value="">Мікрофони не знайдено</option>}
              {microphones.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Мікрофон ${mic.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Speakers / Audio Output Selector */}
          {speakers.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                🔊 Динаміки / Навушники (Вихідний звук)
              </label>
              <select
                value={selectedSpeakerId}
                onChange={(e) => onDeviceChange('speaker', e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {speakers.map((spk) => (
                  <option key={spk.deviceId} value={spk.deviceId}>
                    {spk.label || `Динамік ${spk.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Testing tip */}
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-200 leading-relaxed">
            <span className="font-semibold block mb-0.5">💡 Порада для тестування:</span>
            Якщо ви тестуєте Вчителя та Учня з <strong>одного комп'ютера</strong> у двох вкладках браузера, Chrome автоматично глушить мікрофон у другій вкладці, щоб запобігти звуковому відлунню (AEC). Рекомендуємо тестувати з 2 різних пристроїв або смартфона.
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-xs text-white transition-all shadow-lg shadow-indigo-600/30"
        >
          Зберегти та закрити
        </button>
      </div>
    </div>
  );
}
