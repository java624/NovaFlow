'use client';

import { useEffect } from 'react';
import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-react';
import { isScreenShareUser } from './utils';

export function useLessonRoomAudioUnlock(remoteUsers: IAgoraRTCRemoteUser[]) {
  useEffect(() => {
    const handleUnlockAudio = async () => {
      try {
        const audioCtx = (AgoraRTC as any).getAudioContext?.();
        if (audioCtx && audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
      } catch (e) {}

      remoteUsers.forEach((remoteUser) => {
        if (remoteUser.hasAudio && remoteUser.audioTrack && !isScreenShareUser(remoteUser.uid)) {
          try {
            if (!remoteUser.audioTrack.isPlaying) {
              remoteUser.audioTrack.play();
            }
          } catch (err) {}
        }
      });
    };
    window.addEventListener('click', handleUnlockAudio);
    window.addEventListener('touchstart', handleUnlockAudio);
    window.addEventListener('keydown', handleUnlockAudio);
    return () => {
      window.removeEventListener('click', handleUnlockAudio);
      window.removeEventListener('touchstart', handleUnlockAudio);
      window.removeEventListener('keydown', handleUnlockAudio);
    };
  }, [remoteUsers]);
}
