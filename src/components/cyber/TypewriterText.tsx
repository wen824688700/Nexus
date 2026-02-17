"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  className,
  speed = 50,
  delay = 0,
  showCursor = true,
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursorState, setShowCursorState] = useState(true);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    indexRef.current = 0;
    setIsTyping(false);

    // Start typing after delay
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay]);

  useEffect(() => {
    if (!isTyping) return;

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timeoutRef.current = setTimeout(type, speed);
      } else {
        setIsTyping(false);
        if (onComplete) {
          onComplete();
        }
      }
    };

    type();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isTyping, text, speed, onComplete]);

  // Cursor blink effect
  useEffect(() => {
    if (!showCursor || isTyping) {
      setShowCursorState(true);
      return;
    }

    const interval = setInterval(() => {
      setShowCursorState(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [showCursor, isTyping]);

  return (
    <span className={cn('inline-block', className)}>
      {displayText}
      {showCursor && (
        <span
          className={cn(
            'inline-block w-[2px] h-[1em] bg-cyber-cyan ml-0.5 align-middle',
            !showCursorState && 'opacity-0'
          )}
        />
      )}
    </span>
  );
};
