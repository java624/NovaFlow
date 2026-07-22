'use client';

import React from 'react';

interface LessonRoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  selectedCamId: string;
  selectedMicId: string;
  onDeviceChange: (type: 'camera' | 'mic', deviceId: string) => void;
}

export default function LessonRoomSettingsModal({
  isOpen,
  onClose,
  cameras,
  microphones,
  selectedCamId,
  selectedMicId,
  onDeviceChange,
}: LessonRoomSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative">
        <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <span>⚙️</span> Налаштування пристроїв
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
              🎤 Мікрофон
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
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-xs text-white transition-all shadow-lg shadow-indigo-600/30"
        >
          Зберегти та закрити
        </button>
      </div>
    </div>
  );
}
