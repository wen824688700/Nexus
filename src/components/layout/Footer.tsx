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
    <footer className="bg-cyber-dark/50 relative z-10 mt-20 border-t border-white/10 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Copyright */}
          <div className="text-xs tracking-wider text-white/40">
            © 2024 APEX AI. All Rights Reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="hover:text-cyber-cyan text-xs tracking-wider text-white/40 transition-colors"
            >
              关于
            </a>
            <a
              href="#"
              className="hover:text-cyber-cyan text-xs tracking-wider text-white/40 transition-colors"
            >
              联系
            </a>
            <a
              href="#"
              className="hover:text-cyber-cyan text-xs tracking-wider text-white/40 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Built with */}
        <div className="mt-4 text-center">
          <p className="text-[10px] tracking-widest text-white/30 uppercase">
            Built with Vibe Coding
          </p>
        </div>
      </div>
    </footer>
  );
}
