"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Power, Lock, Unlock, Terminal, X, Share2, Cpu, Sparkles } from "lucide-react";

type Stage = "standby" | "booting" | "locked" | "unlocking" | "unlocked" | "denied";

export function VaultPage() {
  const [stage, setStage] = useState<Stage>("standby");
  const [showQR, setShowQR] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState("");
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [creditAmount, setCreditAmount] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState(false);

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

  // 处理兑换动作
  const handleRedeem = async (e: FormEvent) => {
    e.preventDefault();
    const code = redemptionCode.trim().toUpperCase();

    if (code.length === 0) {
      return;
    }

    setIsRedeeming(true);
    setErrorMessage("");

    try {
      // 调用兑换 API
      const response = await fetch("/api/redemption/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // 兑换成功
        setStage("unlocking");
        setCreditAmount(data.amount);
        // 模拟 2 秒的破解动画
        setTimeout(() => setStage("unlocked"), 2000);
      } else {
        // 兑换失败
        setErrorMessage(data.error || "兑换失败，请检查兑换码");
        setStage("denied");
        setTimeout(() => {
          setStage("locked");
          setRedemptionCode("");
          setErrorMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Redemption error:", error);
      setErrorMessage("网络错误，请稍后重试");
      setStage("denied");
      setTimeout(() => {
        setStage("locked");
        setRedemptionCode("");
        setErrorMessage("");
      }, 2000);
    } finally {
      setIsRedeeming(false);
    }
  };

  // 重置会话
  const handleReset = () => {
    setStage("standby");
    setRedemptionCode("");
    setBootLogs([]);
    setErrorMessage("");
    setCreditAmount(0);
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#050505] font-mono text-cyan-400 select-none">
      {/* 隐藏音乐播放器 */}
      <style jsx global>{`
        .floating-music-player {
          display: none !important;
        }
      `}</style>

      {/* 赛博底噪与扫描线效果 */}
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden opacity-[0.04]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      </div>

      {/* 阶段 1: 系统待机 (Standby) */}
      {stage === "standby" && (
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 text-sm tracking-[0.5em] text-gray-500">SYSTEM_DORMANT</div>
          <button
            onClick={handlePowerOn}
            className="group absolute right-32 bottom-12 rounded-full border border-cyan-900/40 p-6 transition-all duration-700 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]"
          >
            <Power className="h-8 w-8 text-cyan-900 transition-colors group-hover:text-cyan-400" />
          </button>
        </div>
      )}

      {/* 阶段 2: 启动序列动画 (Booting) */}
      {stage === "booting" && (
        <div className="w-full max-w-md border-l border-cyan-900/30 p-8">
          <div className="mb-6 flex items-center gap-2">
            <Terminal className="h-5 w-5 animate-pulse" />
            <span className="text-xs tracking-widest text-cyan-500 uppercase">
              Initial_Boot_Sequence
            </span>
          </div>
          <div className="space-y-3 text-sm">
            {bootLogs.map((log, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="text-cyan-600 opacity-40">
                  [{idx.toString().padStart(2, "0")}]
                </span>
                <span className="animate-in fade-in slide-in-from-left-1 tracking-tighter text-green-400">
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 阶段 3 & 4: 锁定界面与解锁动画 (Locked / Unlocking / Denied) */}
      {(stage === "locked" || stage === "unlocking" || stage === "denied") && (
        <div className="relative flex h-[600px] w-full max-w-4xl items-center justify-center">
          {/* 背景全息投影环 */}
          <div className="absolute h-[520px] w-[520px] animate-[spin_30s_linear_infinite] rounded-full border border-cyan-500/5" />
          <div className="absolute h-[440px] w-[440px] animate-[spin_20s_linear_infinite_reverse] rounded-full border border-purple-500/5" />

          {/* 错误状态红色遮罩 */}
          {stage === "denied" && (
            <div className="pointer-events-none absolute inset-0 animate-pulse bg-red-500/20" />
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
              <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/10 blur-[60px]" />
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
                  <div className="flex h-full items-center justify-center">
                    <Lock className="h-8 w-8 text-cyan-400/80" />
                  </div>
                </foreignObject>
              </svg>
            </div>

            <div className="mb-12 space-y-3 text-center">
              <p className="text-xs tracking-[0.2em] text-cyan-600 uppercase italic">
                Credit_Redemption_Portal
              </p>
              {stage === "denied" && errorMessage && (
                <p className="animate-pulse text-sm font-bold tracking-wider text-red-400">
                  [ {errorMessage} ]
                </p>
              )}
            </div>

            {/* 极简风格输入 */}
            <form onSubmit={handleRedeem} className="group relative w-80">
              <input
                autoFocus
                type="text"
                placeholder="请输入兑换码 (Apex-XXXX-XXXX)..."
                value={redemptionCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRedemptionCode(e.target.value)}
                className={`w-full border-b bg-transparent ${
                  stage === "denied" ? "border-red-500" : "border-cyan-900/50 focus:border-cyan-400"
                } py-2 text-center tracking-[0.3em] text-cyan-50 uppercase transition-all outline-none placeholder:tracking-normal placeholder:text-cyan-900/50`}
                disabled={stage === "denied" || isRedeeming}
              />
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="group flex items-center gap-2 text-xs text-cyan-600 transition-colors hover:text-cyan-400"
                >
                  <Share2 className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
                  如何获取兑换码?
                </button>
              </div>
            </form>
          </div>

          {/* 解锁时的粒子反馈 */}
          {stage === "unlocking" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 animate-ping rounded-full bg-cyan-400 opacity-20" />
              <div className="absolute inset-0 animate-pulse bg-white/5" />
            </div>
          )}
        </div>
      )}

      {/* 阶段 5: 兑换成功 (Unlocked) */}
      {stage === "unlocked" && (
        <div className="animate-in fade-in zoom-in flex flex-col items-center px-6 text-center duration-1000">
          <div className="relative mb-10">
            <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/30 blur-[120px]" />
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-green-500/40 shadow-[0_0_60px_rgba(34,197,94,0.3)]">
              <Sparkles className="h-14 w-14 animate-pulse text-green-400" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-[0.3em] text-green-400">兑换成功</h2>
          <div className="mb-8 animate-pulse bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-5xl font-black text-transparent">
            +{creditAmount} 积分
          </div>
          <div className="flex max-w-md items-center gap-5 rounded-2xl border border-green-500/20 border-t-green-500/40 bg-green-950/10 p-6 backdrop-blur-3xl">
            <Cpu className="animate-spin-slow h-6 w-6 flex-shrink-0 text-green-500" />
            <p className="text-left text-xs leading-relaxed text-green-100/80">
              积分已成功充值到您的账户。现在您可以尽情使用各种 AI 智能体服务，探索无限可能。
            </p>
          </div>
          <button
            onClick={handleReset}
            className="mt-16 text-xs tracking-[0.3em] text-gray-600 transition-all hover:tracking-[0.5em] hover:text-cyan-400"
          >
            继续兑换
          </button>
        </div>
      )}

      {/* 微信联系管理员弹窗 */}
      {showQR && (
        <div className="animate-in fade-in absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl duration-500">
          <div className="relative flex w-80 flex-col items-center rounded-[2.5rem] border border-cyan-500/20 bg-[#080808] p-10 shadow-[0_0_80px_rgba(0,242,255,0.05)]">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-8 right-8 text-cyan-950 transition-colors hover:text-cyan-500"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-xs font-bold tracking-[0.2em] text-cyan-400/90">
              请联系管理员获取
            </div>

            {/* 微信二维码容器 */}
            <div className="group relative h-40 w-40 overflow-hidden rounded-3xl bg-white/95 p-3 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              {/* 微信二维码图片 */}
              <img
                src="/images/wechat.jpg"
                alt="管理员微信二维码"
                className="h-full w-full object-contain"
              />
              {/* 全息扫描动画 */}
              <div className="absolute top-0 left-0 h-[1.5px] w-full animate-[scan_3s_linear_infinite] bg-cyan-500 shadow-[0_0_10px_#22d3ee]" />
            </div>

            <div className="mt-10 space-y-2 text-center text-xs text-cyan-700">
              <p>扫描上方二维码添加管理员微信</p>
              <p className="text-cyan-400">获取兑换码</p>
            </div>
          </div>
        </div>
      )}

      {/* 边角系统信息装饰 */}
      <div className="pointer-events-none absolute bottom-8 left-10 flex items-center gap-4">
        <div className="text-[10px] tracking-[0.5em] text-cyan-700 uppercase">
          Neural_Vault_RX_440
        </div>
        <div className="h-[1px] w-8 bg-cyan-700/30" />
        <div className="text-[10px] font-light text-cyan-700/80">OS_KERN: 0x8FA2</div>
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
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
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
