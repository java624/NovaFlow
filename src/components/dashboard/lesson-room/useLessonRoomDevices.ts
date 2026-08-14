'use client';

import { useState, useCallback } from 'react';
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-react';

interface UseLessonRoomDevicesProps {
  camTrackRef: React.MutableRefObject<ICameraVideoTrack | null>;
  micTrackRef: React.MutableRefObject<IMicrophoneAudioTrack | null>;
}

export function useLessonRoomDevices({ camTrackRef, micTrackRef }: UseLessonRoomDevicesProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');

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

  const handleDeviceChange = useCallback(
    async (type: 'camera' | 'mic', deviceId: string) => {
      try {
        if (type === 'camera') {
          setSelectedCamId(deviceId);
          if (camTrackRef.current) await camTrackRef.current.setDevice(deviceId);
        } else if (type === 'mic') {
          setSelectedMicId(deviceId);
          if (micTrackRef.current) await micTrackRef.current.setDevice(deviceId);
        }
      } catch (err) {
        console.error(`[Agora] Error switching ${type} device:`, err);
      }
    },
    [camTrackRef, micTrackRef]
  );

  return {
    cameras,
    microphones,
    selectedCamId,
    selectedMicId,
    refreshDevices,
    handleDeviceChange,
  };
}
