"use client";

import { useRef, useCallback } from "react";

/**
 * Swipe direction type
 */
export type SwipeDirection = "left" | "right" | "up" | "down";

/**
 * Swipe configuration interface
 */
export interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum swipe distance in pixels (default: 50)
  velocity?: number; // Minimum swipe velocity (default: 0.3)
}

/**
 * Touch point interface
 */
interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * Hook to detect swipe gestures on touch devices
 * 
 * @param config - Swipe configuration with callbacks and thresholds
 * @returns Object with touch event handlers
 * 
 * @example
 * ```tsx
 * function SwipeableComponent() {
 *   const swipeHandlers = useSwipe({
 *     onSwipeLeft: () => console.log('Swiped left'),
 *     onSwipeRight: () => console.log('Swiped right'),
 *     threshold: 50,
 *     velocity: 0.3,
 *   });
 *   
 *   return <div {...swipeHandlers}>Swipe me!</div>;
 * }
 * ```
 */
export function useSwipe(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocity = 0.3,
  } = config;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    // Calculate velocity (pixels per millisecond)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const swipeVelocity = distance / deltaTime;

    // Check if swipe meets threshold and velocity requirements
    if (distance < threshold || swipeVelocity < velocity) {
      touchStart.current = null;
      touchEnd.current = null;
      return;
    }

    // Determine swipe direction (horizontal or vertical)
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontal) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocity]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
