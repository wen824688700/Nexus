"use client";

import { memo } from "react";
import { NeonBorder } from "@/components/cyber";
import { Megaphone } from "lucide-react";

const announcements = [
  "🎨 新增 AI 肖像生成器，生成专业级肖像",
  "🎵 新增音频分析智能体，一键分析音频风格",
  "📊 数据分析智能体集成，支持图表生成和数据洞察",
  "🖼️ 图像编辑智能体就绪，AI 驱动的智能修图",
  "📚 知识库系统上线，支持 Notion 同步和全文搜索",
  "💡 提示词优化器升级，支持 57+ 种优化框架",
  "🔥 新增Seedance 2.0分镜助手，一句话生成分镜提示词",
  "🚀 社群活动：每周五晚 8 点线上分享会",
];

export const AnnouncementTicker = memo(function AnnouncementTicker() {
  // 复制一份公告用于无缝循环
  const doubledAnnouncements = [...announcements, ...announcements];

  return (
    <NeonBorder color="cyan" className="rounded-xl">
      <div className="bg-cyber-dark/80 overflow-hidden rounded-xl p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <Megaphone className="text-cyber-cyan h-5 w-5 animate-pulse" />
          <h3 className="font-orbitron font-bold text-white">最新动态</h3>
        </div>

        {/* 跑马灯容器 */}
        <div className="relative h-[120px] overflow-hidden">
          {/* 渐变遮罩 - 上下边缘 */}
          <div className="from-cyber-dark/80 pointer-events-none absolute top-0 right-0 left-0 z-10 h-8 bg-gradient-to-b to-transparent" />
          <div className="from-cyber-dark/80 pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 bg-gradient-to-t to-transparent" />

          {/* 滚动内容 */}
          <div className="animate-marquee-vertical space-y-3">
            {doubledAnnouncements.map((announcement, index) => (
              <div
                key={index}
                className="hover:text-cyber-cyan cursor-default px-2 text-sm leading-relaxed whitespace-nowrap text-white/70 transition-colors"
              >
                {announcement}
              </div>
            ))}
          </div>
        </div>
      </div>
    </NeonBorder>
  );
});
