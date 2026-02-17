"use client";

import { useState } from "react";
import { NeonBorder } from "@/components/cyber";
import { Lock, Unlock, Key, Copy, Check } from "lucide-react";

interface QuantumVaultWidgetProps {
  isUnlocked?: boolean;
  masterKey?: string;
}

export function QuantumVaultWidget({ 
  isUnlocked = false, 
  masterKey = "XXXX-XXXX-XXXX-XXXX" 
}: QuantumVaultWidgetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(masterKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NeonBorder color="purple" className="rounded-xl">
      <div className="bg-cyber-dark/80 backdrop-blur-xl p-6 rounded-xl h-full relative overflow-hidden">
        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-[scan-line_5s_linear_infinite]" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Key className="w-5 h-5 text-purple-400" />
          <h3 className="font-orbitron font-bold text-white">量子密匣</h3>
          <div className="ml-auto">
            {isUnlocked ? (
              <Unlock className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Hexagon Vault Visual */}
        <div className="flex items-center justify-center mb-6 relative">
          <svg
            viewBox="0 0 100 100"
            className="w-32 h-32 transition-transform duration-700 hover:rotate-180"
          >
            <defs>
              <linearGradient id="quantum-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 50,5 L 90,27.5 L 90,72.5 L 50,95 L 10,72.5 L 10,27.5 Z"
              fill="none"
              stroke="url(#quantum-gradient)"
              strokeWidth="2"
              filter="url(#glow)"
              className={isUnlocked ? "animate-pulse" : ""}
            />
          </svg>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isUnlocked ? (
              <div className="text-4xl animate-pulse">💎</div>
            ) : (
              <div className="text-4xl">🔒</div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          <div className={`text-xs font-mono font-bold tracking-wider mb-2 ${
            isUnlocked ? "text-green-400" : "text-red-400"
          }`}>
            {isUnlocked ? "[ ACCESS GRANTED ]" : "[ VAULT LOCKED ]"}
          </div>
          <p className="text-white/60 text-xs">
            {isUnlocked 
              ? "密钥已激活，所有功能已解锁" 
              : "购买后解锁所有 AI 功能"}
          </p>
        </div>

        {isUnlocked ? (
          /* Unlocked State - Show Key */
          <div className="space-y-4">
            <div className="bg-white/5 border border-purple-500/30 rounded-lg p-4">
              <div className="text-xs text-white/40 font-mono mb-2">YOUR MASTER KEY</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-purple-400 flex-1 truncate">
                  {masterKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 p-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                  title="复制密钥"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-white/60 font-mono mb-2">✨ 已解锁功能</div>
              <div className="space-y-1 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                  <span>AI 肖像生成（无限次）</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                  <span>工作流自动化</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                  <span>数据分析专家</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-400" />
                  <span>知识库深度内容</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Locked State - Show Purchase Button */
          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all shadow-lg hover:shadow-purple-500/50">
            购买访问权限
          </button>
        )}

        {/* Particle Effect Hint */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <div className="w-1 h-1 rounded-full bg-purple-400/40 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-blue-400/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1 h-1 rounded-full bg-purple-400/40 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </NeonBorder>
  );
}
