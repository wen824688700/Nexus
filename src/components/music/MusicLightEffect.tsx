"use client";

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/appStore';

export const MusicLightEffect = () => {
  const { isPlaying } = useAppStore();
  const [bars, setBars] = useState<number[]>(Array(32).fill(5));
  const animationRef = useRef<number | null>(null);
  const targetBarsRef = useRef<number[]>(Array(32).fill(5));

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        // 生成目标高度（模拟音乐节奏）
        targetBarsRef.current = targetBarsRef.current.map((_, i) => {
          // 中间高两边低的波浪效果
          const centerOffset = Math.abs(i - 16) / 16;
          const baseHeight = Math.random() * 60 + 20;
          const waveFactor = 1 - centerOffset * 0.5;
          return baseHeight * waveFactor + 5;
        });

        // Lerp 平滑过渡
        setBars(prev => prev.map((current, i) => {
          const target = targetBarsRef.current[i];
          return current + (target - current) * 0.15;
        }));

        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // 停止时平滑回到最低
      const reset = () => {
        setBars(prev => {
          const newBars = prev.map(h => h + (5 - h) * 0.1);
          if (newBars.every(h => Math.abs(h - 5) < 0.5)) {
            return Array(32).fill(5);
          }
          return newBars;
        });
        if (!bars.every(h => Math.abs(h - 5) < 0.5)) {
          animationRef.current = requestAnimationFrame(reset);
        }
      };
      animationRef.current = requestAnimationFrame(reset);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-0 overflow-hidden">
      {/* 地面网格背景 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, transparent 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 29px,
              rgba(0, 243, 255, 0.1) 30px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 29px,
              rgba(0, 243, 255, 0.05) 30px
            )
          `,
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center bottom'
        }}
      />

      {/* 条状律动效果 */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] px-4">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-3 rounded-t-sm transition-all duration-75"
            style={{
              height: `${height}%`,
              background: `linear-gradient(to top, 
                rgba(0, 243, 255, 0.8) 0%, 
                rgba(0, 243, 255, 0.4) 50%,
                rgba(255, 0, 255, 0.6) 100%
              )`,
              boxShadow: height > 30 ? `0 0 ${height / 3}px rgba(0, 243, 255, 0.5)` : 'none',
              opacity: 0.6 + (height / 100) * 0.4
            }}
          />
        ))}
      </div>

      {/* 底部发光条 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, transparent, #00f3ff, #ff00ff, #00f3ff, transparent)',
          boxShadow: isPlaying ? '0 0 20px rgba(0, 243, 255, 0.8)' : 'none',
          opacity: isPlaying ? 1 : 0.3,
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
};
