'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DraggableWidgetProps {
  defaultPosition: { x: number; y: number };
  children: (props: {
    isDragging: boolean;
    dragHandleProps: {
      onMouseDown: (e: React.MouseEvent) => void;
      onTouchStart: (e: React.TouchEvent) => void;
      style: React.CSSProperties;
    };
    popoverPositionClass: string;
  }) => React.ReactNode;
}

export default function DraggableWidget({ defaultPosition, children }: DraggableWidgetProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const isInitializedRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: defaultPosition.x,
    initialY: defaultPosition.y,
  });
  const movedRef = useRef(false);

  // Set default initial position based on window dimensions once mounted client-side
  useEffect(() => {
    if (!isInitializedRef.current && typeof window !== 'undefined') {
      const clampX = Math.max(10, Math.min(window.innerWidth - 60, defaultPosition.x));
      const clampY = Math.max(10, Math.min(window.innerHeight - 60, defaultPosition.y));
      setPosition({ x: clampX, y: clampY });
      isInitializedRef.current = true;
    }
  }, [defaultPosition.x, defaultPosition.y]);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    movedRef.current = false;
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only primary mouse button
    if (e.button !== 0) return;
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      const deltaX = clientX - dragStartRef.current.mouseX;
      const deltaY = clientY - dragStartRef.current.mouseY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        movedRef.current = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 60, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 60, dragStartRef.current.initialY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  // Determine smart popover position so menus never overflow the screen
  const isNearBottom = typeof window !== 'undefined' ? position.y > window.innerHeight / 2 : true;
  const isNearRight = typeof window !== 'undefined' ? position.x > window.innerWidth / 2 : false;

  let popoverPositionClass = '';
  if (isNearBottom) {
    popoverPositionClass = isNearRight ? 'bottom-14 right-0' : 'bottom-14 left-0';
  } else {
    popoverPositionClass = isNearRight ? 'top-14 right-0' : 'top-14 left-0';
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 140,
        touchAction: 'none',
      }}
    >
      {children({
        isDragging,
        dragHandleProps: {
          onMouseDown: handleMouseDown,
          onTouchStart: handleTouchStart,
          style: { cursor: isDragging ? 'grabbing' : 'grab' },
        },
        popoverPositionClass,
      })}
    </div>
  );
}
