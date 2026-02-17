"use client";

import { useState } from "react";
import { NeonBorder, CyberButton } from "@/components/cyber";
import { Mail, Check } from "lucide-react";

export function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // 模拟 API 调用
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <NeonBorder color="magenta" className="rounded-xl">
      <div className="bg-cyber-dark/80 backdrop-blur-xl p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-cyber-magenta" />
          <h3 className="font-orbitron font-bold text-white">邮件订阅</h3>
        </div>

        {status === "success" ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-5 h-5" />
            <span>订阅成功！</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入你的邮箱"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-cyber-magenta/50 transition-colors"
              disabled={status === "loading"}
            />
            <CyberButton
              type="submit"
              size="sm"
              className="w-full"
              glowColor="magenta"
              disabled={status === "loading"}
            >
              {status === "loading" ? "订阅中..." : "订阅更新"}
            </CyberButton>
          </form>
        )}

        <p className="mt-3 text-xs text-white/40">
          订阅后将收到最新的 AI 资讯和工具更新
        </p>
      </div>
    </NeonBorder>
  );
}
