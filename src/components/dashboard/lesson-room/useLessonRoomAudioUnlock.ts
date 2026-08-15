'use client';

import { useEffect } from 'react';
import AgoraRTC, { IAgoraRTCRemoteUser } from 'agora-rtc-react';
import { isScreenShareUser } from './utils';

/**
 * Resumes Agora RTC AudioContext if suspended (Autoplay restriction bypass)
 */
export async function resumeAgoraAudioContext() {
  try {
    const audioCtx = (AgoraRTC as any).audioContext || (AgoraRTC as any).getAudioContext?.();
    if (audioCtx && audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
  } catch (e) {
    console.warn('[Agora Audio] Failed to resume AudioContext:', e);
  }
}

export function useLessonRoomAudioUnlock(remoteUsers: IAgoraRTCRemoteUser[]) {
  useEffect(() => {
    const handleUnlockAudio = async () => {
      await resumeAgoraAudioContext();

      remoteUsers.forEach((remoteUser) => {
        if (remoteUser.hasAudio && remoteUser.audioTrack && !isScreenShareUser(remoteUser.uid)) {
          try {
            remoteUser.audioTrack.setVolume?.(100);
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
    window.addEventListener('pointerdown', handleUnlockAudio);

    // Immediate attempt
    handleUnlockAudio();

    return () => {
      window.removeEventListener('click', handleUnlockAudio);
      window.removeEventListener('touchstart', handleUnlockAudio);
      window.removeEventListener('keydown', handleUnlockAudio);
      window.removeEventListener('pointerdown', handleUnlockAudio);
    };
  }, [remoteUsers]);
}
