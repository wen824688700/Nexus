"use client";

import { useState, useEffect } from "react";
import { GlitchText } from "@/components/cyber";
import { ArticlePreviewCard } from "./ArticlePreviewCard";
import { ArticleReaderModal } from "./ArticleReaderModal";
import { Search, Loader2 } from "lucide-react";
import type { Article, ArticleMetadata } from "@/types";

export function KnowledgePage() {
  // 文章数据状态
  const [articlesMetadata, setArticlesMetadata] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 文章缓存 - 避免重复加载
  const [articleCache, setArticleCache] = useState<Map<string, Article>>(new Map());
  
  // UI 状态
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");

  // 从 API 获取文章元数据（快速）
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch('/api/articles/metadata')
      .then(res => {
        if (!res.ok) throw new Error('获取文章失败');
        return res.json();
      })
      .then(data => {
        setArticlesMetadata(data.articles || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load articles:', err);
        setError('加载文章失败，请稍后重试');
        setLoading(false);
      });
  }, []);

  // 动态计算标签和数量
  const tagCounts = articlesMetadata.reduce((acc, article) => {
    article.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const categories = ["全部", ...Object.keys(tagCounts).sort()];

  // 过滤文章
  const filteredArticles = articlesMetadata.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "全部" || article.tags.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  // 选择文章并加载完整内容（带缓存）
  const handleSelectArticle = async (metadata: ArticleMetadata) => {
    // 检查缓存
    const cached = articleCache.get(metadata.id);
    
    if (cached) {
      setCurrentArticle(cached);
      setIsModalOpen(true);
      return;
    }
    
    // 缓存未命中，立即打开阅读视图
    const placeholderArticle: Article = {
      ...metadata,
      content: "", // 空内容，显示加载状态
    };
    setCurrentArticle(placeholderArticle);
    setIsModalOpen(true);
    setLoadingContent(true);
    
    // 后台加载完整内容
    try {
      const response = await fetch(`/api/articles/${metadata.id}`);
      if (!response.ok) throw new Error('加载文章内容失败');
      
      const data = await response.json();
      
      // 更新完整内容
      const fullArticle: Article = {
        ...metadata,
        content: data.content,
      };
      
      // 存入缓存
      setArticleCache(prev => {
        const newCache = new Map(prev);
        newCache.set(metadata.id, fullArticle);
        return newCache;
      });
      
      setCurrentArticle(fullArticle);
    } catch (err) {
      console.error('Failed to load article content:', err);
      setError('加载文章内容失败，请稍后重试');
      setIsModalOpen(false); // 加载失败时关闭窗口
    } finally {
      setLoadingContent(false);
    }
  };

  // 关闭窗口（不清空文章，保持缓存）
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // 不清空 currentArticle，保持缓存
  };

  return (
    <section className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-magenta/10 border border-cyber-magenta/30 text-cyber-magenta text-sm font-mono mb-4">
            AI 知识库
          </div>
          <GlitchText
            as="h1"
            className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-4"
          >
            我的 AI 学习笔记
          </GlitchText>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            深度长文、工具玩法、项目复盘，记录我的 AI 探索之旅
          </p>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-cyber-cyan animate-spin mb-4" />
            <p className="text-white/60">加载文章列表中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="px-6 py-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-cyber-cyan hover:text-cyber-cyan/80 transition-colors"
            >
              重新加载
            </button>
          </div>
        )}

        {/* 文章列表 */}
        {!loading && !error && (
          <>
            {/* 搜索栏 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文章..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-cyber-cyan/50 transition-colors"
                />
              </div>
            </div>

            {/* 分类标签 - 动态生成 */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeCategory === category
                      ? "bg-cyber-magenta text-white shadow-neon-magenta"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {category}
                  {category !== "全部" && (
                    <span className="ml-2 text-xs opacity-70">
                      ({tagCounts[category]})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 文章网格 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticlePreviewCard
                  key={article.id}
                  article={article}
                  onClick={() => handleSelectArticle(article)}
                  isLocked={false}
                />
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white/40 text-lg">没有找到相关文章</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 文章阅读模态窗口 */}
      {isModalOpen && (
        <ArticleReaderModal
          article={currentArticle}
          isLoading={loadingContent}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
