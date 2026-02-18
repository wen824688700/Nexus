"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlitchText, HolographicCard } from "@/components/cyber";
import { Filter, Wand2, Radio } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const painPoints = [
  {
    icon: Filter,
    title: "信息噪音",
    description: "AI 资讯铺天盖地，真正有价值的内容却难以筛选。",
    color: "cyan" as const,
  },
  {
    icon: Wand2,
    title: "上手困难",
    description: "工具太多不知从何开始，缺少系统化的学习路径。",
    color: "magenta" as const,
  },
  {
    icon: Radio,
    title: "价值黑箱",
    description: "不知道 AI 能为自己带来什么实际价值和效率提升。",
    color: "purple" as const,
  },
];

export function PainPointsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".pain-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
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
    <section ref={sectionRef} className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <GlitchText
            as="h2"
            className="font-orbitron mb-4 text-3xl font-bold text-white md:text-5xl"
          >
            你是否也有这些困扰？
          </GlitchText>
          <p className="text-lg text-white/60">在 AI 时代，这些痛点阻碍了我们的效率提升</p>
        </div>

        {/* Pain Point Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {painPoints.map((point, index) => (
            <div key={index} className="pain-card">
              <HolographicCard intensity="medium">
                <div className="flex h-full flex-col p-8">
                  {/* Icon */}
                  <div
                    className={`h-16 w-16 rounded-xl bg-gradient-to-br from-cyber-${point.color}/20 to-cyber-${point.color}/5 mb-6 flex items-center justify-center border border-cyber-${point.color}/30`}
                  >
                    <point.icon className={`h-8 w-8 text-cyber-${point.color}`} />
                  </div>

                  {/* Title */}
                  <GlitchText
                    as="h3"
                    className="font-orbitron mb-4 text-2xl font-bold text-white"
                    intensity="low"
                  >
                    {point.title}
                  </GlitchText>

                  {/* Description */}
                  <p className="flex-1 leading-relaxed text-white/60">{point.description}</p>

                  {/* Decorative Line */}
                  <div
                    className={`mt-6 h-1 w-20 bg-gradient-to-r from-cyber-${point.color} rounded-full to-transparent`}
                  />
                </div>
              </HolographicCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
