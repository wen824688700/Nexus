"use client";

import { NeonBorder } from "@/components/cyber";
import { Lock, Calendar, Tag } from "lucide-react";
import type { Article, ArticleMetadata } from "@/types";

interface ArticlePreviewCardProps {
  article: Article | ArticleMetadata;
  onClick: () => void;
  isLocked?: boolean;
}

export function ArticlePreviewCard({
  article,
  onClick,
  isLocked = false,
}: ArticlePreviewCardProps) {
  // 获取文章预览（优先使用 summary，否则从 content 提取）
  const preview = 'summary' in article && article.summary
    ? article.summary
    : 'content' in article
      ? article.content.slice(0, 150) + (article.content.length > 150 ? "..." : "")
      : article.title;

  return (
    <div onClick={onClick} className="cursor-pointer group">
      <NeonBorder color="cyan" className="rounded-xl h-full">
        <div className="bg-cyber-dark/80 backdrop-blur-xl p-6 rounded-xl h-full flex flex-col relative overflow-hidden">
          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute top-4 right-4 z-10">
              <div className="w-8 h-8 rounded-full bg-cyber-magenta/20 border border-cyber-magenta/50 flex items-center justify-center">
                <Lock className="w-4 h-4 text-cyber-magenta" />
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-orbitron font-bold text-white mb-3 group-hover:text-cyber-cyan transition-colors">
            {article.title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(article.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
            {article.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{article.tags[0]}</span>
              </div>
            )}
          </div>

          {/* Preview */}
          <p className="text-white/60 text-sm leading-relaxed flex-1 line-clamp-4">
            {preview}
          </p>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Locked Badge */}
          {isLocked && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-magenta/10 border border-cyber-magenta/30 text-cyber-magenta text-xs">
                <Lock className="w-3 h-3" />
                <span>需要解锁</span>
              </div>
            </div>
          )}
        </div>
      </NeonBorder>
    </div>
  );
}
