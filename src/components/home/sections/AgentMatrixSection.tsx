"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HolographicCard } from "@/components/cyber";
import {
  Wand2,
  Music,
  Clapperboard,
  BarChart3,
  Image as ImageIcon,
  User,
  Cpu,
  Plus,
  ArrowUpRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const agents = [
  {
    id: "prompt",
    title: "提示词优化器",
    desc: "结构化补全 / 逻辑增强",
    icon: Wand2,
    color: "cyan" as const,
  },
  {
    id: "audio",
    title: "音频风格分析",
    desc: "10维度解构 / 风格识别",
    icon: Music,
    color: "blue" as const,
  },
  {
    id: "seedance",
    title: "Seedance 分镜",
    desc: "创意转脚本 / 视频流生成",
    icon: Clapperboard,
    color: "pink" as const,
  },
  {
    id: "data",
    title: "数据分析智能体",
    desc: "自动图表 / 深度洞察",
    icon: BarChart3,
    color: "emerald" as const,
  },
  {
    id: "image",
    title: "图像编辑大师",
    desc: "智能抠图 / 画质增强",
    icon: ImageIcon,
    color: "purple" as const,
  },
  {
    id: "portrait",
    title: "专业肖像生成",
    desc: "Vogue级质感 / 风格定制",
    icon: User,
    color: "fuchsia" as const,
  },
];

export function AgentMatrixSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate header
      gsap.from(".matrix-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animate agent cards
      gsap.from(".agent-card", {
        scrollTrigger: {
          trigger: ".agent-grid",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      // Animate loading card
      gsap.from(".loading-card", {
        scrollTrigger: {
          trigger: ".loading-card",
          start: "top 90%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[700px] md:min-h-[800px] items-center justify-center overflow-hidden px-4 py-20 md:py-24"
    >
      {/* Background Layer */}
      <div className="pointer-events-none absolute inset-0">
        {/* Tilted Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            transform: "perspective(500px) rotateX(60deg) translateY(-100px) scale(1.5)",
            maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          }}
        />
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-900/20 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="matrix-header mb-8 md:mb-12 flex flex-col justify-between gap-4 md:gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-orbitron text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              智能体
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                中心
              </span>
            </h2>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-3 md:gap-6 rounded-lg border border-white/5 bg-[#0a0a0a]/50 p-2.5 md:p-3 text-xs md:text-sm font-mono text-gray-500 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
              <span className="text-green-400">SYSTEM ONLINE</span>
            </div>
            <div className="hidden h-3 md:h-4 w-[1px] bg-white/10 sm:block" />
            <div className="hidden sm:block">NODES: {agents.length} Active</div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="agent-grid mb-4 md:mb-5 grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card group">
              <HolographicCard intensity="medium">
                <div className="relative flex h-[160px] md:h-[180px] cursor-pointer flex-col justify-between overflow-hidden p-5 md:p-6 transition-all duration-300 group-hover:-translate-y-1">
                  {/* Card Shine Effect */}
                  <div className="pointer-events-none absolute left-[-150%] top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] transition-all duration-700 ease-in-out group-hover:left-[200%]" />

                  {/* Top: Icon & Status */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl border border-white/5 bg-white/5 shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                        agent.color === "cyan"
                          ? "text-cyan-400"
                          : agent.color === "blue"
                            ? "text-blue-400"
                            : agent.color === "pink"
                              ? "text-pink-400"
                              : agent.color === "emerald"
                                ? "text-emerald-400"
                                : agent.color === "purple"
                                  ? "text-purple-400"
                                  : "text-fuchsia-400"
                      }`}
                    >
                      <agent.icon size={20} className="md:hidden" />
                      <agent.icon size={24} className="hidden md:block" />
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5 rounded-full border border-white/5 bg-black/40 px-1.5 md:px-2 py-0.5 md:py-1">
                      <div className="h-1 w-1 md:h-1.5 md:w-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                      <span className="font-mono text-[9px] md:text-[10px] tracking-wider text-gray-400">ON</span>
                    </div>
                  </div>

                  {/* Bottom: Text & Action */}
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="mb-1 text-base md:text-lg font-bold text-white transition-colors group-hover:text-cyan-100">
                        {agent.title}
                      </h3>
                      <p className="font-mono text-[10px] md:text-xs tracking-tight text-gray-500 transition-colors group-hover:text-gray-400">
                        {agent.desc}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <div className="translate-x-[-10px] text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      <ArrowUpRight size={18} className="md:hidden" />
                      <ArrowUpRight size={20} className="hidden md:block" />
                    </div>
                  </div>
                </div>
              </HolographicCard>
            </div>
          ))}
        </div>

        {/* Loading Placeholder */}
        <div className="loading-card relative mt-3 md:mt-4 flex h-14 md:h-16 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/5 bg-[#0a0a0a]/30">
          <div className="absolute inset-0 animate-[shine_3s_linear_infinite] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%]" />
          <div className="flex items-center gap-2 md:gap-3 text-gray-500 transition-colors group-hover:text-cyan-400">
            <Plus size={14} className="animate-spin-slow md:hidden" />
            <Plus size={16} className="animate-spin-slow hidden md:block" />
            <span className="text-xs md:text-sm font-mono tracking-widest">更多智能体节点正在接入中...</span>
            <div className="ml-1 md:ml-2 flex gap-1">
              <span
                className="h-1 w-1 animate-bounce rounded-full bg-current"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="h-1 w-1 animate-bounce rounded-full bg-current"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="h-1 w-1 animate-bounce rounded-full bg-current"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 200%;
          }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
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
    </section>
  );
}
