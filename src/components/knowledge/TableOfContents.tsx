"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number; // 1, 2, 3 对应 h1, h2, h3
}

interface TableOfContentsProps {
  content: string;
  scrollContainerId?: string;
  onItemClick?: (id: string) => void;
}

export function TableOfContents({ content, scrollContainerId, onItemClick }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // 解析 Markdown 提取标题
  useEffect(() => {
    if (!content) {
      if (tocItems.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTocItems([]);
      }
      return;
    }

    const lines = content.split("\n");
    const items: TocItem[] = [];

    lines.forEach((line, index) => {
      // 匹配 Markdown 标题 (# ## ###)
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        let text = match[2].trim();

        // 移除 Markdown 格式标记（粗体、斜体、代码等）
        text = text
          .replace(/\*\*/g, "") // 移除粗体 **text**
          .replace(/\*/g, "") // 移除斜体 *text*
          .replace(/`/g, "") // 移除代码 `code`
          .replace(/~~(.+?)~~/g, "$1") // 移除删除线 ~~text~~
          .trim();

        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")}`;

        items.push({ id, text, level });
      }
    });

    setTocItems(items);
  }, [content]);

  // 监听滚动，高亮当前章节
  useEffect(() => {
    if (tocItems.length === 0) return;

    // 获取滚动容器
    const scrollContainer = scrollContainerId ? document.getElementById(scrollContainerId) : null;

    if (!scrollContainer) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: scrollContainer, // 指定滚动容器
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      },
    );

    // 观察所有标题元素
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems, scrollContainerId]);

  const handleClick = (id: string) => {
    // 先触发回调（加载完整内容）
    onItemClick?.(id);

    // 等待内容渲染，带重试机制
    const scrollToElement = (retryCount = 0) => {
      const element = document.getElementById(id);
      const scrollContainer = scrollContainerId ? document.getElementById(scrollContainerId) : null;

      if (element && scrollContainer) {
        // 找到元素，执行滚动
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const offset = elementRect.top - containerRect.top + scrollTop - 80; // 80px 偏移量

        scrollContainer.scrollTo({
          top: offset,
          behavior: "smooth",
        });
      } else if (element) {
        // 回退方案：使用默认滚动
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (retryCount < 4) {
        // 元素未找到，重试（最多5次）
        setTimeout(() => scrollToElement(retryCount + 1), 200);
      }
    };

    // 首次尝试延迟 300ms
    setTimeout(() => scrollToElement(), 300);
  };

  if (tocItems.length === 0) {
    return <div className="p-4 text-sm text-white/40">暂无目录</div>;
  }

  return (
    <nav className="px-2 py-4">
      <div className="font-orbitron text-cyber-cyan mb-3 px-2 text-xs font-bold">目录</div>

      <ul className="space-y-1">
        {tocItems.map((item) => {
          const isActive = activeId === item.id;
          const paddingLeft = (item.level - 1) * 12 + 8; // 缩进

          return (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={`group flex w-full items-start gap-2 rounded px-2 py-2 text-left text-sm transition-all ${
                  isActive
                    ? "bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan border-l-2"
                    : "border-l-2 border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                }`}
                style={{ paddingLeft: `${paddingLeft}px` }}
              >
                <ChevronRight
                  className={`mt-0.5 h-3 w-3 flex-shrink-0 transition-transform ${
                    isActive ? "text-cyber-cyan" : "text-white/40 group-hover:text-white/60"
                  }`}
                />
                <span className="line-clamp-2 flex-1">{item.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
