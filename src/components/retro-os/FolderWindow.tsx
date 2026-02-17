"use client";

import { useRetroOS } from "./RetroOSContext";
import { useArticles } from "./useArticles";

export function FolderWindow() {
  const { actions } = useRetroOS();
  const { articles, loading } = useArticles();

  const handleDoubleClick = (article: (typeof articles)[0]) => {
    actions.openWindow("article", article);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <div className="mono mb-2 text-[10px] text-neutral-500">LOADING...</div>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full w-1/2 animate-pulse bg-[#39ff14]" />
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <div>
          <div className="mb-2 text-2xl">📭</div>
          <div className="mono text-[10px] text-neutral-500">NO FILES FOUND</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {articles.map((article) => (
        <div
          key={article.id}
          onDoubleClick={() => handleDoubleClick(article)}
          className="group flex cursor-pointer flex-col items-center"
        >
          <div className="mb-2 text-4xl">{article.icon}</div>
          <span className="text-center font-mono text-[11px] leading-tight font-bold text-[#e5e5e5]">
            {article.title}
          </span>
        </div>
      ))}
    </div>
  );
}
