"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className,
  intensity = 'medium',
  onClick
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const intensityMap = {
    low: 0.3,
    medium: 0.5,
    high: 0.8
  };

  const opacity = intensityMap[intensity];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-br from-white/5 to-white/[0.02]',
        'border border-white/10',
        'transition-all duration-300',
        onClick && 'cursor-pointer',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Holographic shine effect */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(0, 243, 255, ${opacity * 0.5}) 0%,
              rgba(255, 0, 255, ${opacity * 0.3}) 25%,
              rgba(112, 0, 255, ${opacity * 0.2}) 50%,
              transparent 70%
            )
          `,
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Scan line overlay */}
      <div 
        className={cn(
          'absolute inset-0 pointer-events-none',
          isHovered && 'opacity-100'
        )}
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 243, 255, 0.03) 2px, rgba(0, 243, 255, 0.03) 4px)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Border glow on hover */}
      <div 
        className={cn(
          'absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          boxShadow: `inset 0 0 30px rgba(0, 243, 255, ${opacity * 0.3})`
        }}
      />
    </div>
  );
};
