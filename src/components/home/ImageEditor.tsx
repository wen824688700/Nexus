"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Send, X, Wand2, Sparkles, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ToolCall = {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  description: string;
  progress?: string;
};

type ImageResult = {
  url: string;
  description: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  uploadedImage?: { name: string; preview: string };
  resultImages?: ImageResult[];
  toolCalls?: ToolCall[];
};

const WELCOME = {
  greeting: "[ IMAGE EDITOR SYSTEM ONLINE ]",
  description:
    "AI 驱动的智能图像编辑工具，支持抠图、放大、面部修复和 FLUX 创意编辑。一键处理，专业品质。",
  cta: "上传图片或输入编辑需求，系统将智能选择最佳工具为您处理。",
  features: [
    {
      icon: "🎨",
      name: "智能抠图",
      description: "一键移除背景，生成透明 PNG",
      examples: ["移除这张图的背景", "帮我抠图"],
    },
    {
      icon: "🔍",
      name: "智能放大",
      description: "AI 放大 2x/4x，提升画质",
      examples: ["放大这张图片 2 倍", "高清化处理"],
    },
    {
      icon: "👤",
      name: "面部修复",
      description: "修复模糊人脸，恢复细节",
      examples: ["修复这张老照片", "让人脸更清晰"],
    },
    {
      icon: "✨",
      name: "FLUX 创意",
      description: "风格转换、局部重绘、特效",
      examples: ["转成油画风格", "把衣服换成红色"],
    },
  ],
  quickActions: [
    "上传图片 → 智能抠图",
    "放大图片 2 倍并增强画质",
    "修复模糊人脸 + 抠图",
    "转换成赛博朋克风格",
  ],
};

