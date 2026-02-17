"use client";

import Link from "next/link";
import { GlitchText } from "@/components/cyber";
import { useAppStore } from "@/store/appStore";

interface NavbarProps {
  authUI?: React.ReactNode
}

export function Navbar({ authUI }: NavbarProps) {
  const isAgentModalOpen = useAppStore((state) => state.isAgentModalOpen);
  const isAgentModalFullscreen = useAppStore((state) => state.isAgentModalFullscreen);
  const isKnowledgeFullscreen = useAppStore((state) => state.isKnowledgeFullscreen);
  
  return (
    <nav className={`fixed top-0 left-0 right-0 bg-cyber-dark/80 backdrop-blur-lg border-b border-white/10 transition-all duration-300 ${
      isAgentModalFullscreen || isKnowledgeFullscreen
        ? '-translate-y-full opacity-0 pointer-events-none' 
        : isAgentModalOpen 
          ? 'z-40' 
          : 'z-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="APEX AI Logo" 
            className="w-10 h-10 object-contain"
          />
          <GlitchText as="span" className="text-xl font-orbitron font-bold">
            APEX AI Labs
          </GlitchText>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <NavLink href="/agents" color="cyan">
            智能体中心
          </NavLink>
          <NavLink href="/knowledge" color="cyan">
            知识库
          </NavLink>
          <NavLink href="/vault" color="purple">
            量子密匣
          </NavLink>
          
          {/* Authentication UI */}
          {authUI}
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  color?: 'cyan' | 'purple';
}

function NavLink({ href, children, color = 'cyan' }: NavLinkProps) {
  const gradientColors = {
    cyan: 'from-transparent via-cyber-cyan to-transparent',
    purple: 'from-transparent via-purple-400 to-transparent'
  };

  const textColors = {
    cyan: 'group-hover:text-cyber-cyan',
    purple: 'group-hover:text-purple-400'
  };

  return (
    <Link
      href={href}
      className="relative group"
    >
      {/* Container with padding */}
      <div className="relative px-5 py-2.5">
        {/* Static border */}
        <div className="absolute inset-0 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors duration-300" />
        
        {/* Animated gradient border */}
        <div 
          className={`
            absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500
            bg-gradient-to-r ${gradientColors[color]}
            bg-[length:200%_100%]
            animate-border-spin
          `}
          style={{
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude'
          }}
        />
        
        {/* Text */}
        <span className={`
          relative z-10 block
          text-sm font-medium tracking-wide
          text-white/70 ${textColors[color]}
          transition-colors duration-300
        `}>
          {children}
        </span>
      </div>
    </Link>
  );
}
