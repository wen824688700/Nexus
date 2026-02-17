"use client";

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p';
  intensity?: 'low' | 'medium' | 'high';
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className,
  as: Component = 'span',
  intensity = 'medium'
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  const triggerGlitch = useCallback(() => {
    if (isGlitching) return;
    setIsGlitching(true);
    const duration = intensity === 'high' ? 400 : intensity === 'medium' ? 300 : 200;
    setTimeout(() => setIsGlitching(false), duration);
  }, [isGlitching, intensity]);

  const intensityConfig = {
    low: { offset: 1, opacity: 0.5 },
    medium: { offset: 2, opacity: 0.7 },
    high: { offset: 4, opacity: 0.9 }
  };

  const config = intensityConfig[intensity];

  return (
    <Component
      className={cn(
        'relative inline-block',
        isGlitching && 'animate-glitch',
        className
      )}
      onMouseEnter={triggerGlitch}
      data-text={children}
    >
      <span className="relative z-10">{children}</span>
      {isGlitching && (
        <>
          <span
            className="absolute inset-0 text-cyber-cyan"
            style={{
              left: `${config.offset}px`,
              opacity: config.opacity,
              clipPath: 'inset(20% 0 60% 0)'
            }}
            aria-hidden
          >
            {children}
          </span>
          <span
            className="absolute inset-0 text-cyber-magenta"
            style={{
              left: `-${config.offset}px`,
              opacity: config.opacity,
              clipPath: 'inset(60% 0 20% 0)'
            }}
            aria-hidden
          >
            {children}
          </span>
        </>
      )}
    </Component>
  );
};
