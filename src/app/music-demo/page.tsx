'use client';

import { Music2 } from 'lucide-react';

export default function MusicDemoPage() {
  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-hidden">
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      {/* 内容 */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">
              AI 音乐播放器
              <span className="text-cyber-magenta">演示</span>
            </h1>
            <p className="text-white/60 text-lg">
              赛博朋克风格 · 音频可视化 · 完整功能
            </p>
          </div>

          {/* 功能卡片 */}
          <div className="grid md:grid-cols-1 gap-6 mb-12">
            {/* 浮动模式 */}
            <div className="p-8 rounded-2xl border border-white/10 bg-cyber-dark/50 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-cyber-magenta/20 flex items-center justify-center mb-6">
                <Music2 className="w-8 h-8 text-cyber-magenta" />
              </div>
              <h3 className="text-white text-xl font-medium mb-3">浮动音乐播放器</h3>
              <p className="text-white/60 mb-6">
                右下角小部件，单击展开控制面板。适合作为全局背景音乐播放器。
              </p>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>已激活（查看右下角）</span>
              </div>
            </div>
          </div>

          {/* 功能列表 */}
          <div className="p-8 rounded-2xl border border-cyber-magenta/30 bg-cyber-dark/50 backdrop-blur-sm">
            <h3 className="text-white text-xl font-medium mb-6 flex items-center gap-3">
              <div className="w-1 h-6 bg-cyber-magenta rounded-full" />
              核心功能
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: '音频可视化', desc: '实时频率分析，动态波形展示' },
                { title: '播放列表', desc: '支持多首音乐，顺序/随机播放' },
                { title: '进度控制', desc: '拖拽跳转，精确控制播放位置' },
                { title: '音量调节', desc: '独立音量控制，记忆用户偏好' },
                { title: '赛博朋克UI', desc: '霓虹光效，扫描线动画' },
                { title: '全局浮动', desc: '固定右下角，不影响页面操作' },
              ].map((feature, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-1">{feature.title}</h4>
                  <p className="text-white/50 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 技术栈 */}
          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm mb-4">技术实现</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'Web Audio API',
                'HTML5 Audio',
                'React Hooks',
                'Tailwind CSS',
                'AnalyserNode',
                'RequestAnimationFrame'
              ].map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-cyber-magenta/10 border border-cyber-magenta/30 text-cyber-magenta text-xs"
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
