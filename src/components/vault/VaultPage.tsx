"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Power, Lock, Unlock, Terminal, X, Share2, Cpu } from "lucide-react";
import { QuotaManager } from "@/lib/quotaManager";

type Stage = "standby" | "booting" | "locked" | "unlocking" | "unlocked" | "denied";

export function VaultPage() {
  const [stage, setStage] = useState<Stage>("standby");
  const [showQR, setShowQR] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // 启动日志
  const logs = [
    "INITIALIZING NEURAL LINK...",
    "LOADING RETRO_OS v4.0.2...",
    "ESTABLISHING QUANTUM ENCRYPTION...",
    "BYPASSING FIREWALL... [SUCCESS]",
    "MOUNTING AI_CORE_MODULES...",
    "READY FOR AUTHENTICATION.",
  ];

  // 处理启动流程
  const handlePowerOn = () => {
    setStage("booting");
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setBootLogs((prev) => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStage("locked"), 800);
      }
    }, 300);
  };

  // 有效的邀请码列表
  const validCodes = [
    "APEX2024",
    "QUANTUM",
    "NEURAL",
    "CYBER2024",
    "RETRO",
    "DEV_UNLIMITED", // 开发者专用，无限配额
  ];

  // 处理解锁动作
  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    
    if (code.length === 0) {
      return;
    }

    // 验证邀请码
    if (validCodes.includes(code)) {
      setStage("unlocking");
      // 初始化配额会话
      QuotaManager.initSession(code);
      // 模拟 2 秒的破解动画
      setTimeout(() => setStage("unlocked"), 2000);
    } else {
      // 错误动画：红闪 + 震动
      setStage("denied");
      setTimeout(() => {
        setStage("locked");
        setInviteCode("");
      }, 1500);
    }
  };

  // 重置会话
  const handleReset = () => {
    setStage("standby");
    setInviteCode("");
    setBootLogs([]);
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] text-cyan-400 font-mono overflow-hidden flex items-center justify-center select-none">
      {/* 隐藏音乐播放器 */}
      <style jsx global>{`
        .floating-music-player {
          display: none !important;
        }
      `}</style>

      {/* 赛博底噪与扫描线效果 */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.04] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      </div>

      {/* 阶段 1: 系统待机 (Standby) */}
      {stage === "standby" && (
        <div className="flex flex-col items-center animate-pulse">
          <div className="text-gray-500 text-sm mb-4 tracking-[0.5em]">
            SYSTEM_DORMANT
          </div>
          <button
            onClick={handlePowerOn}
            className="absolute bottom-12 right-32 p-6 rounded-full border border-cyan-900/40 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all duration-700 group"
          >
            <Power className="w-8 h-8 text-cyan-900 group-hover:text-cyan-400 transition-colors" />
          </button>
        </div>
      )}

      {/* 阶段 2: 启动序列动画 (Booting) */}
      {stage === "booting" && (
        <div className="w-full max-w-md p-8 border-l border-cyan-900/30">
          <div className="mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 animate-pulse" />
            <span className="text-xs text-cyan-500 uppercase tracking-widest">
              Initial_Boot_Sequence
            </span>
          </div>
          <div className="space-y-3 text-sm">
            {bootLogs.map((log, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="opacity-40 text-cyan-600">
                  [{idx.toString().padStart(2, "0")}]
                </span>
                <span className="text-green-400 tracking-tighter animate-in fade-in slide-in-from-left-1">
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 阶段 3 & 4: 锁定界面与解锁动画 (Locked / Unlocking / Denied) */}
      {(stage === "locked" || stage === "unlocking" || stage === "denied") && (
        <div className="relative w-full max-w-4xl h-[600px] flex items-center justify-center">
          {/* 背景全息投影环 */}
          <div className="absolute w-[520px] h-[520px] border border-cyan-500/5 rounded-full animate-[spin_30s_linear_infinite]" />
          <div className="absolute w-[440px] h-[440px] border border-purple-500/5 rounded-full animate-[spin_20s_linear_infinite_reverse]" />

          {/* 错误状态红色遮罩 */}
          {stage === "denied" && (
            <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />
          )}

          <div
            className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${
              stage === "unlocking"
                ? "scale-125 opacity-0 blur-2xl"
                : stage === "denied"
                ? "animate-shake"
                : "scale-100 opacity-100"
            }`}
          >
            {/* 六边形全息核心 */}
            <div className="relative mb-14">
              <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full animate-pulse" />
              <svg
                width="140"
                height="140"
                viewBox="0 0 100 100"
                className="relative drop-shadow-[0_0_20px_rgba(0,242,255,0.6)]"
              >
                <polygon
                  points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    strokeDasharray: "300",
                    strokeDashoffset: "300",
                    animation: "dash 5s linear infinite",
                  }}
                />
                <foreignObject x="30" y="30" width="40" height="40">
                  <div className="flex items-center justify-center h-full">
                    <Lock className="w-8 h-8 text-cyan-400/80" />
                  </div>
                </foreignObject>
              </svg>
            </div>

            <div className="text-center space-y-3 mb-12">
              <h1 className="text-4xl font-black tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">
                量子密匣
              </h1>
              <p className="text-xs text-cyan-600 tracking-[0.2em] uppercase italic">
                Neural_Encryption_Status: Active
              </p>
              {stage === "denied" && (
                <p className="text-sm text-red-400 font-bold tracking-wider animate-pulse">
                  [ ACCESS_DENIED ]
                </p>
              )}
            </div>

            {/* 极简风格输入 */}
            <form onSubmit={handleUnlock} className="w-72 relative group">
              <input
                autoFocus
                type="text"
                placeholder="请输入邀请码..."
                value={inviteCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setInviteCode(e.target.value)
                }
                className={`w-full bg-transparent border-b ${
                  stage === "denied"
                    ? "border-red-500"
                    : "border-cyan-900/50 focus:border-cyan-400"
                } outline-none py-2 text-center tracking-[0.4em] transition-all placeholder:text-cyan-900/50 placeholder:tracking-normal text-cyan-50 uppercase`}
                disabled={stage === "denied"}
              />
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="text-xs text-cyan-600 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                >
                  <Share2 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  如何获取邀请码?
                </button>
              </div>
            </form>
          </div>

          {/* 解锁时的粒子反馈 */}
          {stage === "unlocking" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 bg-cyan-400 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* 阶段 5: 认证成功 (Unlocked) */}
      {stage === "unlocked" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000 px-6 text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-green-500/30 blur-[120px] rounded-full" />
            <div className="w-28 h-28 rounded-full border border-green-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.3)]">
              <Unlock className="w-12 h-12 text-green-400 animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-green-400 tracking-[0.3em] mb-6">
            ACCESS_GRANTED
          </h2>
          <div className="p-6 border border-green-500/20 bg-green-950/10 backdrop-blur-3xl rounded-2xl flex items-center gap-5 max-w-sm border-t-green-500/40">
            <Cpu className="text-green-500 animate-spin-slow w-6 h-6 flex-shrink-0" />
            <p className="text-green-100/80 text-xs leading-relaxed text-left">
              量子链路已建立。AI 核心逻辑已同步至本地终端，您可以开始探索无限可能。
            </p>
          </div>
          <button
            onClick={handleReset}
            className="mt-20 text-xs text-gray-600 hover:text-red-700 transition-all tracking-[0.5em]"
          >
            TERMINATE_SESSION
          </button>
        </div>
      )}

      {/* 微信公众号获取指引弹窗 */}
      {showQR && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-80 bg-[#080808] border border-cyan-500/20 p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,242,255,0.05)] flex flex-col items-center">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-8 right-8 text-cyan-950 hover:text-cyan-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-cyan-400/90 text-xs mb-8 font-bold tracking-[0.2em]">
              关注公众号获取邀请码
            </div>

            {/* 二维码容器 */}
            <div className="relative w-40 h-40 bg-white/95 p-3 rounded-3xl group overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              {/* 真实二维码图片 */}
              <img 
                src="/images/wechat-qrcode.jpg" 
                alt="微信公众号二维码"
                className="w-full h-full object-contain"
              />
              {/* 全息扫描动画 */}
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-cyan-500 shadow-[0_0_10px_#22d3ee] animate-[scan_3s_linear_infinite]" />
            </div>

            <div className="mt-10 text-xs text-cyan-700 text-center space-y-2">
              <p>1. 扫描上方二维码关注频道</p>
              <p>
                2. 回复关键词{" "}
                <span className="text-cyan-400 underline decoration-cyan-400/40">
                  邀请码
                </span>
              </p>
              <p>3. 系统将自动分发临时访问秘钥</p>
            </div>
          </div>
        </div>
      )}

      {/* 边角系统信息装饰 */}
      <div className="absolute bottom-8 left-10 flex items-center gap-4 pointer-events-none">
        <div className="text-[10px] text-cyan-700 tracking-[0.5em] uppercase">
          Neural_Vault_RX_440
        </div>
        <div className="h-[1px] w-8 bg-cyan-700/30" />
        <div className="text-[10px] text-cyan-700/80 font-light">
          OS_KERN: 0x8FA2
        </div>
      </div>

      {/* 内联样式 */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes scan {
          0% {
            top: -5%;
          }
          100% {
            top: 105%;
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
