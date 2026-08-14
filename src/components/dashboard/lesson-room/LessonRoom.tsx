'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import AgoraRTC, { AgoraRTCProvider } from 'agora-rtc-react';

import { LessonRoomProps } from './types';
import { getInitials, isScreenShareUser } from './utils';
import LessonRoomHeader from './LessonRoomHeader';
import LessonRoomFloatingControls from './LessonRoomFloatingControls';
import LessonRoomChatSidebar from './LessonRoomChatSidebar';
import LessonRoomSettingsModal from './LessonRoomSettingsModal';
import LessonRoomVideoArea from './LessonRoomVideoArea';
import ReactionsOverlay from './ReactionsOverlay';
import PollWidget from './PollWidget';
import LessonTimer from './LessonTimer';
import ParticipantsPanel, { ParticipantInfo } from './ParticipantsPanel';
import VirtualBackgroundControls from './VirtualBackgroundControls';
import LessonRoomRecordingModal from './LessonRoomRecordingModal';
import { useVirtualBackground } from './useVirtualBackground';
import { useLessonRecording } from './useLessonRecording';
import RemoteAudioStreamPlayer from './RemoteAudioStreamPlayer';
import { useLessonRoomAgora } from './useLessonRoomAgora';
import { useLessonRoomSignaling } from './useLessonRoomSignaling';

