'use client';

import { useState, useRef, useCallback } from 'react';
import { PollData } from './PollWidget';

interface UseLessonRoomPollsProps {
  uid: number;
  isTeacher: boolean;
  broadcast: (payload: Record<string, any>) => Promise<void>;
}

export function useLessonRoomPolls({ uid, isTeacher, broadcast }: UseLessonRoomPollsProps) {
  const [currentPoll, setCurrentPoll] = useState<PollData | null>(null);
  const [hasVotedPollId, setHasVotedPollId] = useState<string | null>(null);
  const pollVotesRef = useRef<Record<string, Set<string | number>>>({});

  const handleCreatePoll = useCallback(
    (question: string, options: string[]) => {
      const pollId = `${Date.now()}`;
      pollVotesRef.current[pollId] = new Set();
      const poll: PollData = {
        id: pollId,
        question,
        options,
        counts: new Array(options.length).fill(0),
        totalVotes: 0,
        isActive: true,
      };
      setCurrentPoll(poll);
      setHasVotedPollId(null);
      broadcast({ type: 'POLL_CREATE', pollId, question, options });
    },
    [broadcast]
  );

  const handleVotePoll = useCallback(
    (optionIndex: number) => {
      if (!currentPoll || hasVotedPollId === currentPoll.id) return;
      setHasVotedPollId(currentPoll.id);
      setCurrentPoll((prev) => {
        if (!prev) return prev;
        const counts = [...prev.counts];
        counts[optionIndex] = (counts[optionIndex] || 0) + 1;
        return { ...prev, counts, totalVotes: prev.totalVotes + 1 };
      });
      broadcast({ type: 'POLL_VOTE', pollId: currentPoll.id, optionIndex, voterUid: uid });
    },
    [currentPoll, hasVotedPollId, uid, broadcast]
  );

  const handleEndPoll = useCallback(() => {
    if (!currentPoll) return;
    broadcast({ type: 'POLL_END', pollId: currentPoll.id });
    setCurrentPoll(null);
    setHasVotedPollId(null);
  }, [currentPoll, broadcast]);

  return {
    currentPoll,
    setCurrentPoll,
    hasVotedPollId,
    setHasVotedPollId,
    pollVotesRef,
    handleCreatePoll,
    handleVotePoll,
    handleEndPoll,
  };
}
