"use client";

import { CyberButton } from "@/components/cyber";
import { Lock } from "lucide-react";

interface ContentLockOverlayProps {
  onUnlock: () => void;
}

export function ContentLockOverlay({ onUnlock }: ContentLockOverlayProps) {
  return (
    <div className="from-cyber-dark via-cyber-dark/95 pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t to-transparent">
      <div className="pointer-events-auto p-8 text-center">
        <div className="bg-cyber-magenta/20 border-cyber-magenta/50 mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-full border-2">
          <Lock className="text-cyber-magenta h-8 w-8" />
        </div>

        <h3 className="font-orbitron mb-3 text-2xl font-bold text-white">继续阅读需要解锁</h3>

        <p className="mb-6 max-w-md text-sm text-white/60">
          关注公众号回复「AI」或添加微信获取访问码
        </p>

        <CyberButton onClick={onUnlock} glowColor="magenta">
          解锁完整内容
        </CyberButton>
      </div>
    </div>
  );
}
