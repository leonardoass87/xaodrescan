import { useState, useCallback } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface TouchGesture {
  direction: 'left' | 'right' | 'up' | 'down' | 'none';
  distance: number;
  velocity: number;
}

export const useTouchGestures = () => {
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
    setTouchEnd(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY
    });
  }, []);

  const handleTouchEnd = useCallback((): TouchGesture => {
    if (!touchStart || !touchEnd) {
      return { direction: 'none', distance: 0, velocity: 0 };
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / 100; // Aproximação simples

    let direction: 'left' | 'right' | 'up' | 'down' | 'none' = 'none';

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setTouchStart(null);
    setTouchEnd(null);

    return { direction, distance, velocity };
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isTouching: touchStart !== null
  };
};
