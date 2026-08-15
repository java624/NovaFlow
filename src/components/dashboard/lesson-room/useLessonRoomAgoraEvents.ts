'use client';

import { useEffect } from 'react';
import { IAgoraRTCClient, IRemoteDataChannel } from 'agora-rtc-react';
import { CLASSROOM_DATA_CHANNEL_ID, isScreenShareUser } from './utils';

interface UseLessonRoomAgoraEventsProps {
  client: IAgoraRTCClient;
  uid: number;
  announceProfile: () => void;
  handleStreamMessage: (remoteUid: any, data: any) => void;
  remoteDataChannelsRef: React.MutableRefObject<IRemoteDataChannel[]>;
  setActiveSpeakerUid: (uid: number | string | null) => void;
  setNetworkQuality: (q: number) => void;
}

export function useLessonRoomAgoraEvents({
  client,
  uid,
  announceProfile,
  handleStreamMessage,
  remoteDataChannelsRef,
  setActiveSpeakerUid,
  setNetworkQuality,
}: UseLessonRoomAgoraEventsProps) {
  useEffect(() => {
    if (!client) return;

    try { client.enableAudioVolumeIndicator(); } catch (e) {}

    const handleUserPublished = async (user: any, mediaType: 'video' | 'audio' | 'datachannel', config?: { id: number }) => {
      try {
        if (mediaType === 'datachannel') {
          const remoteChannel = (await client.subscribe(
            user,
            'datachannel',
            config?.id ?? CLASSROOM_DATA_CHANNEL_ID
          )) as IRemoteDataChannel;
          remoteDataChannelsRef.current.push(remoteChannel);
          remoteChannel.on('message', (data: ArrayBuffer) => handleStreamMessage(user.uid, new Uint8Array(data)));
          remoteChannel.on('close', () => {
            remoteDataChannelsRef.current = remoteDataChannelsRef.current.filter((item) => item !== remoteChannel);
          });
          announceProfile();
          return;
        }

        let track: any = null;
        try {
          track = await client.subscribe(user, mediaType);
        } catch (subErr: any) {
          if (mediaType === 'audio') track = user.audioTrack;
          if (mediaType === 'video') track = user.videoTrack;
        }

        if (mediaType === 'audio' && !isScreenShareUser(user.uid)) {
          const audioTrack = (track as any) || user.audioTrack;
          if (audioTrack) {
            try {
              audioTrack.setVolume?.(100);
              if (!audioTrack.isPlaying) {
                audioTrack.play();
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error(`[Agora] Subscribe error for ${mediaType}:`, err);
      }
    };

    const handleUserJoined = () => announceProfile();

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

    const handleUserMuteUpdated = (user: any, mediaType: 'audio' | 'video', isMuted: boolean) => {
      if (mediaType === 'audio' && !isMuted && !isScreenShareUser(user.uid)) {
        if (user.audioTrack) {
          try {
            user.audioTrack.setVolume?.(100);
            if (!user.audioTrack.isPlaying) {
              user.audioTrack.play();
            }
          } catch (err) {}
        }
      }
    };

    client.on('user-published', handleUserPublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-mute-updated', handleUserMuteUpdated);
    client.on('volume-indicator', handleVolumeIndicator);
    client.on('network-quality', handleNetworkQuality);
    client.on('stream-message', handleStreamMessage);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-mute-updated', handleUserMuteUpdated);
      client.off('volume-indicator', handleVolumeIndicator);
      client.off('network-quality', handleNetworkQuality);
      client.off('stream-message', handleStreamMessage);
    };
  }, [client, uid, announceProfile, handleStreamMessage, remoteDataChannelsRef, setActiveSpeakerUid, setNetworkQuality]);
}
