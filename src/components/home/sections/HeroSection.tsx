"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { TypewriterText } from "@/components/cyber";
import { ArrowRight, Sparkles, BookOpen, Mail } from "lucide-react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-item", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative flex min-h-screen items-center px-4 pt-24 pb-16">
      {/* Cyberpunk Grid Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            transform: "perspective(500px) rotateX(60deg)",
            transformOrigin: "center top",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: 产品介绍 */}
          <div className="space-y-8">
            <div className="hero-item">
              <TypewriterText
                text="独立开发者的 AI 探索之旅|"
                className="text-cyber-cyan mb-4 font-mono text-sm md:text-base"
              />
            </div>

            <div className="hero-item">
              <h1 className="mb-6 text-5xl leading-tight font-black md:text-7xl">
                <span className="text-[#00a6ff]">A</span>
                <span className="text-[#ff0066]">I</span>
                <span className="text-white"> 赋能</span>
                <br />
                <span className="text-white">创造 </span>
                <span className="group inline-flex">
                  <span className="inline-block text-emerald-400 transition-all duration-200 group-hover:animate-[shake_1.2s_ease-in-out_infinite] group-hover:[animation-delay:0ms]">
                    无
                  </span>
                  <span className="inline-block text-blue-400 transition-all duration-200 group-hover:animate-[shake_1.2s_ease-in-out_infinite] group-hover:[animation-delay:150ms]">
                    限
                  </span>
                  <span className="inline-block text-amber-400 transition-all duration-200 group-hover:animate-[shake_1.2s_ease-in-out_infinite] group-hover:[animation-delay:300ms]">
                    可
                  </span>
                  <span className="inline-block text-pink-400 transition-all duration-200 group-hover:animate-[shake_1.2s_ease-in-out_infinite] group-hover:[animation-delay:450ms]">
                    能
                  </span>
                </span>
              </h1>
            </div>

            <div className="hero-item">
              <p className="max-w-xl text-lg leading-relaxed text-white/60">
                从信息噪音中解脱，用 AI 工具箱加速你的工作流。探索实战 SOP，连接超级个体社群。
              </p>
            </div>

            {/* 快速入口 */}
            <div className="hero-item flex flex-wrap gap-4">
              <Link href="/agents">
                <button className="group relative overflow-hidden rounded-xl px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/50">
                  <div className="from-cyber-cyan absolute inset-0 bg-gradient-to-r via-blue-500 to-purple-500" />
                  <div className="relative flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span>探索智能体</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </Link>
              <Link href="/knowledge">
                <button className="group border-cyber-cyan/50 hover:border-cyber-cyan hover:bg-cyber-cyan/10 rounded-xl border-2 px-8 py-4 font-bold text-white transition-all">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>阅读知识库</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Cyberpunk ProfileCard */}
          <div className="hero-item">
            <div className="relative">
              {/* Main Card */}
              <div className="border-cyber-cyan/30 relative rounded-2xl border bg-[#0a0f1a] p-8 backdrop-blur-xl">
                {/* Avatar & Name */}
                <div className="mb-6 flex items-start gap-6">
                  <div className="relative h-24 w-24">
                    {/* Outer Glow Effect - Multiple Layers */}
                    <div className="from-cyber-cyan absolute inset-0 animate-pulse rounded-full bg-gradient-to-br via-cyan-400 to-cyan-600 opacity-40 blur-2xl" />
                    <div className="to-cyber-cyan absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 opacity-30 blur-xl" />

                    {/* Avatar Container */}
                    <div className="border-cyber-cyan/60 relative h-24 w-24 overflow-hidden rounded-full border-2 shadow-[0_0_30px_rgba(6,182,212,0.5),0_0_60px_rgba(6,182,212,0.3)]">
                      <div className="from-cyber-cyan/30 to-cyber-purple/30 absolute inset-0 bg-gradient-to-br" />
                      <img
                        src="/avatar.jpg"
                        alt="Avatar"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {/* Online Status */}
                      <div className="absolute right-1 bottom-1 h-4 w-4 animate-pulse rounded-full border-2 border-[#0a0f1a] bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/40 rounded-md border px-3 py-1 font-mono text-xs">
                        独立开发者
                      </span>
                      <span className="rounded-md border border-purple-500/40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 bg-clip-text px-3 py-1 font-mono text-xs text-transparent">
                        <span className="text-purple-400">AI 探索者</span>
                      </span>
                    </div>
                    <h3 className="font-orbitron mb-2 text-3xl font-bold text-white">
                      你好，我是{" "}
                      <span className="from-cyber-cyan to-cyber-purple bg-gradient-to-r bg-clip-text text-transparent">
                        Apex 小墨
                      </span>
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6 space-y-4 leading-relaxed text-white/70">
                  <p>👋 你好！我是一名独立开发者，喜欢捣鼓各种AI工具和工作流优化。</p>
                  <p>💡 我相信 AI 不应该是少数人的特权，而应该成为每个人提升效率的助手。</p>
                  <p>🎯 在这里，我分享我的 AI 探索之旅、实验经验和心得体会。</p>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3">
                  {/* WeChat */}
                  <a
                    href="#"
                    className="hover:border-cyber-cyan/50 hover:bg-cyber-cyan/10 group flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all"
                    title="微信"
                  >
                    <svg
                      className="group-hover:text-cyber-cyan h-6 w-6 text-white/60 transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                    </svg>
                  </a>

                  {/* Bilibili */}
                  <a
                    href="#"
                    className="group flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:border-[#00a1d6]/50 hover:bg-[#00a1d6]/10"
                    title="B站"
                  >
                    <svg
                      className="h-6 w-6 text-white/60 transition-colors group-hover:text-[#00a1d6]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z" />
                    </svg>
                  </a>

                  {/* Xiaohongshu (Little Red Book) */}
                  <a
                    href="#"
                    className="group flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:border-[#ff2442]/50 hover:bg-[#ff2442]/10"
                    title="小红书"
                  >
                    <svg
                      className="h-6 w-6 text-white/60 transition-colors group-hover:text-[#ff2442]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.951 17.96a.844.844 0 0 1-.844.844H6.893a.844.844 0 0 1-.844-.844V6.04c0-.466.378-.844.844-.844h10.214c.466 0 .844.378.844.844v11.92zM9.6 8.4h1.2v7.2H9.6V8.4zm3.6 0h1.2v7.2h-1.2V8.4z" />
                    </svg>
                  </a>

                  {/* Douyin (TikTok) */}
                  <a
                    href="#"
                    className="group flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:border-white/50 hover:bg-white/10"
                    title="抖音"
                  >
                    <svg
                      className="h-6 w-6 text-white/60 transition-colors group-hover:text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:your@email.com"
                    className="hover:border-cyber-cyan/50 hover:bg-cyber-cyan/10 group flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all"
                    title="邮箱"
                  >
                    <Mail className="group-hover:text-cyber-cyan h-5 w-5 text-white/60 transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
