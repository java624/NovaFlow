'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  useRTCClient,
  useRemoteUsers,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  ILocalVideoTrack,
  IAgoraRTCClient,
  ILocalDataChannel,
  IRemoteDataChannel,
} from 'agora-rtc-react';

import { LessonRoomProps, ChatMessage } from './types';
import { getInitials, generateUid } from './utils';
import LessonRoomHeader from './LessonRoomHeader';
import LessonRoomFloatingControls from './LessonRoomFloatingControls';
import LessonRoomChatSidebar from './LessonRoomChatSidebar';
import LessonRoomSettingsModal from './LessonRoomSettingsModal';
import LessonRoomVideoArea from './LessonRoomVideoArea';

// ---- NEW: feature components ----
import ReactionsOverlay, { FlyingReaction } from './ReactionsOverlay';
import PollWidget, { PollData } from './PollWidget';
import LessonTimer from './LessonTimer';
import ParticipantsPanel, { ParticipantInfo } from './ParticipantsPanel';
import VirtualBackgroundControls from './VirtualBackgroundControls';
import { useVirtualBackground } from './useVirtualBackground';

const SCREEN_UID_OFFSET = 1_000_000_000;
const CLASSROOM_DATA_CHANNEL_ID = 7;

interface AgoraTokenResponse {
  rtcToken?: string | null;
  error?: string;
}

async function requestRtcToken(channelName: string, uid: number): Promise<string | null> {
  const response = await fetch(`/api/agora-token?channelName=${encodeURIComponent(channelName)}&uid=${uid}`);
  if (!response.ok) throw new Error(`Помилка сервера токенів (статус ${response.status}).`);
  const data = (await response.json()) as AgoraTokenResponse;
  if (data.error) throw new Error(data.error);
  return data.rtcToken ?? null;
}

