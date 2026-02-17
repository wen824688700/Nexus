"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string; // 当前渲染的内容（可能是部分）
  fullContent: string; // 完整内容（用于生成正确的标题 ID）
  images?: Record<string, string>;
}

export function MarkdownPreview({ content, fullContent, images = {} }: MarkdownPreviewProps) {
  // 预先解析完整内容的所有标题，建立文本到行号的映射
  const headingLineMap = new Map<string, number>();
  const lines = fullContent.split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      let text = match[2].trim();
      
      // 移除 Markdown 格式标记（与 TableOfContents 保持一致）
      text = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/~~(.+?)~~/g, '$1')
        .trim();
      
      headingLineMap.set(text, index);
    }
  });
  
  // 生成标题 ID 的辅助函数（与 TableOfContents 完全一致）
  const generateHeadingId = (text: string, lineIndex: number) => {
    const id = `heading-${lineIndex}-${text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')}`;
    return id;
  };
  
  return (
    <div className="prose prose-invert prose-cyan max-w-none px-6 md:px-12 lg:px-20 py-8 md:py-12">
      <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          urlTransform={(url) => {
            // 保留 img:// 协议，不要转换
            if (url.startsWith('img://')) {
              return url;
            }
            return url;
          }}
          components={{
            h1: ({ children }) => {
              const text = String(children);
              let cleanText = text.replace(/<[^>]*>/g, '').trim();
              
              // 移除 Markdown 格式标记（与 headingLineMap 保持一致）
              cleanText = cleanText
                .replace(/\*\*/g, '')  // 移除粗体
                .replace(/\*/g, '')    // 移除斜体
                .replace(/`/g, '')     // 移除代码
                .replace(/~~(.+?)~~/g, '$1')  // 移除删除线
                .trim();
              
              const lineIndex = headingLineMap.get(cleanText) ?? 0;
              const id = generateHeadingId(cleanText, lineIndex);
              return (
                <h1 id={id} className="text-3xl font-orbitron font-bold text-white mb-4 pb-2 border-b border-cyber-cyan/30 scroll-mt-20">
                  {children}
                </h1>
              );
            },
            h2: ({ children }) => {
              const text = String(children);
              let cleanText = text.replace(/<[^>]*>/g, '').trim();
              
              // 移除 Markdown 格式标记
              cleanText = cleanText
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/`/g, '')
                .replace(/~~(.+?)~~/g, '$1')
                .trim();
              
              const lineIndex = headingLineMap.get(cleanText) ?? 0;
              const id = generateHeadingId(cleanText, lineIndex);
              return (
                <h2 id={id} className="text-2xl font-orbitron font-bold text-white mt-8 mb-4 scroll-mt-20">
                  {children}
                </h2>
              );
            },
            h3: ({ children }) => {
              const text = String(children);
              let cleanText = text.replace(/<[^>]*>/g, '').trim();
              
              // 移除 Markdown 格式标记
              cleanText = cleanText
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/`/g, '')
                .replace(/~~(.+?)~~/g, '$1')
                .trim();
              
              const lineIndex = headingLineMap.get(cleanText) ?? 0;
              const id = generateHeadingId(cleanText, lineIndex);
              return (
                <h3 id={id} className="text-xl font-orbitron font-semibold text-white mt-6 mb-3 scroll-mt-20">
                  {children}
                </h3>
              );
            },
            p: ({ children }) => (
              <p className="text-white/80 leading-relaxed mb-4">{children}</p>
            ),
            code: ({ inline, children, ...props }: any) =>
              inline ? (
                <code
                  className="px-2 py-1 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block p-4 rounded-lg bg-white/5 border border-white/10 text-cyber-cyan font-mono text-sm overflow-x-auto shadow-[0_0_20px_rgba(0,243,255,0.1)]"
                  {...props}
                >
                  {children}
                </code>
              ),
            pre: ({ children }) => <pre className="my-4">{children}</pre>,
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-cyan hover:text-cyber-magenta underline underline-offset-4 transition-colors"
              >
                {children}
              </a>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-white/80">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 text-white/80">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-white/80 leading-relaxed">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-cyber-cyan/50 bg-cyber-cyan/5 pl-4 pr-4 py-2 italic text-white/70 my-4 rounded-r">
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
            ),
            img: ({ node, src, alt, ...props }) => {
              if (!src) {
                return null;
              }
              
              // 处理 img:// 协议的图片引用
              let actualSrc = src;
              if (typeof src === 'string' && src.startsWith('img://')) {
                const imageId = src.replace('img://', '');
                actualSrc = images[imageId] || '';
                
                if (!actualSrc) {
                  return (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 my-4 text-red-400 text-sm">
                      ⚠️ 图片加载失败：{alt || imageId}
                    </div>
                  );
                }
              }
              
              return (
                <img
                  {...props}
                  src={actualSrc}
                  alt={alt || "图片"}
                  className="rounded-lg border border-white/10 my-4 max-w-full h-auto shadow-[0_0_30px_rgba(0,243,255,0.2)]"
                  loading="lazy"
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
    </div>
  );
}
