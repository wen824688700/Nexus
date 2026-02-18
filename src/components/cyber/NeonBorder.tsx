"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NeonBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: "cyan" | "magenta" | "purple" | "gradient";
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
}

export const NeonBorder: React.FC<NeonBorderProps> = ({
  children,
  className,
  color = "cyan",
  intensity = "medium",
  animated = false,
}) => {
  const colorMap = {
    cyan: "#00f3ff",
    magenta: "#ff00ff",
    purple: "#7000ff",
    gradient: "linear-gradient(90deg, #00f3ff, #ff00ff, #7000ff, #00f3ff)",
  };

  const intensityMap = {
    low: "0.3",
    medium: "0.6",
    high: "1",
  };

  const borderColor = colorMap[color];
  const glowIntensity = intensityMap[intensity];

  return (
    <div className={cn("relative", className)}>
      {/* Animated border background */}
      <div
        className={cn("absolute -inset-[1px] rounded-lg", animated && "animate-border-flow")}
        style={{
          background:
            color === "gradient"
              ? borderColor
              : `linear-gradient(90deg, ${borderColor}, ${borderColor})`,
          backgroundSize: color === "gradient" ? "300% 100%" : "100% 100%",
          opacity: glowIntensity,
          zIndex: 0,
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute -inset-2 rounded-xl blur-lg transition-opacity duration-300"
        style={{
          background:
            color === "gradient"
              ? "linear-gradient(90deg, rgba(0,243,255,0.3), rgba(255,0,255,0.3))"
              : borderColor + "30",
          opacity: 0.5,
          zIndex: -1,
        }}
      />

      {/* Content */}
      <div className="bg-cyber-dark relative z-10 rounded-lg">{children}</div>
    </div>
  );
};
