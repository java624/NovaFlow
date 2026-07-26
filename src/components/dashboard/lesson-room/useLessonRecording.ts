'use client';

import { useState, useRef, useCallback } from 'react';

interface RecordingState {
  isRecording: boolean;
  durationSec: number;
  error: string | null;
}

interface UseLessonRecordingReturn extends RecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
}

/**
 * Custom hook for local lesson recording using browser MediaRecorder & Web Audio API.
 * Mixes: screen audio + teacher mic + remote participants' audio.
 * Only intended for teacher role.
 */
export function useLessonRecording(
  remoteAudioTracks: MediaStreamTrack[],
  onSaveComplete?: (blob: Blob) => void
): UseLessonRecordingReturn {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    durationSec: 0,
    error: null,
  });

  // Refs to manage lifecycle
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const stopMediaTracks = useCallback(() => {
    // Stop display stream
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((t) => t.stop());
      displayStreamRef.current = null;
    }
    // Stop mic stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null, isRecording: false }));

      // 1. Request screen capture with system audio
      let displayStream: MediaStream;
      try {
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 15 },
          audio: true,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: 'Доступ до екрана не надано або не підтримується браузером.',
        }));
        return;
      }
      displayStreamRef.current = displayStream;

      // If user cancels the screen picker, displayStream may have no tracks
      if (displayStream.getVideoTracks().length === 0) {
        displayStream.getTracks().forEach((t) => t.stop());
        displayStreamRef.current = null;
        return;
      }

      // 2. Get teacher's microphone
      let micStream: MediaStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        // If mic fails, continue without mic — screen audio is enough
        micStream = new MediaStream();
      }
      micStreamRef.current = micStream;

      // 3. Mix all audio sources into one track using Web Audio API
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const dest = audioContext.createMediaStreamDestination();

      // Helper to connect a MediaStream to the destination
      const connectStream = (stream: MediaStream) => {
        stream.getAudioTracks().forEach((track) => {
          if (track.enabled && track.readyState === 'live') {
            const source = audioContext.createMediaStreamSource(
              new MediaStream([track])
            );
            const gain = audioContext.createGain();
            gain.gain.value = 1.0;
            source.connect(gain);
            gain.connect(dest);
          }
        });
      };

      // Connect display audio (system sounds from screen share)
      connectStream(displayStream);

      // Connect teacher's mic
      connectStream(micStream);

      // Connect remote participants' audio tracks
      remoteAudioTracks.forEach((track) => {
        if (track && track.readyState === 'live' && track.enabled) {
          try {
            const source = audioContext.createMediaStreamSource(
              new MediaStream([track])
            );
            const gain = audioContext.createGain();
            gain.gain.value = 1.0;
            source.connect(gain);
            gain.connect(dest);
          } catch {
            // skip problematic tracks
          }
        }
      });

      // 4. Combine screen video + mixed audio
      const screenVideoTrack = displayStream.getVideoTracks()[0];
      const finalStream = new MediaStream([
        screenVideoTrack,
        ...dest.stream.getAudioTracks(),
      ]);

      // 5. Initialize MediaRecorder
      chunksRef.current = [];
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const recorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: 2_000_000, // 2 Mbps
      });

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onerror = () => {
        setState((prev) => ({
          ...prev,
          error: 'Помилка під час запису. Спробуйте ще раз.',
          isRecording: false,
        }));
        stopMediaTracks();
        clearDurationTimer();
      };

      recorder.onstop = () => {
        // Reconstruct blob
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        clearDurationTimer();
        setState((prev) => ({ ...prev, isRecording: false, durationSec: 0 }));
        stopMediaTracks();
        if (onSaveComplete) {
          onSaveComplete(blob);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // collect data every 1s

      // 6. Start duration timer
      startTimeRef.current = Date.now();
      clearDurationTimer();
      durationIntervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          durationSec: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }));
      }, 1000);

      setState((prev) => ({ ...prev, isRecording: true, durationSec: 0 }));

      // Handle user stopping screen share via browser UI button
      screenVideoTrack.onended = () => {
        // If screen share stops unexpectedly, stop the recording
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };
    } catch (err: any) {
      console.error('[Recording] Failed to start:', err);
      setState((prev) => ({
        ...prev,
        error: err?.message || 'Не вдалося розпочати запис.',
        isRecording: false,
      }));
      stopMediaTracks();
    }
  }, [remoteAudioTracks, stopMediaTracks, clearDurationTimer, onSaveComplete]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      // If recorder is not running, clean up and resolve null
      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state !== 'recording'
      ) {
        stopMediaTracks();
        clearDurationTimer();
        setState((prev) => ({ ...prev, isRecording: false, durationSec: 0 }));
        resolve(null);
        return;
      }

      // Override onstop to resolve with the blob
      const originalOnStop = mediaRecorderRef.current.onstop;
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || 'video/webm',
        });
        chunksRef.current = [];
        clearDurationTimer();
        setState((prev) => ({ ...prev, isRecording: false, durationSec: 0 }));
        stopMediaTracks();
        if (originalOnStop) {
          (originalOnStop as () => void)();
        }
        if (onSaveComplete) {
          onSaveComplete(blob);
        }
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [stopMediaTracks, clearDurationTimer, onSaveComplete]);

  return {
    isRecording: state.isRecording,
    durationSec: state.durationSec,
    error: state.error,
    startRecording,
    stopRecording,
  };
}