"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Image,
  BarChart3,
  Sparkles,
  Newspaper,
  Music,
  Code,
  FileText,
  Database,
  Palette,
  Search,
  HeadphonesIcon,
  Wrench,
  Users,
  BookOpen,
  Presentation,
  Layout,
  User,
  GraduationCap,
  MessageCircle,
  Target,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Image,
  BarChart3,
  Sparkles,
  Newspaper,
  Music,
  Code,
  FileText,
  Database,
  Palette,
  Search,
  HeadphonesIcon,
  Wrench,
  Users,
  BookOpen,
  Presentation,
  Layout,
  User,
  GraduationCap,
  MessageCircle,
  Target,
};

interface AgentCardProps {
  name: string;
  description: string;
  icon: string;
  status: "online" | "busy" | "offline";
  category?: string;
  onClick?: () => void;
  className?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  name,
  description,
  icon,
  status,
  category,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = iconMap[icon] || Sparkles;

  const statusColors = {
    online: "bg-green-500 shadow-[0_0_10px_#22c55e]",
    busy: "bg-yellow-500 shadow-[0_0_10px_#eab308]",
    offline: "bg-red-500 shadow-[0_0_10px_#ef4444]",
  };

  const categoryColors: Record<string, string> = {
    content: "from-cyan-500/20 to-blue-500/20",
    data: "from-purple-500/20 to-pink-500/20",
    code: "from-green-500/20 to-emerald-500/20",
    design: "from-pink-500/20 to-rose-500/20",
    research: "from-amber-500/20 to-orange-500/20",
    support: "from-indigo-500/20 to-violet-500/20",
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-xl p-6",
        "bg-gradient-to-br from-white/5 to-white/[0.02]",
        "border border-white/10",
        "transition-all duration-500 ease-out",
        "hover:border-cyber-cyan/50",
        "preserve-3d",
        isHovered && "shadow-[0_0_30px_rgba(0,243,255,0.2)]",
        className,
      )}
      style={{
        transform: isHovered
          ? "translateY(-10px) translateZ(40px) rotateX(5deg)"
          : "translateY(0) translateZ(0) rotateX(0)",
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background gradient on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-gradient-to-br",
          category ? categoryColors[category] : "from-cyber-cyan/10 to-cyber-magenta/10",
        )}
      />

      {/* Scan line effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-xl",
          isHovered && "opacity-100",
        )}
      >
        <div
          className="via-cyber-cyan/50 absolute h-[2px] w-full bg-gradient-to-r from-transparent to-transparent"
          style={{
            animation: isHovered ? "scan-line 2s linear infinite" : "none",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and status */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              "from-cyber-cyan/20 to-cyber-purple/20 bg-gradient-to-br",
              "border-cyber-cyan/30 border",
              "transition-all duration-500",
              isHovered && "shadow-neon-cyan scale-110 rotate-[360deg]",
            )}
          >
            <IconComponent className="text-cyber-cyan h-6 w-6" />
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 animate-pulse rounded-full", statusColors[status])} />
            <span className="text-xs tracking-wider text-white/50 uppercase">{status}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-orbitron group-hover:text-cyber-cyan mb-2 text-lg font-semibold text-white transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-white/60">{description}</p>

        {/* Category badge */}
        {category && (
          <div className="mt-4">
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-white/50">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Corner decorations */}
      <div className="border-cyber-cyan/0 group-hover:border-cyber-cyan/50 absolute top-0 left-0 h-4 w-4 rounded-tl-lg border-t-2 border-l-2 transition-colors duration-300" />
      <div className="border-cyber-cyan/0 group-hover:border-cyber-cyan/50 absolute top-0 right-0 h-4 w-4 rounded-tr-lg border-t-2 border-r-2 transition-colors duration-300" />
      <div className="border-cyber-cyan/0 group-hover:border-cyber-cyan/50 absolute bottom-0 left-0 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 transition-colors duration-300" />
      <div className="border-cyber-cyan/0 group-hover:border-cyber-cyan/50 absolute right-0 bottom-0 h-4 w-4 rounded-br-lg border-r-2 border-b-2 transition-colors duration-300" />
    </div>
  );
};
