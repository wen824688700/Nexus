"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlitchText, HolographicCard } from "@/components/cyber";
import { Network, Cpu, BrainCircuit } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    icon: Network,
    title: "全知视野",
    subtitle: "OMNISCIENCE",
    description: "抹平信息差，抢占认知高地。全自动化的情报抓取网络，帮你过滤 99% 的噪音，让你掌握第一手核心情报。",
    color: "cyan" as const,
  },
  {
    icon: Cpu,
    title: "AI 赋能",
    subtitle: "EMPOWERMENT",
    description: "无需懂代码，也能驾驭 AI。集结提示词优化、数据分析等硬核智能体，让 AI 成为你 24 小时待命的超级员工。",
    color: "magenta" as const,
  },
  {
    icon: BrainCircuit,
    title: "思维重塑",
    subtitle: "RESHAPING",
    description: "授人以鱼不如授人以渔。在共学社群中分享探索心得，打破认知壁垒，重塑驾驭 AI 的底层思维。",
    color: "purple" as const,
  },
];

export function ProductIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".intro-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".pillar-card", {
        scrollTrigger: {
          trigger: ".pillar-grid",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative px-4 py-20 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="intro-header mb-16 text-center">
          <h2 className="font-orbitron mb-6 text-3xl font-bold leading-tight text-white md:text-5xl">
            欢迎来到我的数字基站，
            <br />
            一座持续进化的{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              个人 AI 实验室
            </span>
            。
          </h2>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/60">
            在这里，我将自己打造的 AI 智能体、沉淀的实战 SOP，以及探索"AI"的经验与你分享。
            <br />
            APEX 将{" "}
            <span className="font-bold text-white">情报 (Intel)</span>、
            <span className="font-bold text-white">工具 (Tools)</span> 与{" "}
            <span className="font-bold text-white">知识 (Knowledge)</span> 封装为一体。
          </p>
        </div>

        <div className="pillar-grid grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <div key={index} className="pillar-card group">
              <HolographicCard intensity="medium">
                <div className="relative flex h-full flex-col p-8 transition-all duration-500 group-hover:-translate-y-2">
                  <div
                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-xl border bg-white/5 transition-all duration-500 ${
                      pillar.color === "cyan"
                        ? "border-cyan-500/30 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                        : pillar.color === "magenta"
                          ? "border-pink-500/30 group-hover:border-pink-500/50 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]"
                          : "border-purple-500/30 group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                    }`}
                  >
                    <pillar.icon
                      className={`h-8 w-8 ${
                        pillar.color === "cyan"
                          ? "text-cyan-400"
                          : pillar.color === "magenta"
                            ? "text-pink-400"
                            : "text-purple-400"
                      }`}
                    />
                  </div>

                  <div className="mb-4">
                    <GlitchText
                      as="h3"
                      className="font-orbitron mb-1 text-2xl font-bold text-white transition-transform group-hover:translate-x-1"
                      intensity="low"
                    >
                      {pillar.title}
                    </GlitchText>
                    <p
                      className={`font-mono text-xs tracking-widest opacity-60 ${
                        pillar.color === "cyan"
                          ? "text-cyan-400"
                          : pillar.color === "magenta"
                            ? "text-pink-400"
                            : "text-purple-400"
                      }`}
                    >
                      {pillar.subtitle}
                    </p>
                  </div>

                  <p className="mb-6 flex-1 text-sm leading-relaxed text-white/60">
                    {pillar.description}
                  </p>

                  <div
                    className={`h-1 w-20 rounded-full bg-gradient-to-r to-transparent ${
                      pillar.color === "cyan"
                        ? "from-cyan-400"
                        : pillar.color === "magenta"
                          ? "from-pink-400"
                          : "from-purple-400"
                    }`}
                  />
                </div>
              </HolographicCard>
            </div>
          ))}
        </div>

        <div className="mt-16 mx-auto h-[1px] max-w-4xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      </div>
    </section>
  );
}
