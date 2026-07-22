'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  useRTCClient,
  useRemoteUsers,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  ILocalVideoTrack,
} from 'agora-rtc-react';

import { LessonRoomProps, ChatMessage } from './lesson-room/types';
import { getInitials, generateUid } from './lesson-room/utils';
import LessonRoomHeader from './lesson-room/LessonRoomHeader';
import LessonRoomFloatingControls from './lesson-room/LessonRoomFloatingControls';
import LessonRoomChatSidebar from './lesson-room/LessonRoomChatSidebar';
import LessonRoomSettingsModal from './lesson-room/LessonRoomSettingsModal';
import LessonRoomVideoArea from './lesson-room/LessonRoomVideoArea';

function RoomInner({ channelName, onLeave, userName }: LessonRoomProps) {
  // Controls & States
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus'>('focus');

  // Sidebars & Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Network & Quality
  const [networkQuality, setNetworkQuality] = useState<number>(1);
  const [activeSpeakerUid, setActiveSpeakerUid] = useState<number | string | null>(null);

  // Devices
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');

  // Connections & Token
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'NovaFlow System',
      text: 'Ласкаво просимо до відеоуроку NovaFlow! Ви можете обмінюватися повідомленнями тут.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Tracks & Refs
  const [localMicrophoneTrack, setLocalMicrophoneTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localCameraTrack, setLocalCameraTrack] = useState<ICameraVideoTrack | null>(null);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);

  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const camTrackRef = useRef<ICameraVideoTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const client = useRTCClient();
  const remoteUsers = useRemoteUsers();

  const uid = useMemo(() => generateUid(userName), [userName]);
  const safeChannel = useMemo(() => String(channelName), [channelName]);
  const userInitials = useMemo(() => getInitials(userName), [userName]);

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // 1. Fetch token & Join channel
  useEffect(() => {
    let isMounted = true;

    async function initAndJoin() {
      try {
        setTokenError(null);
        setCameraError(null);

        console.log('[Agora Token] Requesting token for channel:', safeChannel, 'UID:', uid);
        const res = await fetch(
          `/api/agora-token?channelName=${encodeURIComponent(safeChannel)}&uid=${uid}`
        );
        if (!res.ok) {
          throw new Error(
            `Помилка сервера токенів (статус ${res.status}). Переконайтеся, що змінні середовища додано у налаштуваннях Netlify (Environment variables).`
          );
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (!isMounted) return;

        const fetchedToken = data.rtcToken || null;
        setToken(fetchedToken);

        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
        if (!appId) {
          throw new Error('NEXT_PUBLIC_AGORA_APP_ID environment variable is missing');
        }

        console.log('[Agora] Joining channel...', fetchedToken ? '(with token)' : '(App ID testing mode)');
        await client.join(appId, safeChannel, fetchedToken, uid);
        if (!isMounted) {
          await client.leave();
          return;
        }

        setIsConnected(true);
        console.log('[Agora] Joined channel successfully:', safeChannel, 'UID:', uid);

        // Audio track
        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          if (!isMounted) {
            audioTrack.close();
            return;
          }
          micTrackRef.current = audioTrack;
          setLocalMicrophoneTrack(audioTrack);
          await client.publish(audioTrack);
        } catch (audioErr) {
          console.error('[Agora] Microphone creation error:', audioErr);
        }

        // Video track
        try {
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          if (!isMounted) {
            videoTrack.close();
            return;
          }
          camTrackRef.current = videoTrack;
          setLocalCameraTrack(videoTrack);
          await client.publish(videoTrack);
        } catch (camErr: any) {
          console.warn('[Agora] Camera NOT_READABLE:', camErr);
          if (isMounted) {
            setCameraError('Камера недоступна або зайнята іншим додатком');
            setCameraOff(true);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[Agora] Initialization error:', err);
        const errorMessage = err?.message || String(err);
        if (
          errorMessage.includes('dynamic use static key') ||
          errorMessage.includes('CAN_NOT_GET_GATEWAY_SERVER') ||
          err?.code === 'CAN_NOT_GET_GATEWAY_SERVER'
        ) {
          setTokenError(
            'Ваш проєкт в Agora Console вимагає App Certificate. Вкажіть дійсний 32-значний hex-ключ у файлі .env.local (AGORA_APP_CERTIFICATE=...)'
          );
        } else {
          setTokenError(errorMessage || 'Помилка підключення до кімнати');
        }
      }
    }

    initAndJoin();

    return () => {
      isMounted = false;
      setIsConnected(false);

      if (micTrackRef.current) {
        micTrackRef.current.close();
        micTrackRef.current = null;
      }
      if (camTrackRef.current) {
        camTrackRef.current.close();
        camTrackRef.current = null;
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }

      client.leave().catch((leaveErr) => {
        console.warn('[Agora] Error leaving channel on unmount:', leaveErr);
      });
    };
  }, [client, safeChannel, uid]);

  // 2. Event Listeners (Volume, Quality)
  useEffect(() => {
    if (!client) return;

    try {
      client.enableAudioVolumeIndicator();
    } catch (e) {}

    const handleUserPublished = async (user: any, mediaType: 'video' | 'audio') => {
      try {
        await client.subscribe(user, mediaType);
      } catch (err) {
        console.error('[Agora] Subscribe error:', err);
      }
    };

    const handleVolumeIndicator = (volumes: any[]) => {
      let highestVolume = 0;
      let speakerUid: number | string | null = null;
      volumes.forEach((v) => {
        if (v.level > 25 && v.level > highestVolume) {
          highestVolume = v.level;
          speakerUid = v.uid === 0 ? uid : v.uid;
        }
      });
      setActiveSpeakerUid(speakerUid);
    };

    const handleNetworkQuality = (stats: any) => {
      const q = Math.max(stats.uplinkNetworkQuality || 1, stats.downlinkNetworkQuality || 1);
      setNetworkQuality(q);
    };

    const handleStreamMessage = (remoteUid: any, data: any) => {
      try {
        let rawText = '';
        if (typeof data === 'string') {
          rawText = data;
        } else if (data instanceof Uint8Array || ArrayBuffer.isView(data)) {
          rawText = new TextDecoder('utf-8').decode(data);
        } else if (data && typeof data === 'object' && data.payload) {
          rawText = typeof data.payload === 'string'
            ? data.payload
            : new TextDecoder('utf-8').decode(data.payload);
        }

        if (!rawText) return;
        const parsed = JSON.parse(rawText);

        if (parsed.type === 'CHAT_MSG') {
          console.log('[Agora Chat] Received message from', remoteUid, parsed);
          const incomingMsg: ChatMessage = {
            id: parsed.id || Date.now().toString(),
            sender: parsed.sender || `Учасник ${remoteUid}`,
            text: parsed.text,
            time: parsed.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
          };
          setChatMessages((prev) => [...prev, incomingMsg]);
          setIsChatOpen((open) => {
            if (!open) setUnreadCount((count) => count + 1);
            return open;
          });
        }
      } catch (err) {
        console.error('[Agora Chat] Error parsing incoming stream message:', err);
      }
    };

    client.on('user-published', handleUserPublished);
    client.on('volume-indicator', handleVolumeIndicator);
    client.on('network-quality', handleNetworkQuality);
    client.on('stream-message', handleStreamMessage);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('volume-indicator', handleVolumeIndicator);
      client.off('network-quality', handleNetworkQuality);
      client.off('stream-message', handleStreamMessage);
    };
  }, [client, uid]);

  // 3. Media Devices
  const refreshDevices = useCallback(async () => {
    try {
      const cams = await AgoraRTC.getCameras();
      const mics = await AgoraRTC.getMicrophones();
      setCameras(cams);
      setMicrophones(mics);
      if (cams.length > 0 && !selectedCamId) setSelectedCamId(cams[0].deviceId);
      if (mics.length > 0 && !selectedMicId) setSelectedMicId(mics[0].deviceId);
    } catch (err) {
      console.error('[Agora] Error fetching devices:', err);
    }
  }, [selectedCamId, selectedMicId]);

  const handleOpenSettings = useCallback(async () => {
    await refreshDevices();
    setIsSettingsOpen(true);
  }, [refreshDevices]);

  const handleDeviceChange = useCallback(
    async (type: 'camera' | 'mic', deviceId: string) => {
      try {
        if (type === 'camera') {
          setSelectedCamId(deviceId);
          if (camTrackRef.current) {
            await camTrackRef.current.setDevice(deviceId);
          }
        } else if (type === 'mic') {
          setSelectedMicId(deviceId);
          if (micTrackRef.current) {
            await micTrackRef.current.setDevice(deviceId);
          }
        }
      } catch (err) {
        console.error(`[Agora] Error switching ${type} device:`, err);
      }
    },
    []
  );

  // 4. Control Toggles
  const handleMicToggle = useCallback(async () => {
    if (micTrackRef.current) {
      const nextMuted = !micMuted;
      await micTrackRef.current.setMuted(nextMuted);
      setMicMuted(nextMuted);
    }
  }, [micMuted]);

  const handleCameraToggle = useCallback(async () => {
    if (camTrackRef.current) {
      const nextOff = !cameraOff;
      await camTrackRef.current.setMuted(nextOff);
      setCameraOff(nextOff);
    } else if (cameraOff) {
      try {
        setCameraError(null);
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        camTrackRef.current = videoTrack;
        setLocalCameraTrack(videoTrack);
        setCameraOff(false);
        if (client && client.connectionState === 'CONNECTED') {
          await client.publish(videoTrack);
        }
      } catch (camErr: any) {
        console.warn('[Agora] Camera retry failed:', camErr);
        setCameraError('Камера недоступна або зайнята іншим додатком');
        setCameraOff(true);
      }
    }
  }, [cameraOff, client]);

  const handleScreenShare = useCallback(async () => {
    if (screenSharing) {
      if (screenTrackRef.current) {
        try {
          await client.unpublish(screenTrackRef.current);
        } catch (e) {}
        screenTrackRef.current.close();
        screenTrackRef.current = null;
        setScreenTrack(null);
      }
      setScreenSharing(false);
    } else {
      try {
        const track = await AgoraRTC.createScreenVideoTrack({}, 'disable');
        const screenVideoTrack = Array.isArray(track) ? track[0] : track;
        screenTrackRef.current = screenVideoTrack;
        setScreenTrack(screenVideoTrack);
        setScreenSharing(true);
        await client.publish(screenVideoTrack);

        screenVideoTrack.on('track-ended', () => {
          if (screenTrackRef.current) {
            client.unpublish(screenTrackRef.current).catch(() => {});
            screenTrackRef.current.close();
            screenTrackRef.current = null;
            setScreenTrack(null);
          }
          setScreenSharing(false);
        });
      } catch (err: any) {
        console.warn('[Agora] Screen share cancelled or failed:', err);
      }
    }
  }, [screenSharing, client]);

  const handleRaiseHandToggle = useCallback(() => {
    setHandRaised((prev) => !prev);
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputMessage.trim()) return;

      const textToSend = inputMessage.trim();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msgId = Date.now().toString();

      const newMsg: ChatMessage = {
        id: msgId,
        sender: userName || 'Користувач',
        text: textToSend,
        time: timeStr,
        isSelf: true,
      };

      setChatMessages((prev) => [...prev, newMsg]);
      setInputMessage('');

      // Broadcast message to remote participants in channel
      if (client && client.connectionState === 'CONNECTED') {
        try {
          const payloadStr = JSON.stringify({
            type: 'CHAT_MSG',
            id: msgId,
            sender: userName || 'Користувач',
            text: textToSend,
            time: timeStr,
          });
          const encoded = new TextEncoder().encode(payloadStr);

          if (typeof (client as any).sendStreamMessage === 'function') {
            await (client as any).sendStreamMessage(encoded);
            console.log('[Agora Chat] Broadcasted stream message:', textToSend);
          }
        } catch (err) {
          console.warn('[Agora Chat] Stream message send warning:', err);
        }
      }
    },
    [inputMessage, userName, client]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  const handleLeave = useCallback(async () => {
    console.log('[Agora] Leaving room explicitly');
    if (micTrackRef.current) {
      micTrackRef.current.close();
      micTrackRef.current = null;
    }
    if (camTrackRef.current) {
      camTrackRef.current.close();
      camTrackRef.current = null;
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.close();
      screenTrackRef.current = null;
    }
    try {
      await client.leave();
    } catch (e) {}
    onLeave();
  }, [client, onLeave]);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-white font-sans flex flex-col overflow-hidden select-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-zinc-950 to-zinc-950">
      {/* Header Bar */}
      <LessonRoomHeader
        safeChannel={safeChannel}
        isConnected={isConnected}
        networkQuality={networkQuality}
        remoteUsersCount={remoteUsers.length}
        layoutMode={layoutMode}
        onToggleLayoutMode={() => setLayoutMode((prev) => (prev === 'focus' ? 'grid' : 'focus'))}
      />

      {/* Hand Raised Notification */}
      {handRaised && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-500/90 to-indigo-600/90 backdrop-blur-xl border border-amber-400/40 text-white px-5 py-2.5 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center gap-3 animate-bounce">
          <span className="text-xl">✋</span>
          <span className="text-xs sm:text-sm font-semibold">Ви підняли руку (Вчитель бачить ваше запитання)</span>
          <button
            onClick={() => setHandRaised(false)}
            className="ml-2 text-amber-200 hover:text-white text-xs underline"
          >
            Опустити
          </button>
        </div>
      )}

      {/* Error Banner */}
      {tokenError && (
        <div className="bg-rose-950/90 border-b border-rose-700/50 text-white p-3 px-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 z-40">
          <div className="flex items-center gap-2">
            <span className="text-base">🔐</span>
            <span>{tokenError}</span>
          </div>
          <button
            onClick={handleLeave}
            className="px-3 py-1 bg-rose-700 hover:bg-rose-600 rounded-lg text-white font-medium shrink-0"
          >
            Закрити кімнату
          </button>
        </div>
      )}

      {/* Video Layout Area */}
      <LessonRoomVideoArea
        layoutMode={layoutMode}
        screenSharing={screenSharing}
        screenTrack={screenTrack}
        remoteUsers={remoteUsers}
        activeSpeakerUid={activeSpeakerUid}
        safeChannel={safeChannel}
        localCameraTrack={localCameraTrack}
        cameraOff={cameraOff}
        userInitials={userInitials}
        userName={userName}
        uid={uid}
        micMuted={micMuted}
        handRaised={handRaised}
      />

      {/* Chat Sidebar */}
      <LessonRoomChatSidebar
        isChatOpen={isChatOpen}
        onToggleChat={toggleChat}
        chatMessages={chatMessages}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        onSendMessage={handleSendMessage}
        chatBottomRef={chatBottomRef}
      />

      {/* Settings Modal */}
      <LessonRoomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cameras={cameras}
        microphones={microphones}
        selectedCamId={selectedCamId}
        selectedMicId={selectedMicId}
        onDeviceChange={handleDeviceChange}
      />

      {/* Floating Control Bar */}
      <LessonRoomFloatingControls
        micMuted={micMuted}
        onMicToggle={handleMicToggle}
        cameraOff={cameraOff}
        onCameraToggle={handleCameraToggle}
        screenSharing={screenSharing}
        onScreenShare={handleScreenShare}
        handRaised={handRaised}
        onRaiseHandToggle={handleRaiseHandToggle}
        isChatOpen={isChatOpen}
        onToggleChat={toggleChat}
        unreadCount={unreadCount}
        isSettingsOpen={isSettingsOpen}
        onOpenSettings={handleOpenSettings}
        onLeave={handleLeave}
      />
    </div>
  );
}

// ------------------------------------------------------------------ Main Exported Component
export default function LessonRoom(props: LessonRoomProps) {
  const client = useMemo(() => {
    return AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }, []);

  return (
    <AgoraRTCProvider client={client}>
      <RoomInner {...props} />
    </AgoraRTCProvider>
  );
}