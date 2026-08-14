'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import AgoraRTC, {
  useRTCClient,
  useRemoteUsers,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  IRemoteDataChannel,
} from 'agora-rtc-react';

import { generateUid, isScreenShareUser, requestRtcToken, CLASSROOM_DATA_CHANNEL_ID } from './utils';
import { useLessonRoomDevices } from './useLessonRoomDevices';
import { useLessonRoomScreenShare } from './useLessonRoomScreenShare';
import { useLessonRoomAudioUnlock } from './useLessonRoomAudioUnlock';
import { useLessonRoomAgoraEvents } from './useLessonRoomAgoraEvents';

interface UseLessonRoomAgoraProps {
  channelName: string;
  userName?: string;
  onLeave: () => void;
  announceProfile: () => void;
  handleStreamMessage: (remoteUid: any, data: any) => void;
  dataChannelRef: React.MutableRefObject<any>;
  remoteDataChannelsRef: React.MutableRefObject<IRemoteDataChannel[]>;
}

export function useLessonRoomAgora({
  channelName,
  userName,
  onLeave,
  announceProfile,
  handleStreamMessage,
  dataChannelRef,
  remoteDataChannelsRef,
}: UseLessonRoomAgoraProps) {
  const client = useRTCClient();
  const remoteUsers = useRemoteUsers();

  const uid = useMemo(() => generateUid(userName), [userName]);
  const safeChannel = useMemo(() => String(channelName), [channelName]);

  // States
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<number>(1);
  const [activeSpeakerUid, setActiveSpeakerUid] = useState<number | string | null>(null);

  // Connections & Errors
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Tracks & Refs
  const [localMicrophoneTrack, setLocalMicrophoneTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localCameraTrack, setLocalCameraTrack] = useState<ICameraVideoTrack | null>(null);

  const micTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const camTrackRef = useRef<ICameraVideoTrack | null>(null);
  const isUnmountedRef = useRef(false);

  // Modular Sub-hooks
  const devices = useLessonRoomDevices({ camTrackRef, micTrackRef });
  const screen = useLessonRoomScreenShare({
    client,
    uid,
    safeChannel,
    micMuted,
    micTrackRef,
    isUnmountedRef,
    setTokenError,
  });

  useLessonRoomAudioUnlock(remoteUsers);
  useLessonRoomAgoraEvents({
    client,
    uid,
    announceProfile,
    handleStreamMessage,
    remoteDataChannelsRef,
    setActiveSpeakerUid,
    setNetworkQuality,
  });

  // 1. Join & Initialize
  useEffect(() => {
    let isMounted = true;

    async function initAndJoin() {
      isUnmountedRef.current = false;
      try {
        setTokenError(null);
        setCameraError(null);
        setMicError(null);

        try { AgoraRTC.disableLogUpload(); } catch (e) {}

        const fetchedToken = await requestRtcToken(safeChannel, uid);
        if (!isMounted) return;
        setToken(fetchedToken);

        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
        if (!appId) {
          throw new Error('NEXT_PUBLIC_AGORA_APP_ID environment variable is missing');
        }

        await client.join(appId, safeChannel, fetchedToken, uid);
        if (!isMounted) {
          await client.leave();
          return;
        }

        setIsConnected(true);

        // Create local tracks
        const tracksToPublish: (IMicrophoneAudioTrack | ICameraVideoTrack)[] = [];

        // Audio track
        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            AEC: true,
            ANS: true,
            AGC: true,
          });
          if (!isMounted) {
            audioTrack.close();
            return;
          }
          try {
            audioTrack.setVolume(100);
            await audioTrack.setMuted(false);
          } catch (e) {}
          micTrackRef.current = audioTrack;
          setLocalMicrophoneTrack(audioTrack);
          tracksToPublish.push(audioTrack);
        } catch (audioErr) {
          console.error('[Agora] Microphone creation error:', audioErr);
          if (isMounted) {
            setMicError('Мікрофон недоступний або в браузері вимкнено дозвіл на аудіо');
          }
        }

        // Video track
        try {
          const videoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: { width: 640, height: 360, frameRate: 15, bitrateMax: 300 },
          });
          if (!isMounted) {
            videoTrack.close();
            return;
          }
          camTrackRef.current = videoTrack;
          setLocalCameraTrack(videoTrack);
          tracksToPublish.push(videoTrack);
        } catch (camErr: any) {
          console.warn('[Agora] Camera error:', camErr);
          if (isMounted) {
            setCameraError('Камера недоступна або зайнята іншим додатком');
            setCameraOff(true);
          }
        }

        // Publish media tracks atomically in a single WebRTC negotiation
        if (tracksToPublish.length > 0 && isMounted) {
          try {
            await client.publish(tracksToPublish);
          } catch (pubErr) {
            console.error('[Agora] Atomic track publish error:', pubErr);
          }
        }

        // Data channel
        try {
          dataChannelRef.current = await client.publish({
            id: CLASSROOM_DATA_CHANNEL_ID,
            ordered: true,
            metadata: 'novaflow-classroom-v1',
          });
        } catch (error) {
          console.warn('[Agora] Data channel error:', error);
        }

        announceProfile();
      } catch (err: any) {
        if (!isMounted) return;
        const errorMessage = err?.message || String(err);
        if (
          errorMessage.includes('dynamic use static key') ||
          errorMessage.includes('CAN_NOT_GET_GATEWAY_SERVER') ||
          err?.code === 'CAN_NOT_GET_GATEWAY_SERVER'
        ) {
          setTokenError('Ваш проєкт в Agora Console вимагає App Certificate. Вкажіть ключ у файлі .env.local');
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
      void screen.stopScreenShare();
      client.removeAllListeners();
      client.leave().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, safeChannel, uid]);

  const subscribingKeysRef = useRef<Set<string>>(new Set());

  // Synchronize subscriptions for existing remote users
  useEffect(() => {
    if (!client || client.connectionState !== 'CONNECTED') return;

    remoteUsers.forEach(async (remoteUser) => {
      if (remoteUser.hasVideo && !remoteUser.videoTrack) {
        const key = `${remoteUser.uid}-video`;
        if (!subscribingKeysRef.current.has(key)) {
          subscribingKeysRef.current.add(key);
          try { await client.subscribe(remoteUser, 'video'); } catch (e) {}
          finally { subscribingKeysRef.current.delete(key); }
        }
      }
      if (remoteUser.hasAudio && !isScreenShareUser(remoteUser.uid)) {
        if (!remoteUser.audioTrack) {
          const key = `${remoteUser.uid}-audio`;
          if (!subscribingKeysRef.current.has(key)) {
            subscribingKeysRef.current.add(key);
            try {
              const track = await client.subscribe(remoteUser, 'audio');
              (track as any)?.setVolume?.(100);
              (track as any)?.play();
            } catch (e) {}
            finally { subscribingKeysRef.current.delete(key); }
          }
        } else if (!remoteUser.audioTrack.isPlaying) {
          try {
            remoteUser.audioTrack.setVolume?.(100);
            remoteUser.audioTrack.play();
          } catch (e) {}
        }
      }
    });
  }, [remoteUsers, client, isConnected]);

  const handleMicToggle = useCallback(async () => {
    if (micTrackRef.current) {
      try {
        const nextMuted = !micMuted;
        await micTrackRef.current.setMuted(nextMuted);
        setMicMuted(nextMuted);
      } catch (err) {
        console.error('[Agora] Error toggling mic:', err);
      }
    } else {
      try {
        setMicError(null);
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true, AGC: true });
        try {
          audioTrack.setVolume(100);
          await audioTrack.setMuted(false);
        } catch (e) {}
        micTrackRef.current = audioTrack;
        setLocalMicrophoneTrack(audioTrack);
        setMicMuted(false);
        if (client && client.connectionState === 'CONNECTED') {
          await client.publish(audioTrack);
        }
      } catch (audioErr) {
        console.error('[Agora] Microphone creation error:', audioErr);
        setMicError('Не вдалося увімкнути мікрофон');
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
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: { width: 640, height: 360, frameRate: 15, bitrateMax: 300 },
        });
        camTrackRef.current = videoTrack;
        setLocalCameraTrack(videoTrack);
        setCameraOff(false);
        if (client && client.connectionState === 'CONNECTED') {
          await client.publish(videoTrack);
        }
      } catch (camErr: any) {
        setCameraError('Камера недоступна або зайнята іншим додатком');
        setCameraOff(true);
      }
    }
  }, [cameraOff, client]);

  const handleLeave = useCallback(async () => {
    if (micTrackRef.current) {
      micTrackRef.current.close();
      micTrackRef.current = null;
    }
    if (camTrackRef.current) {
      camTrackRef.current.close();
      camTrackRef.current = null;
    }
    await screen.stopScreenShare();
    client.removeAllListeners();
    try { await client.leave(); } catch (e) {}
    onLeave();
  }, [client, onLeave, screen]);

  return {
    client,
    remoteUsers,
    uid,
    safeChannel,
    micMuted,
    setMicMuted,
    cameraOff,
    screenSharing: screen.screenSharing,
    networkQuality,
    activeSpeakerUid,
    cameras: devices.cameras,
    microphones: devices.microphones,
    speakers: devices.speakers,
    selectedCamId: devices.selectedCamId,
    selectedMicId: devices.selectedMicId,
    selectedSpeakerId: devices.selectedSpeakerId,
    tokenError,
    cameraError,
    micError,
    setMicError,
    isConnected,
    localMicrophoneTrack,
    localCameraTrack,
    screenTrack: screen.screenTrack,
    micTrackRef,
    camTrackRef,
    refreshDevices: devices.refreshDevices,
    handleDeviceChange: devices.handleDeviceChange,
    handleMicToggle,
    handleCameraToggle,
    handleScreenShare: screen.handleScreenShare,
    stopScreenShare: screen.stopScreenShare,
    handleLeave,
  };
}
