"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ScanLineProps {
  className?: string;
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'horizontal' | 'vertical';
}

export const ScanLine: React.FC<ScanLineProps> = ({
  className,
  color = '#00f3ff',
  speed = 'normal',
  direction = 'horizontal'
}) => {
  const speedMap = {
    slow: '4s',
    normal: '2s',
    fast: '1s'
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div 
      className={cn(
        'absolute pointer-events-none overflow-hidden',
        isHorizontal ? 'inset-x-0 h-[2px]' : 'inset-y-0 w-[2px]',
        className
      )}
    >
      <div
        className={cn(
          'absolute',
          isHorizontal 
            ? 'w-full h-full animate-scan-line' 
            : 'h-full w-full animate-scan-line-vertical'
        )}
        style={{
          background: isHorizontal
            ? `linear-gradient(90deg, transparent, ${color}, transparent)`
            : `linear-gradient(180deg, transparent, ${color}, transparent)`,
          animationDuration: speedMap[speed]
        }}
      />
      <style>{`
        @keyframes scan-line-vertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
