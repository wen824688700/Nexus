"use client";

import { Music2 } from "lucide-react";

export default function MusicDemoPage() {
  return (
    <div className="bg-cyber-dark relative min-h-screen overflow-hidden">
      {/* 背景网格 */}
      <div className="bg-grid-pattern absolute inset-0 opacity-20" />

      {/* 内容 */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* 标题 */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-5xl font-bold text-white">
              AI 音乐播放器
              <span className="text-cyber-magenta">演示</span>
            </h1>
            <p className="text-lg text-white/60">赛博朋克风格 · 音频可视化 · 完整功能</p>
          </div>

          {/* 功能卡片 */}
          <div className="mb-12 grid gap-6 md:grid-cols-1">
            {/* 浮动模式 */}
            <div className="bg-cyber-dark/50 rounded-2xl border border-white/10 p-8 backdrop-blur-sm">
              <div className="bg-cyber-magenta/20 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <Music2 className="text-cyber-magenta h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-medium text-white">浮动音乐播放器</h3>
              <p className="mb-6 text-white/60">
                右下角小部件，单击展开控制面板。适合作为全局背景音乐播放器。
              </p>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span>已激活（查看右下角）</span>
              </div>
            </div>
          </div>

          {/* 功能列表 */}
          <div className="border-cyber-magenta/30 bg-cyber-dark/50 rounded-2xl border p-8 backdrop-blur-sm">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-medium text-white">
              <div className="bg-cyber-magenta h-6 w-1 rounded-full" />
              核心功能
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "音频可视化", desc: "实时频率分析，动态波形展示" },
                { title: "播放列表", desc: "支持多首音乐，顺序/随机播放" },
                { title: "进度控制", desc: "拖拽跳转，精确控制播放位置" },
                { title: "音量调节", desc: "独立音量控制，记忆用户偏好" },
                { title: "赛博朋克UI", desc: "霓虹光效，扫描线动画" },
                { title: "全局浮动", desc: "固定右下角，不影响页面操作" },
              ].map((feature, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <h4 className="mb-1 font-medium text-white">{feature.title}</h4>
                  <p className="text-sm text-white/50">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 技术栈 */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm text-white/40">技术实现</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Web Audio API",
                "HTML5 Audio",
                "React Hooks",
                "Tailwind CSS",
                "AnalyserNode",
                "RequestAnimationFrame",
              ].map((tech, i) => (
                <span
                  key={i}
                  className="bg-cyber-magenta/10 border-cyber-magenta/30 text-cyber-magenta rounded-full border px-3 py-1 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