function RoomInner({ channelName, onLeave, userName, userRole = 'student' }: LessonRoomProps) {
  const isTeacher = userRole === 'teacher';

  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus'>('focus');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  // Recording state
  const [recordingSavedBlob, setRecordingSavedBlob] = useState<Blob | null>(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const recordingBlobRef = useRef<Blob | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Signaling Hook
  const signaling = useLessonRoomSignaling({
    client: null as any, // lazy bound after agora hook
    uid: 0,
    userName,
    userRole,
    micTrackRef: { current: null },
    setMicMuted: () => {},
    setIsForceMuted: () => {},
    onLeave,
  });

  // 2. Agora RTC Hook
  const agora = useLessonRoomAgora({
    channelName,
    userName,
    onLeave,
    announceProfile: signaling.announceProfile,
    handleStreamMessage: signaling.handleStreamMessage,
    dataChannelRef: signaling.dataChannelRef,
    remoteDataChannelsRef: signaling.remoteDataChannelsRef,
  });

  // Re-bind signaling hook parameters with agora refs
  signaling.dataChannelRef.current = signaling.dataChannelRef.current;

  // Build remote audio tracks array for recording mixing
  const remoteAudioTracks = useMemo(() => {
    return agora.remoteUsers
      .map((ru) => {
        try {
          return (ru as any).audioTrack?.getMediaStreamTrack() as MediaStreamTrack | undefined;
        } catch {
          return undefined;
        }
      })
      .filter((t): t is MediaStreamTrack => !!t);
  }, [agora.remoteUsers]);

  // Recording hook (teacher only)
  const handleRecordingSave = useCallback((blob: Blob) => {
    recordingBlobRef.current = blob;
    setRecordingSavedBlob(blob);
    setShowRecordingModal(true);
  }, []);

  const recording = useLessonRecording(
    isTeacher ? remoteAudioTracks : [],
    handleRecordingSave
  );

  const userInitials = useMemo(() => getInitials(userName), [userName]);

  // Virtual background hook
  const {
    mode: vbMode,
    isLoading: vbLoading,
    error: vbError,
    applyBlur,
    applyImage,
    disableVB,
  } = useVirtualBackground(agora.localCameraTrack);

  // Auto-scroll chat
  useEffect(() => {
    if (signaling.isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [signaling.chatMessages, signaling.isChatOpen]);

  const handleOpenSettings = useCallback(async () => {
    await agora.refreshDevices();
    setIsSettingsOpen(true);
  }, [agora]);

  // Participant list calculation
  const participantList: ParticipantInfo[] = useMemo(() => {
    const list: ParticipantInfo[] = [
      {
        uid: agora.uid,
        name: userName || 'Ви',
        isLocal: true,
        isMuted: agora.micMuted,
        isTeacher,
      },
    ];
    agora.remoteUsers.forEach((ru) => {
      const profile = signaling.participantProfiles[String(ru.uid)];
      list.push({
        uid: ru.uid,
        name: profile?.name || `Учасник ${ru.uid}`,
        isLocal: false,
        isMuted: !ru.hasAudio,
        isTeacher: profile?.role === 'teacher',
        isHandRaised: Boolean(signaling.raisedHands[String(ru.uid)]),
      });
    });
    return list;
  }, [agora.uid, userName, agora.micMuted, isTeacher, agora.remoteUsers, signaling.participantProfiles, signaling.raisedHands]);

  const raisedHandParticipants = agora.remoteUsers
    .filter((remoteUser) => signaling.raisedHands[String(remoteUser.uid)])
    .map((remoteUser) => ({
      uid: remoteUser.uid,
      name: signaling.participantProfiles[String(remoteUser.uid)]?.name || `Учасник ${remoteUser.uid}`,
    }));

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-white font-sans flex flex-col overflow-hidden select-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-zinc-950 to-zinc-950 h-[100dvh] overflow-y-hidden overflow-x-hidden">
      {/* Header Bar */}
      <LessonRoomHeader
        safeChannel={agora.safeChannel}
        isConnected={agora.isConnected}
        networkQuality={agora.networkQuality}
        remoteUsersCount={agora.remoteUsers.length}
        layoutMode={layoutMode}
        onToggleLayoutMode={() => setLayoutMode((prev) => (prev === 'focus' ? 'grid' : 'focus'))}
        isTeacher={isTeacher}
        isRecording={recording.isRecording}
        recordingDurationSec={recording.durationSec}
        recordingError={recording.error}
        onStartRecording={recording.startRecording}
        onStopRecording={recording.stopRecording}
      />

      {/* Lesson timer */}
      {(signaling.timerRemaining > 0 || signaling.timerRunning || isTeacher) && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40">
          <LessonTimer
            isTeacher={isTeacher}
            remainingSeconds={signaling.timerRemaining}
            isRunning={signaling.timerRunning}
            onStart={signaling.handleStartTimer}
            onPauseResume={signaling.handlePauseResumeTimer}
            onReset={signaling.handleResetTimer}
          />
        </div>
      )}

      {/* Hand Raised Notification */}
      {signaling.handRaised && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-500/90 to-indigo-600/90 backdrop-blur-xl border border-amber-400/40 text-white px-5 py-2.5 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center gap-3 animate-bounce">
          <span className="text-xl">✋</span>
          <span className="text-xs sm:text-sm font-semibold">Ви підняли руку (Вчитель бачить ваше запитання)</span>
          <button
            onClick={signaling.handleRaiseHandToggle}
            className="ml-2 text-amber-200 hover:text-white text-xs underline"
          >
            Опустити
          </button>
        </div>
      )}

      {raisedHandParticipants.length > 0 && (
        <div className="absolute top-20 right-5 z-40 flex max-w-sm flex-col gap-2">
          {raisedHandParticipants.map((participant) => (
            <div key={String(participant.uid)} className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-100 shadow-xl backdrop-blur-xl">
              ✋ {participant.name} підняв(-ла) руку
            </div>
          ))}
        </div>
      )}

      {/* Forced-mute notice */}
      {signaling.forceMutedNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-xl border border-white/10 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="text-xl">🔇</span>
          <span className="text-xs sm:text-sm font-semibold">Вчитель вимкнув ваш мікрофон</span>
        </div>
      )}

      {/* Kicked notice */}
      {signaling.kickedNotice && (
        <div className="absolute inset-0 z-[200] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center space-y-2">
            <span className="text-4xl">🚪</span>
            <p className="text-lg font-semibold">Вас видалено з кімнати вчителем</p>
            <p className="text-sm text-zinc-400">Ви покидаєте урок…</p>
          </div>
        </div>
      )}

      {/* Microphone Error Banner */}
      {agora.micError && (
        <div className="bg-amber-950/90 border-b border-amber-700/50 text-white p-3 px-6 text-xs flex items-center justify-between gap-2 z-40">
          <div className="flex items-center gap-2">
            <span className="text-base">🎙️</span>
            <span>{agora.micError}</span>
          </div>
          <button
            onClick={() => agora.setMicError(null)}
            className="px-2 py-0.5 bg-amber-800 hover:bg-amber-700 rounded text-xs text-white"
          >
            Закрити
          </button>
        </div>
      )}

      {/* Token Error Banner */}
      {agora.tokenError && (
        <div className="bg-rose-950/90 border-b border-rose-700/50 text-white p-3 px-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 z-40">
          <div className="flex items-center gap-2">
            <span className="text-base">🔐</span>
            <span>{agora.tokenError}</span>
          </div>
          <button
            onClick={agora.handleLeave}
            className="px-3 py-1 bg-rose-700 hover:bg-rose-600 rounded-lg text-white font-medium shrink-0"
          >
            Закрити кімнату
          </button>
        </div>
      )}

      {/* Native Dual-Mode Audio Players for Remote Participants */}
      {agora.remoteUsers.map((ru) => (
        <RemoteAudioStreamPlayer key={String(ru.uid)} user={ru} selectedSpeakerId={agora.selectedSpeakerId} />
      ))}

      {/* Video Layout Area */}
      <LessonRoomVideoArea
        layoutMode={layoutMode}
        screenSharing={agora.screenSharing}
        screenTrack={agora.screenTrack}
        remoteUsers={agora.remoteUsers}
        activeSpeakerUid={agora.activeSpeakerUid}
        safeChannel={agora.safeChannel}
        localCameraTrack={agora.localCameraTrack}
        cameraOff={agora.cameraOff}
        userInitials={userInitials}
        userName={userName}
        uid={agora.uid}
        micMuted={agora.micMuted}
        handRaised={signaling.handRaised}
        participantProfiles={signaling.participantProfiles}
      />

      {/* Reactions layer */}
      <ReactionsOverlay reactions={signaling.reactions} onSendReaction={signaling.handleSendReaction} />

      {/* Virtual background control */}
      <VirtualBackgroundControls
        mode={vbMode}
        isLoading={vbLoading}
        error={vbError}
        onBlur={() => applyBlur(2)}
        onImage={(url) => applyImage(url)}
        onDisable={disableVB}
      />

      {/* Chat Sidebar */}
      <LessonRoomChatSidebar
        isChatOpen={signaling.isChatOpen}
        onToggleChat={signaling.toggleChat}
        chatMessages={signaling.chatMessages}
        inputMessage={signaling.inputMessage}
        onInputChange={signaling.setInputMessage}
        onSendMessage={signaling.handleSendMessage}
        chatBottomRef={chatBottomRef}
      />

      {/* Poll panel */}
      <PollWidget
        isOpen={isPollOpen}
        onClose={() => setIsPollOpen(false)}
        isTeacher={isTeacher}
        currentPoll={signaling.currentPoll}
        hasVoted={signaling.hasVotedPollId === signaling.currentPoll?.id}
        onCreatePoll={signaling.handleCreatePoll}
        onVote={signaling.handleVotePoll}
        onEndPoll={signaling.handleEndPoll}
      />

      {/* Participants / moderation panel */}
      <ParticipantsPanel
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        participants={participantList}
        isTeacher={isTeacher}
        onMuteAll={signaling.handleMuteAll}
        onMuteUser={signaling.handleMuteUser}
        onKickUser={signaling.handleKickUser}
      />

      {/* Settings Modal */}
      <LessonRoomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cameras={agora.cameras}
        microphones={agora.microphones}
        speakers={agora.speakers}
        selectedCamId={agora.selectedCamId}
        selectedMicId={agora.selectedMicId}
        selectedSpeakerId={agora.selectedSpeakerId}
        onDeviceChange={agora.handleDeviceChange}
      />

      {/* Recording Saved Modal */}
      <LessonRoomRecordingModal
        isOpen={showRecordingModal}
        recordingBlob={recordingSavedBlob}
        safeChannel={agora.safeChannel}
        onClose={() => {
          setShowRecordingModal(false);
          setRecordingSavedBlob(null);
        }}
      />

      {/* Floating Control Bar */}
      <LessonRoomFloatingControls
        micMuted={agora.micMuted}
        onMicToggle={agora.handleMicToggle}
        cameraOff={agora.cameraOff}
        onCameraToggle={agora.handleCameraToggle}
        screenSharing={agora.screenSharing}
        onScreenShare={agora.handleScreenShare}
        handRaised={signaling.handRaised}
        onRaiseHandToggle={signaling.handleRaiseHandToggle}
        isChatOpen={signaling.isChatOpen}
        onToggleChat={signaling.toggleChat}
        unreadCount={signaling.unreadCount}
        isSettingsOpen={isSettingsOpen}
        onOpenSettings={handleOpenSettings}
        onLeave={agora.handleLeave}
        isPollOpen={isPollOpen}
        onTogglePoll={() => setIsPollOpen((p) => !p)}
        hasActivePoll={!!signaling.currentPoll}
        isParticipantsOpen={isParticipantsOpen}
        onToggleParticipants={() => setIsParticipantsOpen((p) => !p)}
        participantsCount={participantList.length}
        isTeacher={isTeacher}
      />
    </div>
  );
}

export default function LessonRoom(props: LessonRoomProps) {
  const client = useMemo(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    client.enableDualStream().catch((e) => console.warn('[Agora] Dual-stream not supported:', e));
    return client;
  }, []);

  return (
    <AgoraRTCProvider client={client}>
      <RoomInner {...props} />
    </AgoraRTCProvider>
  );
}
