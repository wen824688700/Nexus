"use client";

import { useState, useRef } from "react";
import { X, Upload, Send, CheckCircle } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [content, setContent] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }

    // 验证文件大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB");
      return;
    }

    setScreenshot(file);
    setError(null);

    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveScreenshot() {
    setScreenshot(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit() {
    if (!content.trim()) {
      setError("请输入反馈内容");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "提交失败");
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setContent("");
    setScreenshot(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-lg border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl mx-auto my-auto">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-white/60 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 标题 */}
        <h2 className="mb-6 text-2xl font-bold text-white">反馈建议</h2>

        {success ? (
          // 成功状态
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="mb-4 h-16 w-16 text-green-400" />
            <p className="text-lg text-white">感谢您的反馈！</p>
            <p className="mt-2 text-sm text-white/60">我们会认真阅读并改进</p>
          </div>
        ) : (
          <>
            {/* 反馈内容 */}
            <div className="mb-4">
              <label htmlFor="feedback-content" className="mb-2 block text-sm text-white/80">
                反馈内容 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="feedback-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请描述您遇到的问题或建议..."
                rows={6}
                maxLength={1000}
                disabled={loading}
                className="w-full resize-none rounded border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
              />
              <div className="mt-1 text-right text-xs text-white/40">
                {content.length}/1000
              </div>
            </div>

            {/* 截图上传 */}
            <div className="mb-6">
              <label className="mb-2 block text-sm text-white/80">
                截图（可选，限制一张）
              </label>

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="截图预览"
                    className="w-full rounded border border-white/10"
                  />
                  <button
                    onClick={handleRemoveScreenshot}
                    className="absolute right-2 top-2 rounded-full bg-black/80 p-1 text-white/80 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-white/20 bg-white/5 py-8 text-white/60 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <Upload className="h-5 w-5" />
                  <span>点击上传截图</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="flex w-full items-center justify-center gap-2 rounded bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>提交反馈</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
