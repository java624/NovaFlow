'use client';

import React, { useEffect, useRef } from 'react';
import { RemoteUser, ICameraVideoTrack, ILocalVideoTrack, IAgoraRTCRemoteUser } from 'agora-rtc-react';
import { ParticipantProfile } from './types';

interface LessonRoomVideoAreaProps {
  layoutMode: 'grid' | 'focus';
  screenSharing: boolean;
  screenTrack: ILocalVideoTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  activeSpeakerUid: number | string | null;
  safeChannel: string;
  localCameraTrack: ICameraVideoTrack | null;
  cameraOff: boolean;
  userInitials: string;
  userName?: string;
  uid: number;
  micMuted: boolean;
  handRaised: boolean;
  // NEW: uid -> {name, role} directory so remote tiles show real names
  // (and a teacher badge) instead of the generic "Співрозмовник" label.
  // Optional — falls back to old behavior if not provided.
  participantProfiles?: Record<string, ParticipantProfile>;
}

const SCREEN_UID_OFFSET = 1_000_000_000;

export function isScreenShareUser(uid: number | string): boolean {
  const numericUid = Number(uid);
  return Number.isFinite(numericUid) && numericUid >= SCREEN_UID_OFFSET;
}

function getRemoteLabel(
  user: IAgoraRTCRemoteUser,
  profiles?: Record<string, ParticipantProfile>
): { name: string; isTeacher: boolean; isScreenShare: boolean } {
  const isScreenShare = isScreenShareUser(user.uid);
  const profile = profiles?.[String(user.uid)];
  return {
    name: isScreenShare ? 'Демонстрація екрана' : profile?.name || `Учасник ${user.uid}`,
    isTeacher: !isScreenShare && profile?.role === 'teacher',
    isScreenShare,
  };
}

