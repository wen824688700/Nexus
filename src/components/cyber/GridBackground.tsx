"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
  gridSize?: number;
  opacity?: number;
  animated?: boolean;
  color?: string;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  className,
  gridSize = 50,
  opacity = 0.03,
  animated = true,
  color = "#00f3ff",
}) => {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {/* Grid pattern */}
      <div
        className={cn("absolute inset-0", animated && "animate-grid-rotate")}
        style={{
          backgroundImage: `
            linear-gradient(${color} ${opacity * 100}%, transparent ${opacity * 100}%),
            linear-gradient(90deg, ${color} ${opacity * 100}%, transparent ${opacity * 100}%)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          animationDuration: "120s",
        }}
      />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, #0a0a0f 70%)",
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(10, 10, 15, 0.8) 100%)",
        }}
      />
    </div>
  );
};

// Floating particles component
export const FloatingParticles: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 20, className }) => {
  const [particles, setParticles] = React.useState<
    Array<{
      id: number;
      left: string;
      delay: string;
      duration: string;
      size: string;
    }>
  >([]);

  React.useEffect(() => {
    // 只在客户端生成粒子，避免 hydration 错误
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 20}s`,
        duration: `${15 + Math.random() * 10}s`,
        size: `${2 + Math.random() * 4}px`,
      })),
    );
  }, [count]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="bg-cyber-cyan/20 absolute rounded-full"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animation: `float-up ${particle.duration} linear infinite`,
            animationDelay: particle.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
