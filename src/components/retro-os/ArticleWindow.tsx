"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Article } from "./types";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function ArticleWindow({ article }: { article: Article }) {
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [tocWidth, setTocWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedChunks, setLoadedChunks] = useState(1); // 已加载的内容块数
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 将文章内容分块（按段落或标题分割）
  const contentChunks = useMemo(() => {
    const lines = article.content.split("\n");
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let lineCount = 0;
    const LINES_PER_CHUNK = 50; // 每块约50行

    lines.forEach((line) => {
      currentChunk.push(line);
      lineCount++;

      // 遇到标题或达到行数限制时分块
      if (
        (line.startsWith("#") && currentChunk.length > 10) ||
        lineCount >= LINES_PER_CHUNK
      ) {
        chunks.push(currentChunk.join("\n"));
        currentChunk = [];
        lineCount = 0;
      }
    });

    // 添加最后一块
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n"));
    }

    return chunks.length > 0 ? chunks : [article.content];
  }, [article.content]);

  // 当前显示的内容
  const displayedContent = useMemo(() => {
    return contentChunks.slice(0, loadedChunks).join("\n");
  }, [contentChunks, loadedChunks]);

  // 从文章内容中提取目录（使用完整内容，不受懒加载影响）
  const toc = useMemo(() => {
    const items: TocItem[] = [];
    const lines = article.content.split("\n");
    
    lines.forEach((line, index) => {
      const h1Match = line.match(/^#\s+(.+)$/);
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);
      
      if (h1Match) {
        items.push({
          id: `heading-${index}`,
          text: h1Match[1],
          level: 1,
        });
      } else if (h2Match) {
        items.push({
          id: `heading-${index}`,
          text: h2Match[1],
          level: 2,
        });
      } else if (h3Match) {
        items.push({
          id: `heading-${index}`,
          text: h3Match[1],
          level: 3,
        });
      }
    });
    
    return items;
  }, [article.content]);

  // 加载更多内容
  const loadMoreContent = useCallback(() => {
    if (loadedChunks < contentChunks.length && !isLoadingMore) {
      setIsLoadingMore(true);
      // 模拟异步加载，给用户更好的体验
      setTimeout(() => {
        setLoadedChunks((prev) => Math.min(prev + 1, contentChunks.length));
        setIsLoadingMore(false);
      }, 100);
    }
  }, [loadedChunks, contentChunks.length, isLoadingMore]);

  // 设置 Intersection Observer 监听滚动到底部
  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && loadedChunks < contentChunks.length) {
          loadMoreContent();
        }
      },
      {
        root: contentRef.current,
        rootMargin: "200px", // 提前200px开始加载
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadedChunks, contentChunks.length, loadMoreContent]);

  // 处理拖拽开始
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = tocWidth;
    e.preventDefault();
  };

  // 处理拖拽
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.max(180, Math.min(400, dragStartWidth.current + delta));
      setTocWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // 滚动到标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 如果没有目录项，不显示目录
  if (toc.length === 0) {
    return (
      <div 
        ref={contentRef}
        className="prose prose-invert prose-base max-w-none p-4 md:p-6 text-[#e5e5e5] h-full overflow-y-auto"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {displayedContent}
        </ReactMarkdown>
        
        {/* 加载指示器 */}
        {loadedChunks < contentChunks.length && (
          <>
            <div ref={sentinelRef} className="h-4" />
            {isLoadingMore && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#39ff14]" />
                <span className="ml-2 text-sm text-[#39ff14]">加载中...</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* 目录侧边栏 */}
      <div
        className={`flex-shrink-0 border-r border-[#39ff14]/30 bg-[#0a0a0a]/50 backdrop-blur-sm transition-all duration-300 ${
          tocCollapsed ? "w-0" : ""
        }`}
        style={{ width: tocCollapsed ? 0 : tocWidth }}
      >
        <div className="h-full flex flex-col">
          {/* 目录标题 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#39ff14]/30">
            <h3 className="font-mono text-sm font-bold text-[#39ff14]">目录</h3>
          </div>

          {/* 目录列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-[#39ff14]/10 hover:text-[#39ff14] text-[#e5e5e5]/70 ${
                  item.level === 1 ? "font-bold" : ""
                } ${item.level === 2 ? "pl-6" : ""} ${item.level === 3 ? "pl-9" : ""}`}
                style={{
                  fontSize: item.level === 1 ? "0.875rem" : item.level === 2 ? "0.8125rem" : "0.75rem",
                }}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 拖拽手柄 */}
      {!tocCollapsed && (
        <div
          className={`w-1 bg-[#39ff14]/20 hover:bg-[#39ff14]/50 cursor-col-resize transition-colors ${
            isDragging ? "bg-[#39ff14]" : ""
          }`}
          onMouseDown={handleDragStart}
        />
      )}

      {/* 折叠/展开按钮 */}
      <button
        onClick={() => setTocCollapsed(!tocCollapsed)}
        className="absolute top-3 left-2 z-10 flex items-center justify-center w-6 h-6 rounded bg-[#39ff14]/20 hover:bg-[#39ff14]/40 text-[#39ff14] transition-colors"
        title={tocCollapsed ? "展开目录" : "折叠目录"}
      >
        {tocCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* 文章内容 */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto prose prose-invert prose-base max-w-none p-4 md:p-6 text-[#e5e5e5]"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ...markdownComponents,
            // 为标题添加 id
            h1: ({ children, ...props }) => {
              const text = String(children);
              const index = article.content.split("\n").findIndex((line) => line.includes(text));
              return (
                <h1
                  id={`heading-${index}`}
                  className="mb-4 text-2xl md:text-3xl font-bold text-[#39ff14] scroll-mt-4"
                  {...props}
                >
                  {children}
                </h1>
              );
            },
            h2: ({ children, ...props }) => {
              const text = String(children);
              const index = article.content.split("\n").findIndex((line) => line.includes(text));
              return (
                <h2
                  id={`heading-${index}`}
                  className="mt-6 mb-3 text-xl md:text-2xl font-bold text-[#39ff14] scroll-mt-4"
                  {...props}
                >
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const text = String(children);
              const index = article.content.split("\n").findIndex((line) => line.includes(text));
              return (
                <h3
                  id={`heading-${index}`}
                  className="mt-4 mb-2 text-lg md:text-xl font-bold text-[#39ff14] scroll-mt-4"
                  {...props}
                >
                  {children}
                </h3>
              );
            },
          }}
        >
          {displayedContent}
        </ReactMarkdown>

        {/* 加载指示器 */}
        {loadedChunks < contentChunks.length && (
          <>
            <div ref={sentinelRef} className="h-4" />
            {isLoadingMore && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#39ff14]" />
                <span className="ml-2 text-sm text-[#39ff14]">加载中...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Markdown 组件配置
const markdownComponents = {
  p: ({ ...props }: any) => <p className="mb-3 text-base leading-relaxed" {...props} />,
  code: ({ className, children, ...props }: any) => {
    const isInline = !className?.includes("language-");
    return isInline ? (
      <code
        className="rounded bg-[#1a1a1a] px-1 py-0.5 font-mono text-xs text-[#39ff14]"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className="block overflow-x-auto rounded bg-[#1a1a1a] p-3 font-mono text-sm scrollbar-thin scrollbar-thumb-[#39ff14]/30 scrollbar-track-transparent"
        {...props}
      >
        {children}
      </code>
    );
  },
  ul: ({ ...props }: any) => (
    <ul className="mb-3 ml-4 md:ml-6 list-disc space-y-1 text-base" {...props} />
  ),
  ol: ({ ...props }: any) => (
    <ol className="mb-3 ml-4 md:ml-6 list-decimal space-y-1 text-base" {...props} />
  ),
  li: ({ ...props }: any) => <li className="text-base pl-1" {...props} />,
  blockquote: ({ ...props }: any) => (
    <blockquote
      className="border-l-2 md:border-l-4 border-[#39ff14] pl-3 md:pl-4 my-4 text-neutral-400 italic"
      {...props}
    />
  ),
  strong: ({ ...props }: any) => <strong className="font-bold text-white" {...props} />,
  em: ({ ...props }: any) => <em className="text-neutral-300 italic" {...props} />,
  a: ({ ...props }: any) => (
    <a
      className="text-[#39ff14] underline decoration-[#39ff14]/30 underline-offset-2 transition-colors hover:decoration-[#39ff14]"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  img: ({ ...props }: any) => (
    <img className="w-full h-auto rounded my-4" loading="lazy" {...props} />
  ),
  table: ({ ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse" {...props} />
    </div>
  ),
  th: ({ ...props }: any) => (
    <th
      className="border border-[#39ff14]/30 bg-[#1a1a1a] px-3 py-2 text-left text-sm font-bold text-[#39ff14] first:sticky first:left-0 first:z-10"
      {...props}
    />
  ),
  td: ({ ...props }: any) => (
    <td
      className="border border-[#39ff14]/30 px-3 py-2 text-sm first:sticky first:left-0 first:z-10 first:bg-[#0a0a0a]"
      {...props}
    />
  ),
};
