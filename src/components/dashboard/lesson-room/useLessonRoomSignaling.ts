'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { IAgoraRTCClient, ILocalDataChannel, IRemoteDataChannel } from 'agora-rtc-react';
import { ChatMessage } from './types';
import { FlyingReaction } from './ReactionsOverlay';
import { useLessonRoomPolls } from './useLessonRoomPolls';
import { useLessonRoomTimerSync } from './useLessonRoomTimerSync';

interface UseLessonRoomSignalingProps {
  client: IAgoraRTCClient;
  uid: number;
  userName?: string;
  userRole: 'teacher' | 'student';
  micTrackRef: React.MutableRefObject<any>;
  setMicMuted: (muted: boolean) => void;
  setIsForceMuted: (muted: boolean) => void;
  onLeave: () => void;
}

export function useLessonRoomSignaling({
  client,
  uid,
  userName,
  userRole,
  micTrackRef,
  setMicMuted,
  setIsForceMuted,
  onLeave,
}: UseLessonRoomSignalingProps) {
  const isTeacher = userRole === 'teacher';

  const dataChannelRef = useRef<ILocalDataChannel | null>(null);
  const remoteDataChannelsRef = useRef<IRemoteDataChannel[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [kickedNotice, setKickedNotice] = useState(false);
  const [forceMutedNotice, setForceMutedNotice] = useState(false);

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
  const [reactions, setReactions] = useState<FlyingReaction[]>([]);

  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({});

  const [participantProfiles, setParticipantProfiles] = useState<
    Record<string, { name: string; role: 'teacher' | 'student' }>
  >({});

  const broadcast = useCallback(
    async (payload: Record<string, any>) => {
      if (!client || client.connectionState !== 'CONNECTED') return;
      try {
        const bytes = new TextEncoder().encode(JSON.stringify(payload));
        const channel = dataChannelRef.current;
        if (channel?.readyState === 'open') {
          channel.send(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
          return;
        }

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

  const polls = useLessonRoomPolls({ uid, isTeacher, broadcast });
  const timer = useLessonRoomTimerSync({ broadcast });

  const announceProfile = useCallback(() => {
    broadcast({ type: 'PROFILE', uid, name: userName || 'Учасник', role: userRole });
  }, [broadcast, uid, userName, userRole]);

  const handleStreamMessage = useCallback(
    (remoteUid: any, data: any) => {
      try {
        let rawText = '';
        if (typeof data === 'string') {
          rawText = data;
        } else if (data instanceof Uint8Array || ArrayBuffer.isView(data)) {
          rawText = new TextDecoder('utf-8').decode(data);
        } else if (data && typeof data === 'object' && (data as any).payload) {
          const payload = (data as any).payload;
          rawText = typeof payload === 'string' ? payload : new TextDecoder('utf-8').decode(payload);
        }

        if (!rawText) return;
        const parsed = JSON.parse(rawText);

        switch (parsed.type) {
          case 'CHAT_MSG': {
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
            setRaisedHands((prev) => ({ ...prev, [String(parsed.uid)]: Boolean(parsed.raised) }));
            break;
          }

          case 'PROFILE': {
            setParticipantProfiles((prev) => ({
              ...prev,
              [String(parsed.uid)]: { name: parsed.name, role: parsed.role },
            }));
            break;
          }

          case 'REACTION': {
            const reactionId = `${parsed.uid}-${Date.now()}-${Math.random()}`;
            setReactions((prev) => [...prev, { id: reactionId, emoji: parsed.emoji, x: 10 + Math.random() * 80 }]);
            setTimeout(() => {
              setReactions((prev) => prev.filter((r) => r.id !== reactionId));
            }, 2700);
            break;
          }

          case 'POLL_CREATE': {
            polls.setCurrentPoll({
              id: parsed.pollId,
              question: parsed.question,
              options: parsed.options,
              counts: new Array(parsed.options.length).fill(0),
              totalVotes: 0,
              isActive: true,
            });
            polls.setHasVotedPollId(null);
            polls.pollVotesRef.current[parsed.pollId] = new Set();
            break;
          }

          case 'POLL_VOTE': {
            if (!isTeacher) break;
            const { pollId, optionIndex, voterUid } = parsed;
            const votedSet = polls.pollVotesRef.current[pollId] || new Set();
            if (votedSet.has(voterUid)) break;
            votedSet.add(voterUid);
            polls.pollVotesRef.current[pollId] = votedSet;

            polls.setCurrentPoll((prev) => {
              if (!prev || prev.id !== pollId) return prev;
              const counts = [...prev.counts];
              counts[optionIndex] = (counts[optionIndex] || 0) + 1;
              const updated = { ...prev, counts, totalVotes: prev.totalVotes + 1 };
              broadcast({ type: 'POLL_RESULTS', pollId, counts: updated.counts, totalVotes: updated.totalVotes });
              return updated;
            });
            break;
          }

          case 'POLL_RESULTS': {
            polls.setCurrentPoll((prev) => {
              if (!prev || prev.id !== parsed.pollId) return prev;
              return { ...prev, counts: parsed.counts, totalVotes: parsed.totalVotes };
            });
            break;
          }

          case 'POLL_END': {
            polls.setCurrentPoll(null);
            polls.setHasVotedPollId(null);
            break;
          }

          case 'TIMER_UPDATE': {
            timer.setTimerDuration(parsed.duration);
            timer.setTimerRemaining(parsed.remainingSeconds);
            timer.setTimerRunning(parsed.isRunning);
            break;
          }

          case 'MUTE_ALL': {
            if (isTeacher) break;
            if (micTrackRef.current) {
              micTrackRef.current.setMuted(true).catch(() => {});
            }
            setMicMuted(true);
            setIsForceMuted(true);
            setForceMutedNotice(true);
            setTimeout(() => setForceMutedNotice(false), 4000);
            break;
          }

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
    },
    [isTeacher, micTrackRef, setMicMuted, setIsForceMuted, uid, broadcast, polls, timer]
  );

  useEffect(() => {
    if (!kickedNotice) return;
    const t = setTimeout(() => {
      onLeave();
    }, 2500);
    return () => clearTimeout(t);
  }, [kickedNotice, onLeave]);

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

  const handleRaiseHandToggle = useCallback(() => {
    setHandRaised((prev) => {
      const raised = !prev;
      broadcast({ type: 'HAND_RAISE', uid, raised });
      return raised;
    });
  }, [broadcast, uid]);

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

  const cleanupSignaling = useCallback(() => {
    dataChannelRef.current = null;
    remoteDataChannelsRef.current.forEach((ch) => ch.removeAllListeners());
    remoteDataChannelsRef.current = [];
  }, []);

  return {
    dataChannelRef,
    remoteDataChannelsRef,
    isChatOpen,
    unreadCount,
    chatMessages,
    inputMessage,
    setInputMessage,
    reactions,
    handRaised,
    raisedHands,
    currentPoll: polls.currentPoll,
    hasVotedPollId: polls.hasVotedPollId,
    timerDuration: timer.timerDuration,
    timerRemaining: timer.timerRemaining,
    timerRunning: timer.timerRunning,
    participantProfiles,
    kickedNotice,
    forceMutedNotice,
    broadcast,
    announceProfile,
    handleStreamMessage,
    handleSendMessage,
    toggleChat,
    handleSendReaction,
    handleRaiseHandToggle,
    handleCreatePoll: polls.handleCreatePoll,
    handleVotePoll: polls.handleVotePoll,
    handleEndPoll: polls.handleEndPoll,
    handleStartTimer: timer.handleStartTimer,
    handlePauseResumeTimer: timer.handlePauseResumeTimer,
    handleResetTimer: timer.handleResetTimer,
    handleMuteAll,
    handleMuteUser,
    handleKickUser,
    cleanupSignaling,
  };
}
