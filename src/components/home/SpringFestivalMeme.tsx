"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Sparkles,
} from "lucide-react";
import { NeonBorder, CyberButton, GlitchText } from "@/components/cyber";

type ToolCall = {
  id: string;
  name: string;
  status: "running" | "complete";
  description: string;
};

type StyleOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
};

const STYLES: StyleOption[] = [
  { id: "q_version", label: "Q版", description: "可爱圆润，萌系风格", emoji: "🎨" },
  { id: "semi_realistic", label: "半写实", description: "保留面部特征，正式风格", emoji: "✨" },
];

const SCENE_EXAMPLES = ["恭喜发财", "新年快乐", "万事如意", "红包拿来", "年年有余", "福到啦"];

export default function SpringFestivalMeme() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionId] = useState(() => `user_${Date.now()}`);

  // 风格选择
  const [selectedStyle, setSelectedStyle] = useState<string>("q_version");

  // 生成结果
  const [streamingContent, setStreamingContent] = useState("");
  const [resultImages, setResultImages] = useState<Array<{ url: string; description: string }>>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // 重新开始
  const handleReset = useCallback(() => {
    setPrompt("");
    setUploadedFile(null);
    setPreviewUrl(null);
    setStreamingContent("");
    setResultImages([]);
    setToolCalls([]);
    setError(null);
    setHasGenerated(false);
    setSelectedStyle("q_version");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    // 验证文件类型
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      setError("请上传图片文件（支持 JPG、PNG、WEBP 格式）");
      return;
    }

    // 验证文件大小（限制 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("文件大小不能超过 10MB");
      return;
    }

    setUploadedFile(file);
    setError(null);

    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // 点击上传
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  // 移除文件
  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 快捷场景选择
  const handleSceneClick = useCallback((scene: string) => {
    setPrompt(scene);
  }, []);

  // 发送消息
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!uploadedFile) {
        setError("请先上传照片");
        return;
      }

      if (!prompt.trim()) {
        setError("请输入场景需求或选择快捷场景");
        return;
      }

      setLoading(true);
      setError(null);
      setStreamingContent("");
      setResultImages([]);
      setToolCalls([]);
      setHasGenerated(true);

      try {
        // 构建查询（包含风格信息）
        const styleLabel = STYLES.find((s) => s.id === selectedStyle)?.label || "Q版";
        const fullQuery = `请生成新春表情包，风格：${selectedStyle === "q_version" ? "Q版可爱风格" : "半写实风格"}，用户需求：${prompt}`;

        // 构建 FormData
        const formData = new FormData();
        formData.append("query", fullQuery);
        formData.append("session_id", sessionId);
        formData.append("file_count", "1");
        formData.append("file_0", uploadedFile);

        // 调用 API
        const response = await fetch("/api/agents/spring-festival-meme/run", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: "请求失败" } }));
          throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
        }

        // 处理流式响应
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法读取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);

              // 处理工具调用开始
              if (json.type === "tool_start") {
                const toolId = `tool_${Date.now()}_${Math.random()}`;
                const toolName = json.tool || "表情包生成";
                setToolCalls((prev) => [
                  ...prev,
                  {
                    id: toolId,
                    name: toolName,
                    status: "running",
                    description: json.description || `正在执行 ${toolName}...`,
                  },
                ]);
                scrollToBottom();
              }

              // 处理工具调用完成
              if (json.type === "tool_complete") {
                const toolName = json.tool || "表情包生成";
                setToolCalls((prev) => {
                  const lastRunningIndex = prev.findIndex((t) => t.status === "running");
                  if (lastRunningIndex !== -1) {
                    const updated = [...prev];
                    updated[lastRunningIndex] = {
                      ...updated[lastRunningIndex],
                      status: "complete",
                    };
                    return updated;
                  }
                  return prev;
                });
                scrollToBottom();
              }

              // 处理内容
              if (json.content && !json.done) {
                fullContent += json.content;
                setStreamingContent(fullContent);
                scrollToBottom();
              }

              // 处理完成
              if (json.done) {
                const finalContent = json.fullAnswer || fullContent;
                setStreamingContent(finalContent);

                // 提取图片
                if (json.images && Array.isArray(json.images)) {
                  setResultImages(json.images);
                }
              }

              // 处理错误
              if (json.error) {
                throw new Error(json.error.message || "生成失败");
              }
            } catch (parseErr) {
              console.error("解析 SSE 数据失败:", parseErr);
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "未知错误";
        setError(message);
        console.error("[Spring Festival Meme Error]", err);
      } finally {
        setLoading(false);
      }
    },
    [uploadedFile, prompt, sessionId, selectedStyle, scrollToBottom],
  );

  // 下载图片
  const handleDownload = useCallback((url: string, description: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${description}_${Date.now()}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="flex h-full">
      {/* ========== 左侧：上传和输入区域 ========== */}
      <div className="via-cyber-dark/30 h-full w-1/2 overflow-y-auto border-r border-white/10 bg-gradient-to-br from-red-950/20 to-orange-950/20 p-6">
        <div className="space-y-6">
          {/* 标题 */}
          <div>
            <GlitchText
              as="h3"
              className="font-orbitron mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-2xl font-bold text-transparent"
            >
              🧧 新春表情包生成器
            </GlitchText>
            <p className="text-sm text-white/60">上传照片，选择风格，AI 将为您生成专属新春表情包</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 文件上传区域 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <span className="font-mono text-red-400">①</span>
              <span>上传照片</span>
              <span className="text-xs text-orange-400">*</span>
            </label>

            {!uploadedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={[
                  "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                  isDragging
                    ? "border-red-500 bg-red-500/20"
                    : "border-white/20 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10",
                ].join(" ")}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className="mx-auto mb-3 h-10 w-10 text-red-400" />
                <p className="mb-1 font-mono text-sm font-bold text-white">点击或拖拽上传照片</p>
                <p className="text-xs text-white/50">支持 JPG、PNG、WEBP 格式，最大 10MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                {previewUrl && (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-red-500/20">
                    <img src={previewUrl} alt="预览" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="truncate font-mono text-sm font-bold text-white">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="flex-shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  移除
                </button>
              </div>
            )}
          </div>

          {/* 风格选择 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <span className="font-mono text-red-400">②</span>
              <span>选择风格</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={loading}
                  className={[
                    "rounded-xl border p-4 text-left transition-all disabled:opacity-50",
                    selectedStyle === style.id
                      ? "border-red-500 bg-gradient-to-br from-red-500/20 to-orange-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      : "border-white/10 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10",
                  ].join(" ")}
                >
                  <div className="mb-2 text-2xl">{style.emoji}</div>
                  <div className="font-mono text-sm font-bold text-white">{style.label}</div>
                  <div className="mt-1 text-xs text-white/50">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 场景需求输入 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <span className="font-mono text-red-400">③</span>
              <span>场景需求</span>
              <span className="text-xs text-orange-400">*</span>
            </label>

            {/* 快捷场景按钮 */}
            <div className="flex flex-wrap gap-2">
              {SCENE_EXAMPLES.map((scene) => (
                <button
                  key={scene}
                  type="button"
                  onClick={() => handleSceneClick(scene)}
                  disabled={loading}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-white disabled:opacity-50"
                >
                  {scene}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：恭喜发财、新年快乐..."
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 transition-all outline-none focus:border-red-500/50 focus:bg-white/10 disabled:opacity-50"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {!hasGenerated ? (
              <button
                onClick={handleSubmit}
                disabled={loading || !uploadedFile || !prompt.trim()}
                className="group font-orbitron relative flex-1 overflow-hidden rounded-xl border border-red-500/50 bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="absolute inset-0 translate-x-[-200%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]" />
                <div className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      生成表情包
                    </>
                  )}
                </div>
              </button>
            ) : (
              <button
                onClick={handleReset}
                disabled={loading}
                className="font-orbitron flex-1 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-bold text-white transition-all hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
              >
                重新开始
              </button>
            )}
          </div>

          {/* 工具调用状态 */}
          {toolCalls.length > 0 && (
            <div className="space-y-2">
              <div className="font-mono text-xs text-white/60">生成进度：</div>
              {toolCalls.map((tool) => (
                <div
                  key={tool.id}
                  className={[
                    "flex items-center gap-3 rounded-lg border p-3 transition-all",
                    tool.status === "running"
                      ? "border-red-400/30 bg-red-400/5"
                      : "border-green-500/30 bg-green-500/5",
                  ].join(" ")}
                >
                  <div className="flex-shrink-0">
                    {tool.status === "running" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-xs font-bold text-white">{tool.name}</div>
                    <div className="text-[10px] text-white/50">{tool.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== 右侧：结果展示区域 ========== */}
      <div className="h-full w-1/2 overflow-y-auto bg-gradient-to-br from-black/40 via-red-950/10 to-orange-950/10 p-6">
        <div className="flex h-full flex-col">
          {/* 标题 */}
          <div className="mb-4 flex items-center justify-between">
            <GlitchText
              as="h3"
              className="font-orbitron bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-lg text-transparent"
            >
              生成结果
            </GlitchText>
            {resultImages.length > 0 && (
              <span className="animate-pulse font-mono text-xs text-green-400">[ 生成完成 ]</span>
            )}
          </div>

          {/* 输出容器 */}
          <NeonBorder
            color="gradient"
            intensity={resultImages.length > 0 ? "high" : "low"}
            animated={resultImages.length > 0}
            className="flex-1"
          >
            <div className="flex h-full flex-col bg-black/60">
              {/* 终端标题栏 */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500/50" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <span className="h-2 w-2 rounded-full bg-green-500/50" />
                <span className="ml-2 font-mono text-[10px] text-white/30">
                  {resultImages.length > 0 ? "spring_festival_meme.md" : "waiting_for_upload..."}
                </span>
              </div>

              {/* 内容区 */}
              <div ref={outputRef} className="flex-1 overflow-y-auto p-4">
                {!hasGenerated ? (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="mb-4 text-4xl">🧧</div>
                      <p className="font-mono text-sm">上传照片开始生成</p>
                    </div>
                  </div>
                ) : loading && resultImages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="mb-4 animate-pulse text-4xl">🎨</div>
                      <p className="font-mono text-sm">正在生成新春表情包...</p>
                      {streamingContent && (
                        <p className="mt-2 text-xs text-white/50">{streamingContent}</p>
                      )}
                    </div>
                  </div>
                ) : resultImages.length > 0 ? (
                  <div className="space-y-4">
                    {/* 图片展示 */}
                    <div className="grid grid-cols-2 gap-4">
                      {resultImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5"
                        >
                          <img src={img.url} alt={img.description} className="h-auto w-full" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleDownload(img.url, img.description)}
                              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all hover:bg-white/20"
                            >
                              <Download className="mr-2 inline h-4 w-4" />
                              下载
                            </button>
                          </div>
                          <div className="border-t border-white/10 p-2 text-center text-xs text-white/60">
                            {img.description}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 文字说明 */}
                    {streamingContent && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm whitespace-pre-wrap text-white/80">
                          {streamingContent}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <div className="text-center">
                      <div className="mb-4 text-4xl">⏳</div>
                      <p className="font-mono text-sm">等待生成结果...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </NeonBorder>
        </div>
      </div>
    </div>
  );
}
