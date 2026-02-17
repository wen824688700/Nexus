"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
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
  Target
} from 'lucide-react';

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
  Target
};

interface AgentCardProps {
  name: string;
  description: string;
  icon: string;
  status: 'online' | 'busy' | 'offline';
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
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const IconComponent = iconMap[icon] || Sparkles;
  
  const statusColors = {
    online: 'bg-green-500 shadow-[0_0_10px_#22c55e]',
    busy: 'bg-yellow-500 shadow-[0_0_10px_#eab308]',
    offline: 'bg-red-500 shadow-[0_0_10px_#ef4444]'
  };

  const categoryColors: Record<string, string> = {
    content: 'from-cyan-500/20 to-blue-500/20',
    data: 'from-purple-500/20 to-pink-500/20',
    code: 'from-green-500/20 to-emerald-500/20',
    design: 'from-pink-500/20 to-rose-500/20',
    research: 'from-amber-500/20 to-orange-500/20',
    support: 'from-indigo-500/20 to-violet-500/20'
  };

  return (
    <div
      className={cn(
        'group relative p-6 rounded-xl cursor-pointer',
        'bg-gradient-to-br from-white/5 to-white/[0.02]',
        'border border-white/10',
        'transition-all duration-500 ease-out',
        'hover:border-cyber-cyan/50',
        'preserve-3d',
        isHovered && 'shadow-[0_0_30px_rgba(0,243,255,0.2)]',
        className
      )}
      style={{
        transform: isHovered 
          ? 'translateY(-10px) translateZ(40px) rotateX(5deg)' 
          : 'translateY(0) translateZ(0) rotateX(0)',
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background gradient on hover */}
      <div 
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          'bg-gradient-to-br',
          category ? categoryColors[category] : 'from-cyber-cyan/10 to-cyber-magenta/10'
        )}
      />
      
      {/* Scan line effect */}
      <div 
        className={cn(
          'absolute inset-0 rounded-xl overflow-hidden pointer-events-none',
          isHovered && 'opacity-100'
        )}
      >
        <div 
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent"
          style={{
            animation: isHovered ? 'scan-line 2s linear infinite' : 'none'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and status */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              'bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20',
              'border border-cyber-cyan/30',
              'transition-all duration-500',
              isHovered && 'scale-110 rotate-[360deg] shadow-neon-cyan'
            )}
          >
            <IconComponent className="w-6 h-6 text-cyber-cyan" />
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'w-2 h-2 rounded-full animate-pulse',
              statusColors[status]
            )} />
            <span className="text-xs text-white/50 uppercase tracking-wider">
              {status}
            </span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="font-orbitron font-semibold text-lg text-white mb-2 group-hover:text-cyber-cyan transition-colors">
          {name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-white/60 leading-relaxed">
          {description}
        </p>
        
        {/* Category badge */}
        {category && (
          <div className="mt-4">
            <span className="inline-block px-3 py-1 text-xs font-mono rounded-full bg-white/5 text-white/50 border border-white/10">
              {category}
            </span>
          </div>
        )}
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan/0 group-hover:border-cyber-cyan/50 transition-colors duration-300 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan/0 group-hover:border-cyber-cyan/50 transition-colors duration-300 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan/0 group-hover:border-cyber-cyan/50 transition-colors duration-300 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan/0 group-hover:border-cyber-cyan/50 transition-colors duration-300 rounded-br-lg" />
    </div>
  );
};