export function ImageEditor({ agentKey }: { agentKey: string }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingTools, setStreamingTools] = useState<ToolCall[]>([]);
  const [streamingImages, setStreamingImages] = useState<ImageResult[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [sessionId] = useState(() => `user_${Date.now()}`);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // 处理文件选择
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  }

  // 移除文件
  function removeFile() {
    setUploadedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // 拖拽处理
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  }

  // 中止请求
  function handleAbort() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setStreamingContent("");
    setStreamingTools([]);
    setStreamingImages([]);
  }

  // 发送请求
  async function run() {
    // 验证必须有图片
    if (!uploadedFile) {
      setError("请先上传图片");
      return;
    }

    const finalPrompt = prompt.trim() || "请处理这张图片";

    const userMessage: Message = {
      role: "user",
      content: finalPrompt,
      timestamp: Date.now(),
      uploadedImage: { name: uploadedFile.name, preview: previewUrl },
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setError(null);
    setStreamingContent("");
    setStreamingTools([]);
    setStreamingImages([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const fd = new FormData();
      fd.set("query", finalPrompt);
      fd.set("session_id", sessionId);
      fd.append("file_0", uploadedFile);
      fd.set("file_count", "1");

      const res = await fetch(`/api/agents/${agentKey}/run`, {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(json.error?.message || "请求失败");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      if (!reader) throw new Error("无法读取响应流");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const json = JSON.parse(data);

            // 处理工具事件
            if (json.type === "tool_start") {
              setStreamingTools((prev) => [
                ...prev,
                {
                  id: `${json.tool}_${Date.now()}`,
                  name: json.tool,
                  status: "running",
                  description: json.description || `正在执行 ${json.tool}...`,
                },
              ]);
            } else if (json.type === "tool_complete") {
              setStreamingTools((prev) =>
                prev.map((tool) =>
                  tool.name === json.tool && tool.status === "running"
                    ? { ...tool, status: "completed" as const }
                    : tool,
                ),
              );
            }

            // 处理内容
            if (json.content) {
              fullContent += json.content;
              setStreamingContent(fullContent);
            }

            // 处理完成
            if (json.done) {
              const assistantMessage: Message = {
                role: "assistant",
                content: fullContent,
                timestamp: Date.now(),
                resultImages: json.images || [],
                toolCalls: streamingTools.length > 0 ? streamingTools : undefined,
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent("");
              setStreamingTools([]);
              setStreamingImages(json.images || []);
              setPrompt("");
              removeFile();
              break;
            }
          } catch {}
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      const errorMsg = error instanceof Error ? error.message : "未知错误";
      setError(errorMsg);
      const errorMessage: Message = {
        role: "assistant",
        content: `抱歉，处理失败：${errorMsg}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function handleExampleClick(example: string) {
    setPrompt(example);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (uploadedFile) {
        run();
      }
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Chat Area */}
      <div
        className="border-cyber-cyan/20 relative mb-4 flex-1 overflow-y-auto rounded-2xl border bg-black/40 p-4 backdrop-blur-sm"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Scan Line Effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="via-cyber-cyan/20 absolute h-[2px] w-full animate-[scan-line_4s_linear_infinite] bg-gradient-to-r from-transparent to-transparent" />
        </div>

        {/* 拖拽遮罩 */}
        {isDragging && (
          <div className="bg-cyber-cyan/10 border-cyber-cyan/50 absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-2 border-dashed backdrop-blur-sm">
            <div className="text-center">
              <Upload className="text-cyber-cyan mx-auto mb-3 h-12 w-12 animate-bounce" />
              <div className="font-orbitron text-cyber-cyan text-lg font-bold">释放以上传图片</div>
              <div className="mt-2 font-mono text-xs text-white/60">支持 PNG, JPG, WEBP 格式</div>
            </div>
          </div>
        )}

        {messages.length === 0 && !loading ? (
          <div className="relative z-10 flex h-full flex-col items-start justify-start gap-6 p-6">
            {/* Header */}
            <div className="flex w-full gap-4">
              <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                <Wand2 className="text-cyber-cyan h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="font-orbitron text-cyber-cyan mb-3 text-base font-bold tracking-wide">
                  {WELCOME.greeting}
                </div>
                <p className="mb-2 text-sm leading-relaxed text-white/70">{WELCOME.description}</p>
                <p className="font-mono text-xs text-white/50">{WELCOME.cta}</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="w-full">
              <div className="text-cyber-cyan/60 mb-3 font-mono text-xs tracking-wider uppercase">
                ▸ Core Features
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {WELCOME.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group border-cyber-cyan/20 bg-cyber-cyan/5 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{feature.name}</div>
                        <div className="font-mono text-[10px] text-white/50">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {feature.examples.map((example, exIdx) => (
                        <button
                          key={exIdx}
                          type="button"
                          onClick={() => handleExampleClick(example)}
                          className="text-cyber-cyan/70 hover:bg-cyber-cyan/10 hover:text-cyber-cyan w-full rounded px-2 py-1 text-left font-mono text-[10px] transition-all"
                        >
                          → {example}
                        </button>
                      ))}
                    </div>
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="via-cyber-cyan/50 absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full">
              <div className="text-cyber-cyan/60 mb-2 font-mono text-xs tracking-wider uppercase">
                ▸ Quick Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {WELCOME.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExampleClick(action)}
                    className="border-cyber-cyan/20 bg-cyber-cyan/5 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 group rounded-lg border px-4 py-3 text-xs text-white/80 transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                  >
                    <span className="group-hover:text-cyber-cyan font-mono whitespace-nowrap transition-colors">
                      {action}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="border-cyber-purple/20 bg-cyber-purple/5 w-full rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="text-cyber-purple mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="text-cyber-purple mb-1 text-xs font-semibold">💡 Pro Tips</div>
                  <ul className="space-y-1 font-mono text-[10px] text-white/60">
                    <li>• 支持组合处理：面部修复 → 抠图 → 放大</li>
                    <li>• 图片格式：PNG, JPG, WEBP（最大 10MB）</li>
                    <li>• FLUX 编辑需要 2-3 分钟，请耐心等待</li>
                    <li>• 所有结果保存 7 天，可随时下载</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  className={[
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  {msg.role === "assistant" && (
                    <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                      <Wand2 className="text-cyber-cyan h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={[
                      "relative max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "border border-white/20 bg-white/10 text-white"
                        : "bg-cyber-cyan/5 border-cyber-cyan/20 border text-white/90 shadow-[0_0_10px_rgba(0,243,255,0.05)]",
                    ].join(" ")}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content
                        .replace(/https?:\/\/[^\s\)\]]+/g, "")
                        .replace(/\s+/g, " ")
                        .trim()}
                    </div>

                    {msg.uploadedImage && (
                      <div className="border-cyber-cyan/20 bg-cyber-cyan/5 mt-3 flex items-center gap-2 rounded-lg border p-2">
                        <img
                          src={msg.uploadedImage.preview}
                          alt={msg.uploadedImage.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold text-white">
                            {msg.uploadedImage.name}
                          </div>
                          <div className="text-cyber-cyan/60 font-mono text-[10px]">已上传</div>
                        </div>
                      </div>
                    )}

                    {msg.resultImages && msg.resultImages.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="border-cyber-cyan/20 flex items-center gap-2 border-t pt-3">
                          <ImageIcon className="text-cyber-cyan h-4 w-4" />
                          <span className="text-cyber-cyan font-mono text-xs font-semibold tracking-wider uppercase">
                            处理结果 ({msg.resultImages.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {msg.resultImages.map((image, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="group border-cyber-cyan/30 hover:border-cyber-cyan/50 relative overflow-hidden rounded-lg border-2 bg-black/60 p-3 transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                            >
                              <div
                                className="relative flex max-h-[400px] cursor-pointer items-center justify-center overflow-hidden rounded bg-black/40"
                                onClick={() => window.open(image.url, "_blank")}
                              >
                                <img
                                  src={image.url}
                                  alt={image.description}
                                  className="max-h-[400px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-4 opacity-0 transition-opacity group-hover:opacity-100">
                                  <span className="text-cyber-cyan font-mono text-xs">
                                    点击在新标签页打开
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="flex-1 truncate text-xs font-medium text-white/90">
                                  {image.description}
                                </span>
                                <a
                                  href={image.url}
                                  download
                                  className="border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border text-xs transition-all hover:shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                                  title="下载图片"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  ⬇
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
                      <span className="text-sm">👤</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && streamingContent && (
              <div className="flex gap-3">
                <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                  <Wand2 className="text-cyber-cyan h-5 w-5" />
                </div>
                <div className="bg-cyber-cyan/5 border-cyber-cyan/20 max-w-[80%] rounded-lg border px-4 py-3 text-sm leading-relaxed text-white/90 shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                  <div className="whitespace-pre-wrap">{streamingContent}</div>
                  <span className="bg-cyber-cyan inline-block h-4 w-1 animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                </div>
              </div>
            )}

            {loading && !streamingContent && (
              <div className="flex gap-3">
                <div className="from-cyber-cyan/20 to-cyber-purple/20 border-cyber-cyan/30 flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-lg border bg-gradient-to-br shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                  <Wand2 className="text-cyber-cyan h-5 w-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-cyber-cyan/5 border-cyber-cyan/20 text-cyber-cyan w-fit rounded-lg border px-4 py-3 text-sm leading-relaxed shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-3 w-3 items-center justify-center">
                        <div className="bg-cyber-cyan absolute h-3 w-3 animate-ping rounded-full opacity-75" />
                        <div className="bg-cyber-cyan relative h-2 w-2 rounded-full" />
                      </div>
                      <span className="animate-pulse font-mono whitespace-nowrap">
                        [ PROCESSING IMAGE ]
                      </span>
                    </div>
                  </div>

                  {streamingTools.length > 0 && (
                    <div className="space-y-2">
                      {streamingTools.map((tool) => (
                        <div
                          key={tool.id}
                          className={[
                            "group relative flex items-center gap-3 overflow-hidden rounded-lg border px-4 py-2.5 text-xs transition-all",
                            tool.status === "running"
                              ? "animate-slideIn border-cyber-cyan/40 bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                              : "border-white/10 bg-white/5 opacity-70",
                          ].join(" ")}
                        >
                          {tool.status === "running" && (
                            <div className="pointer-events-none absolute inset-0">
                              <div className="via-cyber-cyan/50 absolute h-[1px] w-full animate-[scan-line_2s_linear_infinite] bg-gradient-to-r from-transparent to-transparent" />
                            </div>
                          )}

                          <div className="relative z-10 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                            {tool.status === "running" ? (
                              <div className="relative flex h-3 w-3 items-center justify-center">
                                <div className="bg-cyber-cyan absolute h-3 w-3 animate-ping rounded-full opacity-75" />
                                <div className="bg-cyber-cyan relative h-2 w-2 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                              </div>
                            ) : (
                              <div className="text-sm text-green-400">✓</div>
                            )}
                          </div>
                          <span className="flex-1 truncate font-mono text-white/80">
                            {tool.description}
                          </span>
                          {tool.status === "running" && (
                            <div className="flex gap-0.5">
                              <div className="bg-cyber-cyan h-1 w-1 animate-pulse rounded-full" />
                              <div
                                className="bg-cyber-cyan h-1 w-1 animate-pulse rounded-full"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <div
                                className="bg-cyber-cyan h-1 w-1 animate-pulse rounded-full"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex flex-col gap-3">
        {uploadedFile && previewUrl && (
          <div className="border-cyber-cyan/20 bg-cyber-cyan/5 rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <div className="border-cyber-cyan/30 relative h-20 w-20 flex-shrink-0 overflow-hidden rounded border">
                <img
                  src={previewUrl}
                  alt={uploadedFile.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-xs text-white transition-colors hover:bg-red-500"
                  title="移除图片"
                >
                  ×
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 truncate text-xs font-semibold text-white">
                  {uploadedFile.name}
                </div>
                <div className="text-cyber-cyan/60 font-mono text-[10px]">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="mt-2 font-mono text-[10px] text-white/50">
                  ✓ 图片已就绪，输入编辑指令或直接处理
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-cyber-cyan/20 flex items-end gap-3 rounded-lg border bg-black/40 p-3 shadow-[0_0_15px_rgba(0,243,255,0.05)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-cyber-cyan/30 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border transition-all hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            aria-label="上传图片"
            title="上传图片"
          >
            <Upload className="text-cyber-cyan h-4 w-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              uploadedFile
                ? "输入编辑指令...（Enter 发送，Shift+Enter 换行）"
                : "输入编辑指令...（需先上传图片）"
            }
            rows={1}
            className={[
              "flex-1 resize-none rounded border px-4 py-2.5 font-mono text-xs leading-tight text-white placeholder:text-white/30 focus:ring-2 focus:outline-none",
              uploadedFile
                ? "border-cyber-cyan/20 focus:ring-cyber-cyan/30 focus:border-cyber-cyan/40 bg-black/60"
                : "border-white/10 bg-black/40 focus:border-white/20 focus:ring-white/20",
            ].join(" ")}
          />

          <button
            type="button"
            disabled={!uploadedFile || loading}
            onClick={loading ? handleAbort : run}
            className={[
              "relative flex h-9 items-center gap-2 rounded px-4 font-mono text-[10px] font-bold tracking-widest uppercase transition-all",
              loading
                ? "border border-red-500/30 bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-500/30"
                : !uploadedFile
                  ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/30 opacity-50"
                  : "bg-cyber-cyan border-cyber-cyan hover:bg-cyber-cyan/90 border text-black shadow-[0_0_20px_rgba(0,243,255,0.3)]",
            ].join(" ")}
            title={!uploadedFile ? "请先上传图片" : loading ? "点击停止" : "开始处理"}
          >
            {loading ? (
              <>
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute h-2 w-2 rounded-sm bg-red-400" />
                  <span className="absolute h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-red-400" />
                </span>
                Stop
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                Process
              </>
            )}
          </button>
        </div>

        <div className="text-cyber-cyan/40 flex items-center gap-2 px-2 font-mono text-[9px] tracking-wider uppercase">
          <Sparkles className="h-3 w-3" />
          <span>
            {uploadedFile
              ? "支持：抠图 / 放大 / 面部修复 / FLUX 创意编辑"
              : "请上传图片开始编辑 • PNG / JPG / WEBP • 最大 10MB"}
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
