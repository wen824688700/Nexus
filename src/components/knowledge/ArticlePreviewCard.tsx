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
  const preview =
    "summary" in article && article.summary
      ? article.summary
      : "content" in article
        ? article.content.slice(0, 150) + (article.content.length > 150 ? "..." : "")
        : article.title;

  return (
    <div onClick={onClick} className="group cursor-pointer">
      <NeonBorder color="cyan" className="h-full rounded-xl">
        <div className="bg-cyber-dark/80 relative flex h-full flex-col overflow-hidden rounded-xl p-6 backdrop-blur-xl">
          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-cyber-magenta/20 border-cyber-magenta/50 flex h-8 w-8 items-center justify-center rounded-full border">
                <Lock className="text-cyber-magenta h-4 w-4" />
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="font-orbitron group-hover:text-cyber-cyan mb-3 text-xl font-bold text-white transition-colors">
            {article.title}
          </h3>

          {/* Meta Info */}
          <div className="mb-4 flex items-center gap-4 text-xs text-white/50">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(article.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
            {article.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{article.tags[0]}</span>
              </div>
            )}
          </div>

          {/* Preview */}
          <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-white/60">{preview}</p>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30 rounded border px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Locked Badge */}
          {isLocked && (
            <div className="mt-4">
              <div className="bg-cyber-magenta/10 border-cyber-magenta/30 text-cyber-magenta inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                <Lock className="h-3 w-3" />
                <span>需要解锁</span>
              </div>
            </div>
          )}
        </div>
      </NeonBorder>
    </div>
  );
}