function RoomInner({ channelName, onLeave, userName, userRole = 'student' }: LessonRoomProps) {
  const isTeacher = userRole === 'teacher';

  // Controls & States
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({});
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus'>('focus');

  // Sidebars & Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // NEW: additional panels
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

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

  // NEW: kicked flag (shown briefly before leave fires)
  const [kickedNotice, setKickedNotice] = useState(false);
  const [forceMutedNotice, setForceMutedNotice] = useState(false);

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

  // NEW: reactions state (flying emojis)
  const [reactions, setReactions] = useState<FlyingReaction[]>([]);

  // NEW: poll state
  const [currentPoll, setCurrentPoll] = useState<PollData | null>(null);
  const [hasVotedPollId, setHasVotedPollId] = useState<string | null>(null);
  const pollVotesRef = useRef<Record<string, Set<string | number>>>({}); // pollId -> voter uids (teacher-side dedupe)

  // NEW: timer state
  const [timerDuration, setTimerDuration] = useState(0); // seconds, total
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // NEW: uid -> {name, role} directory, built from broadcast PROFILE messages
  const [participantProfiles, setParticipantProfiles] = useState<
    Record<string, { name: string; role: 'teacher' | 'student' }>
  >({});

  // NEW: per-participant forced-mute (cooperative) flag, only relevant for local mic
  const [isForceMuted, setIsForceMuted] = useState(false);

  // Tracks & Refs
  const [localMicrophoneTrack, setLocalMicrophoneTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localCameraTrack, setLocalCameraTrack] = useState<ICameraVideoTrack | null>(null);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);

  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const camTrackRef = useRef<ICameraVideoTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const screenClientRef = useRef<IAgoraRTCClient | null>(null);
  const dataChannelRef = useRef<ILocalDataChannel | null>(null);
  const remoteDataChannelsRef = useRef<IRemoteDataChannel[]>([]);
  const isUnmountedRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const client = useRTCClient();
  const remoteUsers = useRemoteUsers();

  const uid = useMemo(() => generateUid(userName), [userName]);
  const safeChannel = useMemo(() => String(channelName), [channelName]);
  const userInitials = useMemo(() => getInitials(userName), [userName]);

  const stopScreenShare = useCallback(async () => {
    const track = screenTrackRef.current;
    const screenClient = screenClientRef.current;
    screenTrackRef.current = null;
    screenClientRef.current = null;
    if (!isUnmountedRef.current) {
      setScreenTrack(null);
      setScreenSharing(false);
    }
    if (track) {
      track.removeAllListeners();
      if (screenClient?.connectionState === 'CONNECTED') {
        try { await screenClient.unpublish(track); } catch (error) { console.warn('[Agora] Error unpublishing screen track:', error); }
      }
      track.close();
    }
    if (screenClient) {
      screenClient.removeAllListeners();
      if (screenClient.connectionState !== 'DISCONNECTED') {
        try { await screenClient.leave(); } catch (error) { console.warn('[Agora] Error leaving screen client:', error); }
      }
    }
  }, []);

  // NEW: virtual background hook, driven off the local camera track
  const {
    mode: vbMode,
    isLoading: vbLoading,
    error: vbError,
    applyBlur,
    applyImage,
    disableVB,
  } = useVirtualBackground(localCameraTrack);

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // NEW: generic broadcast helper (data stream), reused by chat/reactions/polls/timer/moderation
  const broadcast = useCallback(
    async (payload: Record<string, any>) => {
      if (!client || client.connectionState !== 'CONNECTED') return;
      try {
        const bytes = new TextEncoder().encode(JSON.stringify(payload));
        const channel = dataChannelRef.current;
        if (channel?.readyState === 'open') {
          // Slice prevents a larger backing buffer from being sent by some browsers.
          channel.send(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
          return;
        }

        // Compatibility fallback for projects that still expose Agora's legacy
        // stream-message API. This keeps chat working while the data channel is
        // unavailable, without affecting media initialization.
        const legacyClient = client as unknown as {
          sendStreamMessage?: (message: Uint8Array) => Promise<void>;
        };
        if (legacyClient.sendStreamMessage) {
          await legacyClient.sendStreamMessage(bytes);
        }
      } catch (err) {
        console.warn('[Agora] Broadcast warning:', err, payload);
      }
    },
    [client]
  );

  // NEW: announce our own name/role so remote peers can label us correctly
  const announceProfile = useCallback(() => {
    broadcast({ type: 'PROFILE', uid, name: userName || 'Учасник', role: userRole });
  }, [broadcast, uid, userName, userRole]);

  // 1. Fetch token & Join channel
  useEffect(() => {
    let isMounted = true;

    async function initAndJoin() {
      isUnmountedRef.current = false;
      try {
        setTokenError(null);
        setCameraError(null);

        // Disable background stats log upload to prevent ERR_BLOCKED_BY_CLIENT console logs from AdBlockers
        try {
          AgoraRTC.disableLogUpload();
        } catch (e) {}

        console.log('[Agora Token] Requesting token for channel:', safeChannel, 'UID:', uid);
        const fetchedToken = await requestRtcToken(safeChannel, uid);
        if (!isMounted) return;
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

        // Optional data channel: interactive controls use it when the Agora project
        // supports it, but a failure here must never block camera or microphone.
        try {
          dataChannelRef.current = await client.publish({
            id: CLASSROOM_DATA_CHANNEL_ID,
            ordered: true,
            metadata: 'novaflow-classroom-v1',
          });
        } catch (error) {
          console.warn('[Agora] Classroom data channel is unavailable:', error);
        }

        // Let everyone know who we are once the optional signaling channel is ready.
        announceProfile();
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
      isUnmountedRef.current = true;
      setIsConnected(false);

      if (micTrackRef.current) {
        micTrackRef.current.close();
        micTrackRef.current = null;
      }
      if (camTrackRef.current) {
        camTrackRef.current.close();
        camTrackRef.current = null;
      }
      void stopScreenShare();
      dataChannelRef.current = null;
      remoteDataChannelsRef.current.forEach((channel) => channel.removeAllListeners());
      remoteDataChannelsRef.current = [];
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      client.removeAllListeners();
      client.leave().catch((leaveErr) => {
        console.warn('[Agora] Error leaving channel on unmount:', leaveErr);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, safeChannel, stopScreenShare, uid]);

  // 2. Event Listeners (Volume, Quality, Chat/Reactions/Polls/Timer/Moderation, Presence)
  useEffect(() => {
    if (!client) return;

    try {
      client.enableAudioVolumeIndicator();
    } catch (e) {}

    const handleUserPublished = async (
      user: any,
      mediaType: 'video' | 'audio' | 'datachannel',
      config?: { id: number }
    ) => {
      try {
        if (mediaType === 'datachannel') {
          const remoteChannel = await client.subscribe(
            user,
            'datachannel',
            config?.id ?? CLASSROOM_DATA_CHANNEL_ID
          ) as IRemoteDataChannel;
          remoteDataChannelsRef.current.push(remoteChannel);
          remoteChannel.on('message', (data: ArrayBuffer) => handleStreamMessage(user.uid, new Uint8Array(data)));
          remoteChannel.on('close', () => {
            remoteDataChannelsRef.current = remoteDataChannelsRef.current.filter((item) => item !== remoteChannel);
          });
          announceProfile();
          return;
        }
        await client.subscribe(user, mediaType);
      } catch (err) {
        console.error('[Agora] Subscribe error:', err);
      }
    };

    // NEW: re-announce our profile whenever someone new joins, so late joiners
    // (or peers who missed our first announcement) learn our name/role too.
    const handleUserJoined = () => {
      announceProfile();
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

        switch (parsed.type) {
          case 'CHAT_MSG': {
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
            break;
          }

          case 'HAND_RAISE': {
            setRaisedHands((previous) => ({ ...previous, [String(parsed.uid)]: Boolean(parsed.raised) }));
            break;
          }

          // NEW: profile directory (name/role) for remote uids
          case 'PROFILE': {
            setParticipantProfiles((prev) => ({
              ...prev,
              [String(parsed.uid)]: { name: parsed.name, role: parsed.role },
            }));
            break;
          }

          // NEW: someone sent a reaction emoji
          case 'REACTION': {
            const reactionId = `${parsed.uid}-${Date.now()}-${Math.random()}`;
            setReactions((prev) => [
              ...prev,
              { id: reactionId, emoji: parsed.emoji, x: 10 + Math.random() * 80 },
            ]);
            // auto-remove after animation finishes (~2.6s)
            setTimeout(() => {
              setReactions((prev) => prev.filter((r) => r.id !== reactionId));
            }, 2700);
            break;
          }

          // NEW: teacher started a poll
          case 'POLL_CREATE': {
            setCurrentPoll({
              id: parsed.pollId,
              question: parsed.question,
              options: parsed.options,
              counts: new Array(parsed.options.length).fill(0),
              totalVotes: 0,
              isActive: true,
            });
            setHasVotedPollId(null);
            pollVotesRef.current[parsed.pollId] = new Set();
            break;
          }

          // NEW: a vote came in — only the teacher's client aggregates & rebroadcasts results
          case 'POLL_VOTE': {
            if (!isTeacher) break;
            const { pollId, optionIndex, voterUid } = parsed;
            const votedSet = pollVotesRef.current[pollId] || new Set();
            if (votedSet.has(voterUid)) break; // ignore duplicate votes
            votedSet.add(voterUid);
            pollVotesRef.current[pollId] = votedSet;

            setCurrentPoll((prev) => {
              if (!prev || prev.id !== pollId) return prev;
              const counts = [...prev.counts];
              counts[optionIndex] = (counts[optionIndex] || 0) + 1;
              const updated = { ...prev, counts, totalVotes: prev.totalVotes + 1 };
              broadcast({ type: 'POLL_RESULTS', pollId, counts: updated.counts, totalVotes: updated.totalVotes });
              return updated;
            });
            break;
          }

          // NEW: live result sync (received by students)
          case 'POLL_RESULTS': {
            setCurrentPoll((prev) => {
              if (!prev || prev.id !== parsed.pollId) return prev;
              return { ...prev, counts: parsed.counts, totalVotes: parsed.totalVotes };
            });
            break;
          }

          // NEW: teacher ended the poll
          case 'POLL_END': {
            setCurrentPoll(null);
            setHasVotedPollId(null);
            break;
          }

          // NEW: timer sync from teacher
          case 'TIMER_UPDATE': {
            setTimerDuration(parsed.duration);
            setTimerRemaining(parsed.remainingSeconds);
            setTimerRunning(parsed.isRunning);
            break;
          }

          // NEW: teacher muted everyone — cooperative local mute
          case 'MUTE_ALL': {
            if (isTeacher) break; // teacher doesn't mute itself via this
            if (micTrackRef.current) {
              micTrackRef.current.setMuted(true).catch(() => {});
            }
            setMicMuted(true);
            setIsForceMuted(true);
            setForceMutedNotice(true);
            setTimeout(() => setForceMutedNotice(false), 4000);
            break;
          }

          // NEW: teacher muted a specific participant
          case 'MUTE_USER': {
            if (parsed.targetUid !== uid) break;
            if (micTrackRef.current) {
              micTrackRef.current.setMuted(true).catch(() => {});
            }
            setMicMuted(true);
            setIsForceMuted(true);
            setForceMutedNotice(true);
            setTimeout(() => setForceMutedNotice(false), 4000);
            break;
          }

          // NEW: teacher removed a specific participant
          case 'KICK': {
            if (parsed.targetUid !== uid) break;
            setKickedNotice(true);
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('[Agora Chat] Error parsing incoming stream message:', err);
      }
    };

    client.on('user-published', handleUserPublished);
    client.on('user-joined', handleUserJoined);
    client.on('volume-indicator', handleVolumeIndicator);
    client.on('network-quality', handleNetworkQuality);
    client.on('stream-message', handleStreamMessage);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-joined', handleUserJoined);
      client.off('volume-indicator', handleVolumeIndicator);
      client.off('network-quality', handleNetworkQuality);
      client.off('stream-message', handleStreamMessage);
    };
  }, [client, uid, isTeacher, announceProfile, broadcast]);

  // NEW: once kicked, leave shortly after showing the notice
  useEffect(() => {
    if (!kickedNotice) return;
    const t = setTimeout(() => {
      handleLeave();
    }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kickedNotice]);

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
      try {
        const nextMuted = !micMuted;
        await micTrackRef.current.setMuted(nextMuted);
        setMicMuted(nextMuted);
        if (!nextMuted) setIsForceMuted(false);
      } catch (err) {
        console.error('[Agora] Error toggling mic:', err);
      }
    } else {
      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        micTrackRef.current = audioTrack;
        setLocalMicrophoneTrack(audioTrack);
        setMicMuted(false);
        setIsForceMuted(false);
        if (client && client.connectionState === 'CONNECTED') {
          await client.publish(audioTrack);
        }
      } catch (audioErr) {
        console.error('[Agora] Microphone creation error:', audioErr);
      }
    }
  }, [micMuted, client]);

  const handleCameraToggle = useCallback(async () => {
    if (camTrackRef.current) {
      try {
        const nextOff = !cameraOff;
        await camTrackRef.current.setMuted(nextOff);
        setCameraOff(nextOff);
      } catch (err) {
        console.error('[Agora] Error toggling camera:', err);
      }
    } else {
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
    if (screenTrackRef.current || screenClientRef.current) {
      await stopScreenShare();
      return;
    }
    if (client.connectionState !== 'CONNECTED') return;

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
    if (!appId) {
      setTokenError('NEXT_PUBLIC_AGORA_APP_ID environment variable is missing');
      return;
    }

    const screenUid = uid + SCREEN_UID_OFFSET;
    const screenClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    screenClientRef.current = screenClient;
    try {
      const screenToken = await requestRtcToken(safeChannel, screenUid);
      if (isUnmountedRef.current || screenClientRef.current !== screenClient) return;
      await screenClient.join(appId, safeChannel, screenToken, screenUid);
      if (isUnmountedRef.current || screenClientRef.current !== screenClient) {
        await screenClient.leave();
        return;
      }
      const screenVideoTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');
      if (isUnmountedRef.current || screenClientRef.current !== screenClient) {
        screenVideoTrack.close();
        await screenClient.leave();
        return;
      }
      screenTrackRef.current = screenVideoTrack;
      await screenClient.publish(screenVideoTrack);
      setScreenTrack(screenVideoTrack);
      setScreenSharing(true);
      screenVideoTrack.on('track-ended', () => { void stopScreenShare(); });
    } catch (error) {
      console.warn('[Agora] Screen share cancelled or failed:', error);
      if (screenClientRef.current === screenClient) await stopScreenShare();
      else if (screenClient.connectionState !== 'DISCONNECTED') await screenClient.leave();
    }
  }, [client, safeChannel, stopScreenShare, uid]);

  const handleRaiseHandToggle = useCallback(() => {
    setHandRaised((previous) => {
      const raised = !previous;
      broadcast({ type: 'HAND_RAISE', uid, raised });
      return raised;
    });
  }, [broadcast, uid]);

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

      broadcast({
        type: 'CHAT_MSG',
        id: msgId,
        sender: userName || 'Користувач',
        text: textToSend,
        time: timeStr,
      });
    },
    [inputMessage, userName, broadcast]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  }, []);

  // NEW: reactions
  const handleSendReaction = useCallback(
    (emoji: string) => {
      const reactionId = `${uid}-${Date.now()}-${Math.random()}`;
      setReactions((prev) => [...prev, { id: reactionId, emoji, x: 10 + Math.random() * 80 }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reactionId));
      }, 2700);
      broadcast({ type: 'REACTION', uid, emoji });
    },
    [uid, broadcast]
  );

  // NEW: polling (teacher creates/ends, everyone can vote if not teacher)
  const handleCreatePoll = useCallback(
    (question: string, options: string[]) => {
      const pollId = `${Date.now()}`;
      pollVotesRef.current[pollId] = new Set();
      const poll: PollData = {
        id: pollId,
        question,
        options,
        counts: new Array(options.length).fill(0),
        totalVotes: 0,
        isActive: true,
      };
      setCurrentPoll(poll);
      setHasVotedPollId(null);
      broadcast({ type: 'POLL_CREATE', pollId, question, options });
    },
    [broadcast]
  );

  const handleVotePoll = useCallback(
    (optionIndex: number) => {
      if (!currentPoll || hasVotedPollId === currentPoll.id) return;
      setHasVotedPollId(currentPoll.id);
      // optimistic local bump so the voter sees immediate feedback
      setCurrentPoll((prev) => {
        if (!prev) return prev;
        const counts = [...prev.counts];
        counts[optionIndex] = (counts[optionIndex] || 0) + 1;
        return { ...prev, counts, totalVotes: prev.totalVotes + 1 };
      });
      broadcast({ type: 'POLL_VOTE', pollId: currentPoll.id, optionIndex, voterUid: uid });
    },
    [currentPoll, hasVotedPollId, uid, broadcast]
  );

  const handleEndPoll = useCallback(() => {
    if (!currentPoll) return;
    broadcast({ type: 'POLL_END', pollId: currentPoll.id });
    setCurrentPoll(null);
    setHasVotedPollId(null);
  }, [currentPoll, broadcast]);

  // NEW: lesson timer (teacher-controlled, synced every tick via broadcast)
  const tickTimer = useCallback(() => {
    setTimerRemaining((prev) => {
      const next = Math.max(prev - 1, 0);
      broadcast({ type: 'TIMER_UPDATE', duration: timerDuration, remainingSeconds: next, isRunning: next > 0 });
      if (next === 0 && timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setTimerRunning(false);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcast, timerDuration]);

  const handleStartTimer = useCallback(
    (durationMinutes: number) => {
      const durationSeconds = durationMinutes * 60;
      setTimerDuration(durationSeconds);
      setTimerRemaining(durationSeconds);
      setTimerRunning(true);
      broadcast({ type: 'TIMER_UPDATE', duration: durationSeconds, remainingSeconds: durationSeconds, isRunning: true });

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(tickTimer, 1000);
    },
    [broadcast, tickTimer]
  );

  const handlePauseResumeTimer = useCallback(() => {
    setTimerRunning((prevRunning) => {
      const nextRunning = !prevRunning;
      if (nextRunning) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(tickTimer, 1000);
      } else if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      broadcast({ type: 'TIMER_UPDATE', duration: timerDuration, remainingSeconds: timerRemaining, isRunning: nextRunning });
      return nextRunning;
    });
  }, [tickTimer, broadcast, timerDuration, timerRemaining]);

  const handleResetTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerRunning(false);
    setTimerRemaining(0);
    setTimerDuration(0);
    broadcast({ type: 'TIMER_UPDATE', duration: 0, remainingSeconds: 0, isRunning: false });
  }, [broadcast]);

  // NEW: teacher moderation — mute all / mute one / kick one
  const handleMuteAll = useCallback(() => {
    broadcast({ type: 'MUTE_ALL' });
  }, [broadcast]);

  const handleMuteUser = useCallback(
    (targetUid: number | string) => {
      broadcast({ type: 'MUTE_USER', targetUid });
    },
    [broadcast]
  );

  const handleKickUser = useCallback(
    (targetUid: number | string) => {
      broadcast({ type: 'KICK', targetUid });
    },
    [broadcast]
  );

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
    await stopScreenShare();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    client.removeAllListeners();
    try {
      await client.leave();
    } catch (e) {}
    onLeave();
  }, [client, onLeave, stopScreenShare]);

  // NEW: build the participant list for the ParticipantsPanel (local + remote)
  const participantList: ParticipantInfo[] = useMemo(() => {
    const list: ParticipantInfo[] = [
      {
        uid,
        name: userName || 'Ви',
        isLocal: true,
        isMuted: micMuted,
        isTeacher,
      },
    ];
    remoteUsers.forEach((ru) => {
      const profile = participantProfiles[String(ru.uid)];
      list.push({
        uid: ru.uid,
        name: profile?.name || `Учасник ${ru.uid}`,
        isLocal: false,
        isMuted: !ru.hasAudio,
        isTeacher: profile?.role === 'teacher',
        isHandRaised: Boolean(raisedHands[String(ru.uid)]),
      });
    });
    return list;
  }, [uid, userName, micMuted, isTeacher, remoteUsers, participantProfiles, raisedHands]);

  const raisedHandParticipants = remoteUsers
    .filter((remoteUser) => raisedHands[String(remoteUser.uid)])
    .map((remoteUser) => ({
      uid: remoteUser.uid,
      name: participantProfiles[String(remoteUser.uid)]?.name || `Учасник ${remoteUser.uid}`,
    }));

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
        isTeacher={isTeacher}
      />

      {/* NEW: Lesson timer, floating top-center under the header */}
      {(timerRemaining > 0 || timerRunning || isTeacher) && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40">
          <LessonTimer
            isTeacher={isTeacher}
            remainingSeconds={timerRemaining}
            isRunning={timerRunning}
            onStart={handleStartTimer}
            onPauseResume={handlePauseResumeTimer}
            onReset={handleResetTimer}
          />
        </div>
      )}

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

      {raisedHandParticipants.length > 0 && (
        <div className="absolute top-20 right-5 z-40 flex max-w-sm flex-col gap-2">
          {raisedHandParticipants.map((participant) => (
            <div key={String(participant.uid)} className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-100 shadow-xl backdrop-blur-xl">
              ✋ {participant.name} підняв(-ла) руку
            </div>
          ))}
        </div>
      )}

      {/* NEW: Forced-mute notice */}
      {forceMutedNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-xl border border-white/10 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="text-xl">🔇</span>
          <span className="text-xs sm:text-sm font-semibold">Вчитель вимкнув ваш мікрофон</span>
        </div>
      )}

      {/* NEW: Kicked notice */}
      {kickedNotice && (
        <div className="absolute inset-0 z-[200] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center space-y-2">
            <span className="text-4xl">🚪</span>
            <p className="text-lg font-semibold">Вас видалено з кімнати вчителем</p>
            <p className="text-sm text-zinc-400">Ви покидаєте урок…</p>
          </div>
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
        participantProfiles={participantProfiles}
      />

      {/* NEW: Reactions layer + picker */}
      <ReactionsOverlay reactions={reactions} onSendReaction={handleSendReaction} />

      {/* NEW: Virtual background control (draggable widget) */}
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
        isChatOpen={isChatOpen}
        onToggleChat={toggleChat}
        chatMessages={chatMessages}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        onSendMessage={handleSendMessage}
        chatBottomRef={chatBottomRef}
      />

      {/* NEW: Poll panel */}
      <PollWidget
        isOpen={isPollOpen}
        onClose={() => setIsPollOpen(false)}
        isTeacher={isTeacher}
        currentPoll={currentPoll}
        hasVoted={hasVotedPollId === currentPoll?.id}
        onCreatePoll={handleCreatePoll}
        onVote={handleVotePoll}
        onEndPoll={handleEndPoll}
      />

      {/* NEW: Participants / moderation panel */}
      <ParticipantsPanel
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        participants={participantList}
        isTeacher={isTeacher}
        onMuteAll={handleMuteAll}
        onMuteUser={handleMuteUser}
        onKickUser={handleKickUser}
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
        // NEW props — see integration note if LessonRoomFloatingControls doesn't
        // yet render buttons for these; you can also trigger them from anywhere
        // else in the UI since the state setters are simple booleans.
        isPollOpen={isPollOpen}
        onTogglePoll={() => setIsPollOpen((p) => !p)}
        hasActivePoll={!!currentPoll}
        isParticipantsOpen={isParticipantsOpen}
        onToggleParticipants={() => setIsParticipantsOpen((p) => !p)}
        participantsCount={participantList.length}
        isTeacher={isTeacher}
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
