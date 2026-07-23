'use client';

import React from 'react';
import { ControlButtonProps } from './types';

interface LessonRoomFloatingControlsProps {
  micMuted: boolean;
  onMicToggle: () => void;
  cameraOff: boolean;
  onCameraToggle: () => void;
  screenSharing: boolean;
  onScreenShare: () => void;
  handRaised: boolean;
  onRaiseHandToggle: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  unreadCount: number;
  isSettingsOpen: boolean;
  onOpenSettings: () => void;
  onLeave: () => void;
  // NEW: opinion/poll panel
  isPollOpen: boolean;
  onTogglePoll: () => void;
  /** Shows a small pulsing dot when a poll is live and this user hasn't opened the panel yet. */
  hasActivePoll?: boolean;
  // NEW: participants / moderation panel
  isParticipantsOpen: boolean;
  onToggleParticipants: () => void;
  participantsCount?: number;
  // NEW: unlocks nothing in this component directly, but kept so the teacher
  // can see their own role reflected consistently if we want to style things
  // differently for them later (e.g. a distinct color for the Kick-capable state).
  isTeacher?: boolean;
}

export default function LessonRoomFloatingControls({
  micMuted,
  onMicToggle,
  cameraOff,
  onCameraToggle,
  screenSharing,
  onScreenShare,
  handRaised,
  onRaiseHandToggle,
  isChatOpen,
  onToggleChat,
  unreadCount,
  isSettingsOpen,
  onOpenSettings,
  onLeave,
  isPollOpen,
  onTogglePoll,
  hasActivePoll,
  isParticipantsOpen,
  onToggleParticipants,
  participantsCount,
  isTeacher,
}: LessonRoomFloatingControlsProps) {
  return (
    <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 px-5 py-3 rounded-full backdrop-blur-2xl bg-zinc-900/85 border border-white/15 shadow-2xl shadow-black/80">
      {/* Mic toggle */}
      <ControlButton
        active={!micMuted}
        onClick={onMicToggle}
        tooltip={micMuted ? 'Увімкнути мікрофон' : 'Вимкнути мікрофон'}
        activeClass="bg-zinc-800 text-white hover:bg-zinc-700"
        inactiveClass="bg-rose-600 text-white hover:bg-rose-500"
        icon={
          !micMuted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )
        }
      />

      {/* Camera toggle */}
      <ControlButton
        active={!cameraOff}
        onClick={onCameraToggle}
        tooltip={cameraOff ? 'Увімкнути камеру' : 'Вимкнути камеру'}
        activeClass="bg-zinc-800 text-white hover:bg-zinc-700"
        inactiveClass="bg-rose-600 text-white hover:bg-rose-500"
        icon={
          !cameraOff ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )
        }
      />

      {/* Screen share */}
      <ControlButton
        active={screenSharing}
        onClick={onScreenShare}
        tooltip={screenSharing ? 'Зупинити демонстрацію' : 'Демонстрація екрана'}
        activeClass="bg-indigo-600 text-white hover:bg-indigo-500 ring-2 ring-indigo-400/50"
        inactiveClass="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />

      {/* Raise Hand */}
      <ControlButton
        active={handRaised}
        onClick={onRaiseHandToggle}
        tooltip={handRaised ? 'Опустити руку' : 'Підняти руку'}
        activeClass="bg-amber-500 text-white hover:bg-amber-400 ring-2 ring-amber-400/50 animate-pulse"
        inactiveClass="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
        icon={<span className="text-base">✋</span>}
      />

      {/* Chat Toggle */}
      <div className="relative">
        <ControlButton
          active={isChatOpen}
          onClick={onToggleChat}
          tooltip="Чат уроку"
          activeClass="bg-indigo-600 text-white hover:bg-indigo-500"
          inactiveClass="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        {unreadCount > 0 && !isChatOpen && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
            {unreadCount}
          </span>
        )}
      </div>

      {/* NEW: Poll toggle */}
      <div className="relative">
        <ControlButton
          active={isPollOpen}
          onClick={onTogglePoll}
          tooltip="Опитування"
          activeClass="bg-indigo-600 text-white hover:bg-indigo-500"
          inactiveClass="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          icon={<span className="text-base">📊</span>}
        />
        {hasActivePoll && !isPollOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-900 animate-pulse" />
        )}
      </div>

      {/* NEW: Participants / moderation toggle */}
      <div className="relative">
        <ControlButton
          active={isParticipantsOpen}
          onClick={onToggleParticipants}
          tooltip={isTeacher ? 'Учасники та модерація' : 'Учасники'}
          activeClass="bg-indigo-600 text-white hover:bg-indigo-500"
          inactiveClass="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        {typeof participantsCount === 'number' && (
          <span className="absolute -bottom-1 -right-1 bg-zinc-700 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-zinc-900">
            {participantsCount}
          </span>
        )}
      </div>

      {/* Device Settings */}
      <ControlButton
        active={isSettingsOpen}
        onClick={onOpenSettings}
        tooltip="Налаштування пристроїв"
        activeClass="bg-zinc-700 text-white"
        inactiveClass="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      />

      {/* Separator */}
      <div className="w-[1px] h-6 bg-white/10 mx-1" />

      {/* Leave Room Button */}
      <button
        onClick={onLeave}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/30"
        title="Вийти з уроку"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.684A1 1 0 008.28 3H5z" />
        </svg>
      </button>
    </footer>
  );
}

function ControlButton({ active, onClick, icon, tooltip, activeClass, inactiveClass }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${
        active ? activeClass : inactiveClass
      }`}
    >
      {icon}
    </button>
  );
}
