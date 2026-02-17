"use client";

import { useEffect, useState, useRef } from 'react';

interface AudioGlowRingProps {
  isPlaying: boolean;
  getFrequencyData: () => Uint8Array;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const AudioGlowRing = ({ 
  isPlaying, 
  getFrequencyData, 
  size = 'medium',
  children 
}: AudioGlowRingProps) => {
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [glowColor, setGlowColor] = useState({ r: 255, g: 0, b: 255 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      setGlowIntensity(0.5);
      setGlowColor({ r: 255, g: 0, b: 255 });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      const frequencyData = getFrequencyData();
      
      if (frequencyData && frequencyData.length > 0) {
        // 计算不同频段的能量
        const bass = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        const mid = frequencyData.slice(10, 30).reduce((a, b) => a + b, 0) / 20 / 255;
        const high = frequencyData.slice(30, 60).reduce((a, b) => a + b, 0) / 30 / 255;
        
        // 使用更激进的映射 - 将0.6-0.65映射到0.2-1.0
        const rawIntensity = (bass + mid + high) / 3;
        // 减去基准值，然后放大
        const normalized = Math.max(0, (rawIntensity - 0.5) * 10); // 将0.6变成1, 0.65变成1.5
        const intensity = Math.min(1, normalized);
        
        setGlowIntensity(intensity);
        
        // 根据频率计算颜色
        const r = Math.floor(255 * Math.min(bass * 1.5, 1));
        const g = Math.floor(255 * Math.min(high * 1.8, 1));
        const b = Math.floor(255 * Math.min((mid + high) * 0.9, 1));
        
        setGlowColor({ r, g, b });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, getFrequencyData]);

  // 根据尺寸计算基础值
  const sizeMultiplier = size === 'small' ? 0.6 : size === 'large' ? 1.2 : 0.8;
  const baseBlur = 4 * sizeMultiplier;
  const baseSpread = 1 * sizeMultiplier;
  
  // 根据强度计算最终值
  const blur = baseBlur + glowIntensity * 8 * sizeMultiplier;
  const spread = baseSpread + glowIntensity * 3 * sizeMultiplier;
  const opacity = 0.5 + glowIntensity * 0.5;

  const glowStyle: React.CSSProperties = {
    boxShadow: `
      0 0 ${blur}px ${spread}px rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${opacity}),
      0 0 ${blur * 0.5}px rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${opacity * 0.7})
    `,
    // 移除 transition，让变化更直接
  };

  return (
    <div style={glowStyle} className="rounded-full">
      {children}
    </div>
  );
};
