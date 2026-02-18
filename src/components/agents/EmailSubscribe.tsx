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
      <div className="bg-cyber-dark/80 rounded-xl p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <Mail className="text-cyber-magenta h-5 w-5" />
          <h3 className="font-orbitron font-bold text-white">邮件订阅</h3>
        </div>

        {status === "success" ? (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <Check className="h-5 w-5" />
            <span>订阅成功！</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入你的邮箱"
              className="focus:border-cyber-magenta/50 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors placeholder:text-white/40 focus:outline-none"
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

        <p className="mt-3 text-xs text-white/40">订阅后将收到最新的 AI 资讯和工具更新</p>
      </div>
    </NeonBorder>
  );
}
