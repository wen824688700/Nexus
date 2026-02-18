"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  glowColor?: "cyan" | "magenta" | "purple";
  children: React.ReactNode;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  variant = "primary",
  size = "md",
  glowColor = "cyan",
  children,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const glowColors = {
    cyan: "shadow-neon-cyan hover:shadow-[0_0_30px_rgba(0,243,255,0.8)]",
    magenta: "shadow-neon-magenta hover:shadow-[0_0_30px_rgba(255,0,255,0.8)]",
    purple: "shadow-neon-purple hover:shadow-[0_0_30px_rgba(112,0,255,0.8)]",
  };

  const variantClasses = {
    primary: `bg-cyber-cyan text-cyber-dark hover:bg-white ${glowColors[glowColor]}`,
    secondary: `bg-cyber-magenta text-white hover:bg-white hover:text-cyber-magenta ${glowColors.magenta}`,
    outline: `bg-transparent border-2 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 ${glowColors.cyan}`,
  };

  return (
    <button
      className={cn(
        "font-orbitron relative font-semibold tracking-wider uppercase",
        "transition-all duration-300 ease-out",
        "clip-path-polygon",
        sizeClasses[size],
        variantClasses[variant],
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        clipPath:
          "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <span className="absolute inset-0 bg-white/0 transition-colors duration-300 hover:bg-white/10" />
    </button>
  );
};
