"use client";

import { useAppStore } from "@/store/appStore";

export function Footer() {
  const isAgentModalOpen = useAppStore((state) => state.isAgentModalOpen);
  const isAgentModalFullscreen = useAppStore((state) => state.isAgentModalFullscreen);
  const isKnowledgeFullscreen = useAppStore((state) => state.isKnowledgeFullscreen);
  
  // 当 AgentModal 打开或全屏状态时隐藏 Footer
  if (isAgentModalOpen || isAgentModalFullscreen || isKnowledgeFullscreen) {
    return null;
  }
  
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 bg-cyber-dark/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-xs text-white/40 tracking-wider">
            © 2024 APEX AI. All Rights Reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-white/40 hover:text-cyber-cyan transition-colors tracking-wider"
            >
              关于
            </a>
            <a
              href="#"
              className="text-xs text-white/40 hover:text-cyber-cyan transition-colors tracking-wider"
            >
              联系
            </a>
            <a
              href="#"
              className="text-xs text-white/40 hover:text-cyber-cyan transition-colors tracking-wider"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Built with */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-white/30 tracking-widest uppercase">
            Built with Vibe Coding
          </p>
        </div>
      </div>
    </footer>
  );
}
