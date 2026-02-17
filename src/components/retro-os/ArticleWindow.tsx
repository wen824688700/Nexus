"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Article } from "./types";

export function ArticleWindow({ article }: { article: Article }) {
  return (
    <div className="prose prose-invert prose-base max-w-none p-6 text-[#e5e5e5]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="mb-4 text-2xl font-bold text-[#39ff14]" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="mt-6 mb-3 text-xl font-bold text-[#39ff14]" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="mt-4 mb-2 text-lg font-bold text-[#39ff14]" {...props} />
          ),
          p: ({ ...props }) => <p className="mb-3 text-sm leading-relaxed" {...props} />,
          code: ({ className, children, ...props }) => {
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
                className="block overflow-x-auto rounded bg-[#1a1a1a] p-3 font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          ul: ({ ...props }) => (
            <ul className="mb-3 list-inside list-disc space-y-1 text-sm" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="mb-3 list-inside list-decimal space-y-1 text-sm" {...props} />
          ),
          li: ({ ...props }) => <li className="text-sm" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-[#39ff14] pl-4 text-neutral-400 italic"
              {...props}
            />
          ),
          strong: ({ ...props }) => <strong className="font-bold text-white" {...props} />,
          em: ({ ...props }) => <em className="text-neutral-300 italic" {...props} />,
          a: ({ ...props }) => (
            <a
              className="text-[#39ff14] underline decoration-[#39ff14]/30 underline-offset-2 transition-colors hover:decoration-[#39ff14]"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
        }}
      >
        {article.content}
      </ReactMarkdown>
    </div>
  );
}
