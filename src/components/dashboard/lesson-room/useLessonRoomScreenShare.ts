'use client';

import { useState, useRef, useCallback } from 'react';
import AgoraRTC, { ILocalVideoTrack, IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-react';
import { SCREEN_UID_OFFSET } from './utils';

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

interface UseLessonRoomScreenShareProps {
  client: IAgoraRTCClient;
  uid: number;
  safeChannel: string;
  micMuted: boolean;
  micTrackRef: React.MutableRefObject<IMicrophoneAudioTrack | null>;
  isUnmountedRef: React.MutableRefObject<boolean>;
  setTokenError: (err: string | null) => void;
}

export function useLessonRoomScreenShare({
  client,
  uid,
  safeChannel,
  micMuted,
  micTrackRef,
  isUnmountedRef,
  setTokenError,
}: UseLessonRoomScreenShareProps) {
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);

  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const screenClientRef = useRef<IAgoraRTCClient | null>(null);

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
        try { await screenClient.unpublish(track); } catch (e) {}
      }
      track.close();
    }
    if (screenClient) {
      screenClient.removeAllListeners();
      if (screenClient.connectionState !== 'DISCONNECTED') {
        try { await screenClient.leave(); } catch (e) {}
      }
    }
    if (micTrackRef.current && !micMuted) {
      try { await micTrackRef.current.setMuted(false); } catch (e) {}
    }
  }, [micMuted, isUnmountedRef, micTrackRef]);

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
    try { await screenClient.enableDualStream(); } catch (e) {}

    try {
      const screenToken = await requestRtcToken(safeChannel, screenUid);
      if (isUnmountedRef.current || screenClientRef.current !== screenClient) return;
      await screenClient.join(appId, safeChannel, screenToken, screenUid);
      if (isUnmountedRef.current || screenClientRef.current !== screenClient) {
        await screenClient.leave();
        return;
      }
      const screenVideoTrack = await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: { frameRate: 5, bitrateMax: 400 }, optimizationMode: 'detail' },
        'disable'
      );
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

      if (micTrackRef.current && !micMuted) {
        try { await micTrackRef.current.setMuted(false); } catch (e) {}
      }
    } catch (error) {
      if (screenClientRef.current === screenClient) await stopScreenShare();
      else if (screenClient.connectionState !== 'DISCONNECTED') await screenClient.leave();
    }
  }, [client, safeChannel, stopScreenShare, uid, isUnmountedRef, micTrackRef, micMuted, setTokenError]);

  return {
    screenSharing,
    screenTrack,
    screenTrackRef,
    screenClientRef,
    handleScreenShare,
    stopScreenShare,
  };
}
