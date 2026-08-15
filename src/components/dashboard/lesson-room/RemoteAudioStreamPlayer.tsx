'use client';

import React, { useEffect, useRef } from 'react';
import { IAgoraRTCRemoteUser } from 'agora-rtc-react';
import { isScreenShareUser } from './utils';

interface RemoteAudioStreamPlayerProps {
  user: IAgoraRTCRemoteUser;
  selectedSpeakerId?: string;
}

export default function RemoteAudioStreamPlayer({
  user,
  selectedSpeakerId,
}: RemoteAudioStreamPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isScreenShareUser(user.uid) || !user.hasAudio || !user.audioTrack) return;

    const audioTrack = user.audioTrack;

    // 1. Agora SDK play call & playback device set
    try {
      audioTrack.setVolume?.(100);
      if (selectedSpeakerId && (audioTrack as any).setPlaybackDevice) {
        (audioTrack as any).setPlaybackDevice(selectedSpeakerId).catch(() => {});
      }
      if (!audioTrack.isPlaying) {
        audioTrack.play();
      }
    } catch (e) {
      console.warn('[Agora Audio] Track play warning for user:', user.uid, e);
    }

    // 2. Native HTML5 Audio Element fallback attachment (only update srcObject if track ID changed)
    const audioEl = audioRef.current;
    if (audioEl) {
      try {
        if (selectedSpeakerId && (audioEl as any).setSinkId) {
          (audioEl as any).setSinkId(selectedSpeakerId).catch(() => {});
        }
        const mediaStreamTrack = audioTrack.getMediaStreamTrack();
        if (mediaStreamTrack) {
          const currentStream = audioEl.srcObject as MediaStream | null;
          const currentTrack = currentStream?.getAudioTracks()?.[0];
          if (!currentTrack || currentTrack.id !== mediaStreamTrack.id) {
            const stream = new MediaStream([mediaStreamTrack]);
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
      if (user.audioTrack) {
        try {
          user.audioTrack.setVolume?.(100);
          if (!user.audioTrack.isPlaying) {
            user.audioTrack.play();
          }
        } catch (e) {}
      }
      if (audioEl && audioEl.paused) {
        audioEl.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    window.addEventListener('keydown', handleGesture);
    window.addEventListener('pointerdown', handleGesture);

    const interval = setInterval(handleGesture, 1500);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
      clearInterval(interval);
    };
  }, [user, user.uid, user.hasAudio, user.audioTrack, selectedSpeakerId]);

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