// NEW: pick a sensible grid template as the number of tiles grows, so the
// layout still works with a teacher + a full class rather than just 2 people.
function getGridColsClass(tileCount: number): string {
  if (tileCount <= 1) return 'grid-cols-1';
  if (tileCount === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (tileCount <= 4) return 'grid-cols-2';
  if (tileCount <= 6) return 'grid-cols-2 sm:grid-cols-3';
  return 'grid-cols-3 sm:grid-cols-4';
}

export default function LessonRoomVideoArea({
  layoutMode,
  screenSharing,
  screenTrack,
  remoteUsers,
  activeSpeakerUid,
  safeChannel,
  localCameraTrack,
  cameraOff,
  userInitials,
  userName,
  uid,
  micMuted,
  handRaised,
  participantProfiles,
}: LessonRoomVideoAreaProps) {
  // A remote UID >= 1,000,000,000 belongs to a dedicated screen-share client.
  // It always wins focus mode, independently of the current audio speaker.
  const featuredRemoteUser =
    remoteUsers.find((user) => isScreenShareUser(user.uid)) ||
    remoteUsers.find((user) => user.uid === activeSpeakerUid) ||
    remoteUsers[0] ||
    null;
  const otherRemoteUsers = remoteUsers.filter((user) => user.uid !== featuredRemoteUser?.uid);

  return (
    <div className="flex-1 relative overflow-hidden p-3 sm:p-5 flex">
      <div className="flex-1 relative flex items-center justify-center h-full">
        {layoutMode === 'focus' ? (
          /* ========================================================= FOCUS LAYOUT ========================================================= */
          <div className="w-full h-full relative rounded-3xl overflow-hidden backdrop-blur-xl bg-zinc-900/60 border border-white/10 shadow-2xl flex items-center justify-center">
            {/* Featured Main Video: Screen Share or Active Speaker / First Remote User or Empty State */}
            {screenSharing && screenTrack ? (
              <div className="w-full h-full relative bg-zinc-950">
                <LocalVideoRenderer track={screenTrack} />
                <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-md border border-indigo-400/40 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg z-20">
                  <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Ваша демонстрація екрана
                </div>
              </div>
            ) : featuredRemoteUser ? (
              <div
                className={`w-full h-full relative transition-all duration-300 ${
                  activeSpeakerUid === featuredRemoteUser.uid
                    ? 'border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20'
                    : ''
                }`}
              >
                <RemoteUser user={featuredRemoteUser} playVideo playAudio />
                {(() => {
                  const { name, isTeacher, isScreenShare } = getRemoteLabel(featuredRemoteUser, participantProfiles);
                  return (
                    <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-xs font-medium text-white flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{name}</span>
                      {isScreenShare && (
                        <span className="text-[10px] uppercase tracking-wide bg-indigo-500/30 text-indigo-200 rounded-md px-1.5 py-0.5">
                          Екран
                        </span>
                      )}
                      {isTeacher && (
                        <span className="text-[10px] uppercase tracking-wide bg-indigo-500/30 text-indigo-200 rounded-md px-1.5 py-0.5">
                          Вчитель
                        </span>
                      )}
                      {!isScreenShare && !featuredRemoteUser.hasAudio && <span className="text-rose-400">🔇</span>}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6 text-center">
                <div className="max-w-md flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10">
                    <span className="text-4xl animate-pulse">👤</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Очікування учасників</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Як тільки другий учасник приєднається до каналу{' '}
                    <span className="text-indigo-400 font-semibold">{safeChannel}</span>, його відео
                    відобразиться на головному екрані.
                  </p>
                </div>
              </div>
            )}

            {/* PiP Window (Local User Camera) */}
            <div
              className={`absolute bottom-6 right-6 w-32 h-48 sm:w-44 sm:h-64 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-2xl z-20 ${
                activeSpeakerUid === uid
                  ? 'border-indigo-500 shadow-indigo-500/40 ring-4 ring-indigo-500/20'
                  : 'border-white/20 hover:border-white/40'
              } bg-zinc-900`}
            >
              {localCameraTrack && !cameraOff ? (
                <div className="w-full h-full relative">
                  <LocalVideoRenderer track={localCameraTrack} />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-indigo-950 p-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 mb-1">
                    {userInitials}
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate max-w-full">
                    {userName || 'Ви'}
                  </span>
                </div>
              )}

              {/* Local Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {micMuted && (
                  <span className="bg-rose-500/90 text-white text-[10px] p-1 rounded-lg backdrop-blur-md">
                    🔇
                  </span>
                )}
                {handRaised && (
                  <span className="bg-amber-500/90 text-white text-[10px] p-1 rounded-lg backdrop-blur-md animate-bounce">
                    ✋
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-zinc-950/70 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 truncate">
                {userName || 'Ви'} (Ви)
              </div>
            </div>

            {/* NEW: thumbnail strip for any additional remote participants beyond
                the featured one — otherwise a 3rd+ person in the room was
                previously invisible in focus mode. */}
            {otherRemoteUsers.length > 0 && (
              <div className="absolute top-4 left-4 right-4 sm:right-auto flex gap-2 overflow-x-auto z-20 pb-1">
                {otherRemoteUsers.map((ru) => {
                  const { name, isTeacher, isScreenShare } = getRemoteLabel(ru, participantProfiles);
                  return (
                    <div
                      key={String(ru.uid)}
                      className={`relative w-24 h-16 sm:w-28 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 bg-zinc-900 shadow-lg ${
                        activeSpeakerUid === ru.uid ? 'border-indigo-500' : 'border-white/15'
                      }`}
                    >
                      <RemoteUser user={ru} playVideo playAudio />
                      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-zinc-950/70 backdrop-blur-md text-[9px] text-zinc-200 truncate flex items-center gap-1">
                        {!isScreenShare && !ru.hasAudio && <span className="text-rose-400">🔇</span>}
                        <span className="truncate">{name}</span>
                        {isScreenShare && <span className="text-indigo-300 shrink-0">🖥️</span>}
                        {isTeacher && <span className="text-indigo-300 shrink-0">👑</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= GRID LAYOUT ========================================================= */
          <div className={`w-full h-full grid ${getGridColsClass(remoteUsers.length + 1)} gap-4 auto-rows-fr`}>
            {/* Local User Card */}
            <div
              className={`relative rounded-3xl overflow-hidden backdrop-blur-xl bg-zinc-900/60 border transition-all duration-300 shadow-2xl flex items-center justify-center ${
                activeSpeakerUid === uid
                  ? 'border-2 border-indigo-500 shadow-indigo-500/25 ring-2 ring-indigo-500/30'
                  : 'border-white/10'
              }`}
            >
              {localCameraTrack && !cameraOff ? (
                <div className="w-full h-full relative">
                  <LocalVideoRenderer track={localCameraTrack} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-500/30 mb-3">
                    {userInitials}
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">
                    {userName || 'Ви'}
                  </span>
                  <span className="text-xs text-zinc-500 mt-0.5">Камера вимкнена</span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl text-xs font-medium text-white flex items-center gap-2">
                <span>{userName || 'Ви'} (Ви)</span>
                {micMuted && <span className="text-rose-400">🔇</span>}
              </div>
            </div>

            {/* NEW: one card per remote participant (previously only remoteUsers[0]
                was ever rendered here, so a 3rd/4th person in the room had no tile). */}
            {remoteUsers.length > 0 ? (
              remoteUsers.map((ru) => {
                const { name, isTeacher, isScreenShare } = getRemoteLabel(ru, participantProfiles);
                return (
                  <div
                    key={String(ru.uid)}
                    className={`relative rounded-3xl overflow-hidden backdrop-blur-xl bg-zinc-900/60 border transition-all duration-300 shadow-2xl flex items-center justify-center ${
                      activeSpeakerUid === ru.uid
                        ? 'border-2 border-indigo-500 shadow-indigo-500/25 ring-2 ring-indigo-500/30'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="w-full h-full relative">
                      <RemoteUser user={ru} playVideo playAudio />
                      <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl text-xs font-medium text-white flex items-center gap-2">
                        <span>{name}</span>
                        {isScreenShare && (
                          <span className="text-[10px] uppercase tracking-wide bg-indigo-500/30 text-indigo-200 rounded-md px-1.5 py-0.5">
                            Екран
                          </span>
                        )}
                        {isTeacher && (
                          <span className="text-[10px] uppercase tracking-wide bg-indigo-500/30 text-indigo-200 rounded-md px-1.5 py-0.5">
                            Вчитель
                          </span>
                        )}
                        {!isScreenShare && !ru.hasAudio && <span className="text-rose-400">🔇</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-zinc-900/60 border border-white/10 shadow-2xl flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 text-2xl mb-3">
                    👤
                  </div>
                  <p className="text-sm font-medium text-zinc-300">Очікування учасників</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function LocalVideoRenderer({ track }: { track: ILocalVideoTrack }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || !containerRef.current) return;
    track.play(containerRef.current);
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [track]);

  return <div ref={containerRef} className="w-full h-full object-cover" />;
}
