"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlitchText, HolographicCard } from "@/components/cyber";
import { Rss, Sparkles, Bot, BookText, Users } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    tag: "情报去噪",
    title: "全网情报",
    description: "自动聚合 AI 资讯，过滤噪音，只看精华。",
    icon: Rss,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    tag: "提示词重塑",
    title: "一键优化",
    description: "智能优化你的 Prompt，让 AI 更懂你的需求。",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    tag: "数字员工",
    title: "Agent 中心",
    description: "精选实用 AI 工具，一键调用，为你提效。",
    icon: Bot,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    tag: "实战 SOP",
    title: "AI 实战手册",
    description: "深度长文、工具玩法、项目复盘，记录探索之旅。",
    icon: BookText,
    gradient: "from-orange-500 to-red-500",
  },
  {
    tag: "先锋连接",
    title: "超级个体",
    description: "加入 AI 社群，用AI提效或是打造超级个体。",
    icon: Users,
    gradient: "from-indigo-500 to-purple-500",
  },
];

export function CoreFeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <GlitchText
            as="h2"
            className="font-orbitron mb-4 text-3xl font-bold text-white md:text-5xl"
          >
            为你准备的 AI 工具库
          </GlitchText>
          <p className="text-lg text-white/60">五大核心功能，助力你的 AI 之旅</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <HolographicCard intensity="medium">
                <div className="flex h-full flex-col p-6">
                  {/* Tag */}
                  <div className="mb-4">
                    <span className="text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30 rounded-full border px-3 py-1 font-mono text-xs">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4 flex items-center justify-center opacity-20`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-orbitron mb-3 text-xl font-bold text-white">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="flex-1 text-sm leading-relaxed text-white/60">
                    {feature.description}
                  </p>

                  {/* Hover Effect Line */}
                  <div className="from-cyber-cyan mt-4 h-0.5 w-0 bg-gradient-to-r to-transparent transition-all duration-500 group-hover:w-full" />
                </div>
              </HolographicCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
