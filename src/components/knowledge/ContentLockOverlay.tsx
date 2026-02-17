"use client";

import { CyberButton } from "@/components/cyber";
import { Lock } from "lucide-react";

interface ContentLockOverlayProps {
  onUnlock: () => void;
}

export function ContentLockOverlay({ onUnlock }: ContentLockOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-cyber-dark via-cyber-dark/95 to-transparent pointer-events-none">
      <div className="text-center p-8 pointer-events-auto">
        <div className="w-16 h-16 rounded-full bg-cyber-magenta/20 border-2 border-cyber-magenta/50 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Lock className="w-8 h-8 text-cyber-magenta" />
        </div>
        
        <h3 className="font-orbitron font-bold text-2xl text-white mb-3">
          继续阅读需要解锁
        </h3>
        
        <p className="text-white/60 text-sm mb-6 max-w-md">
          关注公众号回复「AI」或添加微信获取访问码
        </p>
        
        <CyberButton onClick={onUnlock} glowColor="magenta">
          解锁完整内容
        </CyberButton>
      </div>
    </div>
  );
}
