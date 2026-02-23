"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Article } from "./types";

export function ArticleWindow({ article }: { article: Article }) {
  return (
    <div className="prose prose-invert prose-base max-w-none p-4 md:p-6 text-[#e5e5e5]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="mb-4 text-2xl md:text-3xl font-bold text-[#39ff14]" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="mt-6 mb-3 text-xl md:text-2xl font-bold text-[#39ff14]" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="mt-4 mb-2 text-lg md:text-xl font-bold text-[#39ff14]" {...props} />
          ),
          p: ({ ...props }) => <p className="mb-3 text-base leading-relaxed" {...props} />,
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
                className="block overflow-x-auto rounded bg-[#1a1a1a] p-3 font-mono text-sm scrollbar-thin scrollbar-thumb-[#39ff14]/30 scrollbar-track-transparent"
                {...props}
              >
                {children}
              </code>
            );
          },
          ul: ({ ...props }) => (
            <ul className="mb-3 ml-4 md:ml-6 list-disc space-y-1 text-base" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="mb-3 ml-4 md:ml-6 list-decimal space-y-1 text-base" {...props} />
          ),
          li: ({ ...props }) => <li className="text-base pl-1" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-2 md:border-l-4 border-[#39ff14] pl-3 md:pl-4 my-4 text-neutral-400 italic"
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
          img: ({ ...props }) => (
            <img
              className="w-full h-auto rounded my-4"
              loading="lazy"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="border border-[#39ff14]/30 bg-[#1a1a1a] px-3 py-2 text-left text-sm font-bold text-[#39ff14] first:sticky first:left-0 first:z-10"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="border border-[#39ff14]/30 px-3 py-2 text-sm first:sticky first:left-0 first:z-10 first:bg-[#0a0a0a]"
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
