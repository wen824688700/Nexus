"use client";

import { useState, useRef } from "react";
import { NeonBorder } from "@/components/cyber";
import { Users, X } from "lucide-react";

export function EmailSubscribe() {
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const HOLD_DURATION = 1500; // 1.5秒

  const startHolding = () => {
    setIsHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      if (startTimeRef.current === null) return;

      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress >= 100) {
        setShowModal(true);
        resetProgress();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const stopHolding = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    resetProgress();
  };

  const resetProgress = () => {
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    animationFrameRef.current = null;
  };

  return (
    <>
      <NeonBorder color="magenta" className="rounded-xl">
        <div className="bg-cyber-dark/80 rounded-xl p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <Users className="text-cyber-magenta h-5 w-5" />
            <h3 className="font-orbitron font-bold text-white">寻找 AI 探索者</h3>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-white/70">
            一个人摸索太慢？加入AI爱好者社群，解锁高阶玩法，打造属于自己的数字军团。
          </p>

          {/* 长按按钮 - 机甲玻璃质感 */}
          <button
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onMouseLeave={stopHolding}
            onTouchStart={startHolding}
            onTouchEnd={stopHolding}
            className="group relative w-full overflow-hidden rounded-xl py-4 font-orbitron font-black text-base tracking-widest transition-all duration-300"
            style={{
              background: isHolding
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)"
                : "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              boxShadow: isHolding
                ? "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(0, 0, 0, 0.5), 0 10px 30px -10px rgba(0, 0, 0, 0.5)"
                : "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(0, 0, 0, 0.3), 0 4px 15px -5px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* 玻璃反光层 */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)",
              }}
            />

            {/* 机甲面板纹理 */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                  linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            {/* 充能进度条 - 金属质感 */}
            <div
              className="absolute inset-0 transition-all duration-75 ease-linear"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(251, 191, 36, 0.9) 0%,
                  rgba(245, 158, 11, 0.95) 25%,
                  rgba(234, 179, 8, 1) 50%,
                  rgba(245, 158, 11, 0.95) 75%,
                  rgba(251, 191, 36, 0.9) 100%)`,
                clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.3)",
              }}
            />

            {/* 进度条高光 */}
            {isHolding && progress > 0 && (
              <div
                className="pointer-events-none absolute inset-y-0 w-20 transition-all duration-75"
                style={{
                  left: `${Math.max(0, progress - 10)}%`,
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                  filter: "blur(8px)",
                }}
              />
            )}

            {/* 能量脉冲 - 从中心扩散 */}
            {isHolding && (
              <>
                <div
                  className="absolute inset-0 animate-pulse rounded-xl"
                  style={{
                    background: `radial-gradient(circle at ${progress}% 50%, 
                      rgba(251, 191, 36, 0.2) 0%, 
                      transparent 60%)`,
                  }}
                />
                <div
                  className="absolute inset-0 animate-ping rounded-xl opacity-20"
                  style={{
                    background: `radial-gradient(circle at ${progress}% 50%, 
                      rgba(251, 191, 36, 0.4) 0%, 
                      transparent 40%)`,
                    animationDuration: "1s",
                  }}
                />
              </>
            )}

            {/* 扫描线 - 金属光泽 */}
            {isHolding && (
              <div
                className="absolute inset-y-0 w-[2px] transition-all duration-75"
                style={{
                  left: `${progress}%`,
                  background: "linear-gradient(to bottom, transparent, rgba(251, 191, 36, 1), transparent)",
                  boxShadow: "0 0 15px rgba(251, 191, 36, 0.8), 0 0 30px rgba(251, 191, 36, 0.4)",
                  filter: "blur(0.5px)",
                }}
              />
            )}

            {/* 机甲数据流 */}
            {isHolding && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-[fall_1.5s_linear_infinite] font-mono text-xs font-bold"
                    style={{
                      left: `${(i * 10 + progress / 10) % 100}%`,
                      top: "-20px",
                      color: "rgba(251, 191, 36, 0.6)",
                      textShadow: "0 0 5px rgba(251, 191, 36, 0.8)",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  >
                    {["▸", "◂", "▴", "▾", "◆", "◇"][i % 6]}
                  </div>
                ))}
              </div>
            )}

            {/* 能量粒子 - 金属光点 */}
            {isHolding && (
              <div className="pointer-events-none absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-1.5 w-1.5 rounded-full"
                    style={{
                      left: `${(progress - i * 15 + 100) % 100}%`,
                      top: i % 2 === 0 ? "20%" : "80%",
                      background: "radial-gradient(circle, rgba(251, 191, 36, 1), rgba(245, 158, 11, 0.5))",
                      boxShadow: "0 0 8px rgba(251, 191, 36, 0.8), 0 0 15px rgba(251, 191, 36, 0.4)",
                      opacity: progress > i * 15 ? 1 : 0,
                      transition: "opacity 0.3s",
                    }}
                  />
                ))}
              </div>
            )}

            {/* 按钮文字 - 金属质感 */}
            <span
              className="relative z-10 flex items-center justify-center gap-3 transition-all duration-300"
              style={{
                color: isHolding ? "rgba(251, 191, 36, 1)" : "rgba(226, 232, 240, 1)",
                textShadow: isHolding
                  ? "0 1px 2px rgba(0, 0, 0, 0.8), 0 0 10px rgba(251, 191, 36, 0.5)"
                  : "0 1px 2px rgba(0, 0, 0, 0.5)",
              }}
            >
              {isHolding ? (
                <>
                  <span className="animate-pulse">[ 系统充能 ]</span>
                  <span className="font-mono text-lg font-bold tabular-nums">{Math.floor(progress)}%</span>
                  <span className="animate-pulse">[ {progress < 33 ? "▸" : progress < 66 ? "▸▸" : "▸▸▸"} ]</span>
                </>
              ) : (
                <>
                  <Users className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>加入我们</span>
                  <span className="font-mono text-xs opacity-60">[ 长按启动 ]</span>
                </>
              )}
            </span>

            {/* 顶部和底部的金属边缘 */}
            {isHolding && (
              <>
                <div
                  className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-75"
                  style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 8px rgba(251, 191, 36, 0.8)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-75"
                  style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 8px rgba(251, 191, 36, 0.8)",
                  }}
                />
              </>
            )}

            {/* 机甲角落装饰 - 立体感 */}
            {isHolding && progress > 20 && (
              <>
                <div
                  className="absolute top-0 left-0 h-5 w-5 border-l-2 border-t-2 border-amber-400"
                  style={{
                    boxShadow: "inset 1px 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                />
                <div
                  className="absolute top-0 right-0 h-5 w-5 border-r-2 border-t-2 border-amber-400"
                  style={{
                    boxShadow: "inset -1px 1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-amber-400"
                  style={{
                    boxShadow: "inset 1px -1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-amber-400"
                  style={{
                    boxShadow: "inset -1px -1px 0 rgba(255, 255, 255, 0.3)",
                  }}
                />
              </>
            )}

            {/* 完成时的能量爆发 */}
            {progress >= 99 && (
              <div
                className="absolute inset-0 animate-ping rounded-xl"
                style={{
                  background: "rgba(251, 191, 36, 0.3)",
                  animationDuration: "0.5s",
                }}
              />
            )}
          </button>

          <style jsx>{`
            @keyframes fall {
              from {
                transform: translateY(0);
                opacity: 0;
              }
              50% {
                opacity: 1;
              }
              to {
                transform: translateY(100px);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      </NeonBorder>

      {/* 公众号弹窗 - 赛博朋克风格 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setShowModal(false)}
        >
          <div
            className="group relative h-[520px] w-full max-w-4xl overflow-hidden rounded-3xl shadow-[0_0_100px_rgba(0,255,255,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 背景图片层 */}
            <div className="absolute inset-0">
              <img
                src="/images/wechat-bg.jpg"
                alt="Background"
                className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-70"
              />
              {/* 多层渐变叠加 */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            {/* 扫描线效果 */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.03)_50%)] bg-[length:100%_4px] opacity-30" />

            {/* 边框光效 */}
            <div className="absolute inset-0 rounded-3xl border border-cyan-500/30 shadow-[inset_0_0_60px_rgba(0,255,255,0.1)]" />

            {/* 关闭按钮 */}
            <button
              onClick={() => setShowModal(false)}
              className="group/close absolute top-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/60 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            >
              <X className="h-5 w-5 text-white/60 transition-colors group-hover/close:text-cyan-400" />
            </button>

            {/* 内容容器 */}
            <div className="relative z-10 flex h-full items-end p-10">
              <div className="grid w-full grid-cols-[1.2fr_1fr] gap-12">
                {/* 左侧：文字内容 */}
                <div className="flex flex-col justify-end space-y-5 pb-3">
                  {/* 主标题 */}
                  <div className="space-y-2">
                    <h2 className="font-orbitron text-4xl font-black leading-tight tracking-tight text-white">
                      <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                        扫码关注
                      </span>
                      <br />
                      <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        公众号
                      </span>
                    </h2>
                    
                    {/* 副标题 */}
                    <div className="inline-block rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 backdrop-blur-sm">
                      <p className="font-mono text-base text-cyan-300">
                        回复 <span className="font-bold text-cyan-100">"AI资料大礼包"</span>
                      </p>
                    </div>
                  </div>

                  {/* 福利列表 */}
                  <div className="space-y-2.5">
                    {[
                      { icon: "📦", text: "免费领取我的 AI 资料包" },
                      { icon: "🎯", text: "获取高阶提示词与构建指南" },
                      { icon: "💬", text: "进入 AI 爱好者社群交流" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="group/item flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/40 hover:bg-black/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <span className="text-xl transition-transform duration-300 group-hover/item:scale-110">
                          {item.icon}
                        </span>
                        <span className="text-sm text-white/90 transition-colors group-hover/item:text-white">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右侧：二维码 */}
                <div className="flex items-end justify-end pb-3">
                  <div className="group/qr relative">
                    {/* 二维码外发光 */}
                    <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover/qr:opacity-100" />
                    
                    {/* 二维码容器 */}
                    <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-white p-4 shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all duration-500 group-hover/qr:border-cyan-400/60 group-hover/qr:shadow-[0_0_60px_rgba(0,255,255,0.5)]">
                      {/* 角落装饰 */}
                      <div className="absolute top-0 left-0 h-5 w-5 border-l-2 border-t-2 border-cyan-400" />
                      <div className="absolute top-0 right-0 h-5 w-5 border-r-2 border-t-2 border-cyan-400" />
                      <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-cyan-400" />
                      
                      <img
                        src="/images/wechat-qrcode.jpg"
                        alt="微信公众号二维码"
                        className="relative h-40 w-40 transition-transform duration-500 group-hover/qr:scale-105"
                      />
                    </div>

                    {/* 扫描提示 */}
                    <div className="mt-3 text-center">
                      <p className="font-mono text-xs text-cyan-400/80">
                        [ SCAN TO JOIN ]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部装饰线 */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
}
