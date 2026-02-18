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
  masterKey = "XXXX-XXXX-XXXX-XXXX",
}: QuantumVaultWidgetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(masterKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NeonBorder color="purple" className="rounded-xl">
      <div className="bg-cyber-dark/80 relative h-full overflow-hidden rounded-xl p-6 backdrop-blur-xl">
        {/* Scan Line Effect */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute h-[2px] w-full animate-[scan-line_5s_linear_infinite] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* Header */}
        <div className="relative z-10 mb-6 flex items-center gap-3">
          <Key className="h-5 w-5 text-purple-400" />
          <h3 className="font-orbitron font-bold text-white">量子密匣</h3>
          <div className="ml-auto">
            {isUnlocked ? (
              <Unlock className="h-4 w-4 text-green-400" />
            ) : (
              <Lock className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Hexagon Vault Visual */}
        <div className="relative mb-6 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="h-32 w-32 transition-transform duration-700 hover:rotate-180"
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
              <div className="animate-pulse text-4xl">💎</div>
            ) : (
              <div className="text-4xl">🔒</div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 text-center">
          <div
            className={`mb-2 font-mono text-xs font-bold tracking-wider ${
              isUnlocked ? "text-green-400" : "text-red-400"
            }`}
          >
            {isUnlocked ? "[ ACCESS GRANTED ]" : "[ VAULT LOCKED ]"}
          </div>
          <p className="text-xs text-white/60">
            {isUnlocked ? "密钥已激活，所有功能已解锁" : "购买后解锁所有 AI 功能"}
          </p>
        </div>

        {isUnlocked ? (
          /* Unlocked State - Show Key */
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-500/30 bg-white/5 p-4">
              <div className="mb-2 font-mono text-xs text-white/40">YOUR MASTER KEY</div>
              <div className="flex items-center justify-between gap-2">
                <code className="flex-1 truncate font-mono text-sm text-purple-400">
                  {masterKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 rounded bg-purple-500/20 p-2 text-purple-400 transition-colors hover:bg-purple-500/30"
                  title="复制密钥"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="mb-2 font-mono text-xs text-white/60">✨ 已解锁功能</div>
              <div className="space-y-1 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-400" />
                  <span>AI 肖像生成（无限次）</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-400" />
                  <span>工作流自动化</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-400" />
                  <span>数据分析专家</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-400" />
                  <span>知识库深度内容</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Locked State - Show Purchase Button */
          <button className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-medium text-white shadow-lg transition-all hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/50">
            购买访问权限
          </button>
        )}

        {/* Particle Effect Hint */}
        <div className="absolute right-2 bottom-2 flex gap-1">
          <div className="h-1 w-1 animate-pulse rounded-full bg-purple-400/40" />
          <div
            className="h-1 w-1 animate-pulse rounded-full bg-blue-400/40"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-1 w-1 animate-pulse rounded-full bg-purple-400/40"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </NeonBorder>
  );
}
