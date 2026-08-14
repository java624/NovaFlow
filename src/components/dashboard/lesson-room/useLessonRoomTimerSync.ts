'use client';

import { useState, useRef, useCallback } from 'react';

interface UseLessonRoomTimerSyncProps {
  broadcast: (payload: Record<string, any>) => Promise<void>;
}

export function useLessonRoomTimerSync({ broadcast }: UseLessonRoomTimerSyncProps) {
  const [timerDuration, setTimerDuration] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tickTimer = useCallback(() => {
    setTimerRemaining((prev) => {
      const next = Math.max(prev - 1, 0);
      broadcast({ type: 'TIMER_UPDATE', duration: timerDuration, remainingSeconds: next, isRunning: next > 0 });
      if (next === 0 && timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        setTimerRunning(false);
      }
      return next;
    });
  }, [broadcast, timerDuration]);

  const handleStartTimer = useCallback(
    (durationMinutes: number) => {
      const durationSeconds = durationMinutes * 60;
      setTimerDuration(durationSeconds);
      setTimerRemaining(durationSeconds);
      setTimerRunning(true);
      broadcast({ type: 'TIMER_UPDATE', duration: durationSeconds, remainingSeconds: durationSeconds, isRunning: true });

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(tickTimer, 1000);
    },
    [broadcast, tickTimer]
  );

  const handlePauseResumeTimer = useCallback(() => {
    setTimerRunning((prevRunning) => {
      const nextRunning = !prevRunning;
      if (nextRunning) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(tickTimer, 1000);
      } else if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      broadcast({ type: 'TIMER_UPDATE', duration: timerDuration, remainingSeconds: timerRemaining, isRunning: nextRunning });
      return nextRunning;
    });
  }, [tickTimer, broadcast, timerDuration, timerRemaining]);

  const handleResetTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerRunning(false);
    setTimerRemaining(0);
    setTimerDuration(0);
    broadcast({ type: 'TIMER_UPDATE', duration: 0, remainingSeconds: 0, isRunning: false });
  }, [broadcast]);

  return {
    timerDuration,
    setTimerDuration,
    timerRemaining,
    setTimerRemaining,
    timerRunning,
    setTimerRunning,
    timerIntervalRef,
    handleStartTimer,
    handlePauseResumeTimer,
    handleResetTimer,
  };
}
