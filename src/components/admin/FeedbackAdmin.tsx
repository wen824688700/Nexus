"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Image as ImageIcon, Trash2, ExternalLink } from "lucide-react";

interface Feedback {
  id: string;
  user_id: string;
  content: string;
  screenshot_url: string | null;
  created_at: string;
  user_email?: string;
}

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  async function loadFeedbacks() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/feedback/list");
      if (!response.ok) {
        throw new Error("加载反馈失败");
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
    } catch (err: any) {
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这条反馈吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/feedback/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      // 重新加载列表
      loadFeedbacks();
    } catch (err: any) {
      alert(err.message || "删除失败");
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-white/60" />
          <span className="text-lg font-medium">
            共 {feedbacks.length} 条反馈
          </span>
        </div>
      </div>

      {/* 反馈列表 */}
      {feedbacks.length === 0 ? (
        <div className="py-12 text-center text-white/40">
          暂无用户反馈
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* 用户信息和时间 */}
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <span>{feedback.user_email || "匿名用户"}</span>
                    <span>•</span>
                    <span>{formatDate(feedback.created_at)}</span>
                  </div>

                  {/* 反馈内容 */}
                  <p className="whitespace-pre-wrap text-white">
                    {feedback.content}
                  </p>

                  {/* 截图 */}
                  {feedback.screenshot_url && (
                    <button
                      onClick={() => setSelectedImage(feedback.screenshot_url)}
                      className="flex items-center gap-2 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>查看截图</span>
                    </button>
                  )}
                </div>

                {/* 操作按钮 */}
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="text-white/40 transition-colors hover:text-red-400"
                  title="删除反馈"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={selectedImage}
              alt="反馈截图"
              className="max-h-[90vh] max-w-full rounded-lg"
            />
            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 rounded-full bg-black/80 p-2 text-white transition-colors hover:bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
