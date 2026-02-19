"use client";

import { useState, useEffect, useRef } from "react";
import { MarkdownPreview } from "./MarkdownPreview";
import { Loader2 } from "lucide-react";

interface ProgressiveMarkdownPreviewProps {
  content: string;
  fullContent: string; // 完整内容，用于生成正确的标题 ID
  images?: Record<string, string>;
  isLoading?: boolean;
  forceFullContent?: boolean; // 强制显示完整内容
}

export function ProgressiveMarkdownPreview({
  content,
  fullContent,
  images,
  isLoading = false,
  forceFullContent = false,
}: ProgressiveMarkdownPreviewProps) {
  const [visibleContent, setVisibleContent] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const CHUNK_SIZE = 3000; // 每次渲染 3000 字符（减小块大小，更快显示首屏）

  // 初始化：显示前面部分内容
  useEffect(() => {
    if (!content) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleContent("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasMore(false);
      return;
    }

    if (forceFullContent) {
      // 强制显示完整内容
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleContent(content);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasMore(false);
    } else {
      // 渐进式加载：首屏快速显示
      const initialContent = content.slice(0, CHUNK_SIZE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleContent(initialContent);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasMore(content.length > CHUNK_SIZE);

      // 如果内容较短，直接显示全部
      if (content.length <= CHUNK_SIZE * 2) {
        setTimeout(() => {
          setVisibleContent(content);
          setHasMore(false);
        }, 100);
      }
    }
  }, [content, forceFullContent]);

  // 监听滚动，加载更多内容
  useEffect(() => {
    if (!hasMore || !observerRef.current || forceFullContent) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // 用户滚动到底部，加载更多
          const currentLength = visibleContent.length;
          const nextChunk = content.slice(0, currentLength + CHUNK_SIZE);
          setVisibleContent(nextChunk);
          setHasMore(nextChunk.length < content.length);
        }
      },
      {
        rootMargin: "400px", // 提前 400px 开始加载（更激进的预加载）
        threshold: 0,
      },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [content, visibleContent, hasMore, forceFullContent]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20">
        <Loader2 className="text-cyber-cyan mb-4 h-12 w-12 animate-spin" />
        <p className="text-white/60">加载文章内容中...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20">
        <p className="text-white/40">暂无内容</p>
      </div>
    );
  }

  return (
    <div>
      <MarkdownPreview content={visibleContent} fullContent={fullContent} images={images} />

      {/* 加载更多触发器 */}
      {hasMore && !forceFullContent && (
        <div ref={observerRef} className="flex items-center justify-center py-8">
          <Loader2 className="text-cyber-cyan h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-white/60">加载更多内容...</span>
        </div>
      )}

      {/* 已加载完成提示 */}
      {!hasMore && content && (
        <div className="flex items-center justify-center py-8 text-sm text-white/40">
          已加载全部内容
        </div>
      )}
    </div>
  );
}
