"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HolographicCard, CyberButton } from "@/components/cyber";
import { Rocket, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="cta-content">
          <HolographicCard intensity="high">
            <div className="p-12 text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 mb-8">
                <Rocket className="w-10 h-10 text-cyber-cyan" />
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold text-white mb-6 leading-tight px-4">
                准备好开始你的{" "}
                <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI 之旅
                </span>{" "}
                了吗？
              </h2>

              {/* Description */}
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                加入我们，探索 AI 的无限可能。
                从今天开始，让 AI 成为你的超级助手。
              </p>

              {/* CTA Button */}
              <Link href="/agents">
                <CyberButton size="lg" className="group">
                  <span className="mr-2">立即开始</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </CyberButton>
              </Link>
            </div>
          </HolographicCard>
        </div>
      </div>
    </section>
  );
}
