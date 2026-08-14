'use client';

import React, { useEffect, useRef } from 'react';
import { IAgoraRTCRemoteUser } from 'agora-rtc-react';
import { isScreenShareUser } from './utils';

interface RemoteAudioStreamPlayerProps {
  user: IAgoraRTCRemoteUser;
}

export default function RemoteAudioStreamPlayer({ user }: RemoteAudioStreamPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isScreenShareUser(user.uid) || !user.hasAudio || !user.audioTrack) return;

    const audioTrack = user.audioTrack;

    // 1. Agora SDK play call
    try {
      audioTrack.setVolume?.(100);
      if (!audioTrack.isPlaying) {
        audioTrack.play();
      }
    } catch (e) {
      console.warn('[Agora Audio] Track play warning for user:', user.uid, e);
    }

    // 2. Native HTML5 Audio Element fallback attachment
    const audioEl = audioRef.current;
    if (audioEl) {
      try {
        const mediaStreamTrack = audioTrack.getMediaStreamTrack();
        if (mediaStreamTrack) {
          const stream = new MediaStream([mediaStreamTrack]);
          if (audioEl.srcObject !== stream) {
            audioEl.srcObject = stream;
            audioEl.volume = 1.0;
            audioEl.play().catch((err) => {
              console.warn('[Native Audio] Play warning for user:', user.uid, err);
            });
          }
        }
      } catch (err) {
        console.warn('[Native Audio] Attachment error for user:', user.uid, err);
      }
    }

    // 3. Autoplay unlock listeners
    const handleGesture = () => {
      if (user.audioTrack && !user.audioTrack.isPlaying) {
        try { user.audioTrack.play(); } catch (e) {}
      }
      if (audioEl && audioEl.paused) {
        audioEl.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    window.addEventListener('keydown', handleGesture);

    const interval = setInterval(handleGesture, 1500);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      clearInterval(interval);
    };
  }, [user, user.uid, user.hasAudio, user.audioTrack]);

  if (isScreenShareUser(user.uid) || !user.hasAudio) return null;

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      className="sr-only"
      aria-hidden="true"
    />
  );
}
