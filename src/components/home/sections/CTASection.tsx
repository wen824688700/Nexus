"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HolographicCard, CyberButton } from "@/components/cyber";
import { Rocket, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { user, openAuthModal } = useAuth();

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
    <section ref={sectionRef} className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="cta-content">
          <HolographicCard intensity="high">
            <div className="p-12 text-center">
              {/* Icon */}
              <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full border bg-gradient-to-br">
                <Rocket className="text-cyber-cyan h-10 w-10" />
              </div>

              {/* Title */}
              <h2 className="font-orbitron mb-6 px-4 text-2xl leading-tight font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">
                准备好开始你的{" "}
                <span className="inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI 之旅
                </span>{" "}
                了吗？
              </h2>

              {/* Description */}
              <p className="mx-auto mb-8 max-w-2xl text-lg text-white/60">
                加入我们，探索 AI 的无限可能。 从今天开始，让 AI 成为你的超级助手。
              </p>

              {/* CTA Button */}
              {user ? (
                <Link href="/agents">
                  <CyberButton size="lg" className="group">
                    <span className="mr-2">立即开始</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </CyberButton>
                </Link>
              ) : (
                <CyberButton size="lg" className="group" onClick={() => openAuthModal("login")}>
                  <span className="mr-2">立即开始</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </CyberButton>
              )}
            </div>
          </HolographicCard>
        </div>
      </div>
    </section>
  );
}
