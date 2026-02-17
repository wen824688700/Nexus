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
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <GlitchText
            as="h2"
            className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-4"
          >
            你是否也有这些困扰？
          </GlitchText>
          <p className="text-white/60 text-lg">
            在 AI 时代，这些痛点阻碍了我们的效率提升
          </p>
        </div>

        {/* Pain Point Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, index) => (
            <div key={index} className="pain-card">
              <HolographicCard intensity="medium">
                <div className="p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br from-cyber-${point.color}/20 to-cyber-${point.color}/5 flex items-center justify-center mb-6 border border-cyber-${point.color}/30`}
                  >
                    <point.icon className={`w-8 h-8 text-cyber-${point.color}`} />
                  </div>

                  {/* Title */}
                  <GlitchText
                    as="h3"
                    className="text-2xl font-orbitron font-bold text-white mb-4"
                    intensity="low"
                  >
                    {point.title}
                  </GlitchText>

                  {/* Description */}
                  <p className="text-white/60 leading-relaxed flex-1">
                    {point.description}
                  </p>

                  {/* Decorative Line */}
                  <div className={`mt-6 h-1 w-20 bg-gradient-to-r from-cyber-${point.color} to-transparent rounded-full`} />
                </div>
              </HolographicCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
