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
                    : tool
                )
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
        className="relative mb-4 flex-1 overflow-y-auto rounded-2xl border border-cyber-cyan/20 bg-black/40 p-4 backdrop-blur-sm"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent animate-[scan-line_4s_linear_infinite]" />
        </div>

        {/* 拖拽遮罩 */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-cyber-cyan/10 border-2 border-dashed border-cyber-cyan/50 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <Upload className="w-12 h-12 text-cyber-cyan mx-auto mb-3 animate-bounce" />
              <div className="text-lg font-orbitron font-bold text-cyber-cyan">
                释放以上传图片
              </div>
              <div className="text-xs text-white/60 font-mono mt-2">
                支持 PNG, JPG, WEBP 格式
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-start justify-start gap-6 p-6 relative z-10">
            {/* Header */}
            <div className="flex gap-4 w-full">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                <Wand2 className="w-7 h-7 text-cyber-cyan" />
              </div>
              <div className="flex-1">
                <div className="mb-3 text-base font-orbitron font-bold text-cyber-cyan tracking-wide">
                  {WELCOME.greeting}
                </div>
                <p className="mb-2 text-sm leading-relaxed text-white/70">
                  {WELCOME.description}
                </p>
                <p className="text-xs text-white/50 font-mono">{WELCOME.cta}</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="w-full">
              <div className="text-xs font-mono text-cyber-cyan/60 uppercase tracking-wider mb-3">
                ▸ Core Features
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WELCOME.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 p-4 transition-all hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {feature.name}
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
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
                          className="w-full text-left rounded px-2 py-1 text-[10px] font-mono text-cyber-cyan/70 transition-all hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                        >
                          → {example}
                        </button>
                      ))}
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full">
              <div className="text-xs font-mono text-cyber-cyan/60 uppercase tracking-wider mb-2">
                ▸ Quick Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {WELCOME.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExampleClick(action)}
                    className="rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 px-4 py-3 text-xs text-white/80 transition-all hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] group"
                  >
                    <span className="font-mono group-hover:text-cyber-cyan transition-colors whitespace-nowrap">
                      {action}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="w-full rounded-lg border border-cyber-purple/20 bg-cyber-purple/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyber-purple flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-cyber-purple mb-1">
                    💡 Pro Tips
                  </div>
                  <ul className="space-y-1 text-[10px] text-white/60 font-mono">
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
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                      <Wand2 className="w-5 h-5 text-cyber-cyan" />
                    </div>
                  )}
                  <div
                    className={[
                      "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed relative",
                      msg.role === "user"
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-cyber-cyan/5 text-white/90 border border-cyber-cyan/20 shadow-[0_0_10px_rgba(0,243,255,0.05)]",
                    ].join(" ")}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content.replace(/https?:\/\/[^\s\)\]]+/g, '').replace(/\s+/g, ' ').trim()}
                    </div>
                    
                    {msg.uploadedImage && (
                      <div className="mt-3 rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 p-2 flex items-center gap-2">
                        <img
                          src={msg.uploadedImage.preview}
                          alt={msg.uploadedImage.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {msg.uploadedImage.name}
                          </div>
                          <div className="text-[10px] text-cyber-cyan/60 font-mono">
                            已上传
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.resultImages && msg.resultImages.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 border-t border-cyber-cyan/20 pt-3">
                          <ImageIcon className="w-4 h-4 text-cyber-cyan" />
                          <span className="text-xs font-mono font-semibold text-cyber-cyan uppercase tracking-wider">
                            处理结果 ({msg.resultImages.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {msg.resultImages.map((image, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="group relative overflow-hidden rounded-lg border-2 border-cyber-cyan/30 bg-black/60 p-3 transition-all hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                            >
                              <div 
                                className="relative cursor-pointer overflow-hidden rounded max-h-[400px] flex items-center justify-center bg-black/40"
                                onClick={() => window.open(image.url, '_blank')}
                              >
                                <img
                                  src={image.url}
                                  alt={image.description}
                                  className="max-h-[400px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end justify-center pb-4">
                                  <span className="text-xs font-mono text-cyber-cyan">
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
                                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-cyber-cyan/30 bg-cyber-cyan/10 text-xs transition-all hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 hover:shadow-[0_0_10px_rgba(0,243,255,0.3)]"
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
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                      <span className="text-sm">👤</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && streamingContent && (
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)] animate-pulse">
                  <Wand2 className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div className="max-w-[80%] rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 px-4 py-3 text-sm leading-relaxed text-white/90 shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                  <div className="whitespace-pre-wrap">{streamingContent}</div>
                  <span className="inline-block h-4 w-1 animate-pulse bg-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                </div>
              </div>
            )}

            {loading && !streamingContent && (
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                  <Wand2 className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="w-fit rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 px-4 py-3 text-sm leading-relaxed text-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-3 w-3 items-center justify-center">
                        <div className="absolute h-3 w-3 animate-ping rounded-full bg-cyber-cyan opacity-75" />
                        <div className="relative h-2 w-2 rounded-full bg-cyber-cyan" />
                      </div>
                      <span className="font-mono animate-pulse whitespace-nowrap">[ PROCESSING IMAGE ]</span>
                    </div>
                  </div>
                  
                  {streamingTools.length > 0 && (
                    <div className="space-y-2">
                      {streamingTools.map((tool) => (
                        <div
                          key={tool.id}
                          className={[
                            "group flex items-center gap-3 rounded-lg border px-4 py-2.5 text-xs transition-all relative overflow-hidden",
                            tool.status === "running"
                              ? "animate-slideIn border-cyber-cyan/40 bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                              : "border-white/10 bg-white/5 opacity-70",
                          ].join(" ")}
                        >
                          {tool.status === "running" && (
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent animate-[scan-line_2s_linear_infinite]" />
                            </div>
                          )}
                          
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center relative z-10">
                            {tool.status === "running" ? (
                              <div className="relative flex h-3 w-3 items-center justify-center">
                                <div className="absolute h-3 w-3 animate-ping rounded-full bg-cyber-cyan opacity-75" />
                                <div className="relative h-2 w-2 rounded-full bg-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                              </div>
                            ) : (
                              <div className="text-green-400 text-sm">✓</div>
                            )}
                          </div>
                          <span className="font-mono flex-1 truncate text-white/80">{tool.description}</span>
                          {tool.status === "running" && (
                            <div className="flex gap-0.5">
                              <div className="w-1 h-1 rounded-full bg-cyber-cyan animate-pulse" />
                              <div className="w-1 h-1 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <div className="w-1 h-1 rounded-full bg-cyber-cyan animate-pulse" style={{ animationDelay: '0.4s' }} />
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
        <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200 font-mono shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex flex-col gap-3">
        {uploadedFile && previewUrl && (
          <div className="rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 p-3">
            <div className="flex items-start gap-3">
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border border-cyber-cyan/30">
                <img
                  src={previewUrl}
                  alt={uploadedFile.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white text-xs hover:bg-red-500 transition-colors"
                  title="移除图片"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate mb-1">
                  {uploadedFile.name}
                </div>
                <div className="text-[10px] text-cyber-cyan/60 font-mono">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="mt-2 text-[10px] text-white/50 font-mono">
                  ✓ 图片已就绪，输入编辑指令或直接处理
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3 rounded-lg border border-cyber-cyan/20 bg-black/40 p-3 backdrop-blur-sm shadow-[0_0_15px_rgba(0,243,255,0.05)]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded border border-cyber-cyan/30 bg-cyber-cyan/10 transition-all hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            aria-label="上传图片"
            title="上传图片"
          >
            <Upload className="w-4 h-4 text-cyber-cyan" />
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
              "flex-1 resize-none rounded border px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 font-mono leading-tight",
              uploadedFile
                ? "border-cyber-cyan/20 bg-black/60 focus:ring-cyber-cyan/30 focus:border-cyber-cyan/40"
                : "border-white/10 bg-black/40 focus:ring-white/20 focus:border-white/20",
            ].join(" ")}
          />

          <button
            type="button"
            disabled={!uploadedFile || loading}
            onClick={loading ? handleAbort : run}
            className={[
              "relative h-9 rounded px-4 text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2",
              loading
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : !uploadedFile
                  ? "cursor-not-allowed bg-white/5 text-white/30 border border-white/10 opacity-50"
                  : "bg-cyber-cyan text-black border border-cyber-cyan hover:bg-cyber-cyan/90 shadow-[0_0_20px_rgba(0,243,255,0.3)]",
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
                <Send className="w-3 h-3" />
                Process
              </>
            )}
          </button>
        </div>

        <div className="font-mono px-2 text-[9px] tracking-wider text-cyber-cyan/40 uppercase flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
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
