"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X, Sparkles, Image as ImageIcon } from "lucide-react";

type Mode = "txt2img" | "img_edit";

type Message = {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: number;
};

type Props = {
  agentKey: string;
};

const LOADING_STAGES = [
  "[ INITIALIZING WORKFLOW ]",
  "[ CONNECTING TO BANANA PIPELINE ]",
  "[ PROCESSING VISUAL DATA ]",
  "[ OPTIMIZING LIGHTING & TEXTURE ]",
  "[ APPLYING ARTISTIC FILTERS ]",
  "[ FINALIZING RENDER ]",
];

const WELCOME_TXT2IMG = {
  greeting: "[ PORTRAIT STUDIO SYSTEM ONLINE ]",
  description:
    "专业级 AI 肖像生成系统。支持 Vogue 级虚拟肖像、电影质感大片、艺术风格定制。",
  cta: "输入风格描述或上传参考图片，系统将生成高质量肖像作品。",
  suggestions: [
    "极简主义男士肖像 → 黑白高对比",
    "赛博朋克女性大片 → 霓虹冷暖色",
    "胶片质感艺术肖像 → 柔光侧面",
  ],
};

const WELCOME_IMG_EDIT = {
  greeting: "[ IMAGE EDITING MODE ACTIVE ]",
  description: "上传照片并描述修改需求，系统将进行专业级重塑与精修处理。",
  cta: "上传图片 → 输入编辑指令 → 生成优化结果",
  suggestions: [
    "80 年代复古港风 → 色调重塑",
    "优化光影肤色 → 保持自然质感",
    "背景虚化处理 → 突出人物主体",
  ],
};

export function PortraitStudio({ agentKey }: Props) {
  const [mode, setMode] = useState<Mode>("txt2img");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingStage((prev) => {
        const next = prev + 1;
        return next >= LOADING_STAGES.length ? prev : next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleAbort() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    const abortMessage: Message = {
      role: "assistant",
      content: "已中止生成请求。",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, abortMessage]);
  }

  async function run() {
    if (!prompt.trim() || (mode === "img_edit" && !file)) return;

    const userMessage: Message = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setError(null);
    setLoadingStage(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const fd = new FormData();
      fd.set("mode", mode);
      fd.set("prompt", prompt);
      if (mode === "img_edit" && file) fd.set("image", file);

      const res = await fetch(`/api/agents/${encodeURIComponent(agentKey)}/run`, {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });

      const json = (await res.json()) as
        | {
            image_urls?: string[];
            text?: string | null;
            debug?: unknown;
            error?: { message?: string };
          }
        | { error?: { message?: string } };

      if (!res.ok) {
        throw new Error(
          json && "error" in json ? json.error?.message || "Request failed" : "Request failed",
        );
      }

      const urls = "image_urls" in json ? (json.image_urls ?? []) : [];
      if (!urls.length) {
        throw new Error("未能生成图片，请稍后重试。");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: "已为您生成专业级肖像，点击下载保存原图。",
        imageUrl: urls[0],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setPrompt("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      const errorMessage: Message = {
        role: "assistant",
        content: `抱歉，生成失败：${e instanceof Error ? e.message : "未知错误"}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setPrompt(suggestion);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      run();
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-cyber-cyan/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-cyber-cyan/10 border border-cyber-cyan/30">
            <Camera className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.2em] text-cyber-cyan uppercase">
              Portrait Studio
            </div>
            <div className="font-mono text-[10px] text-white/40">
              v3.0.2 | AI Art Director
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
            <span className="text-[10px] font-mono tracking-widest text-cyber-cyan/80 uppercase">
              Online
            </span>
          </div>
          <div className="flex rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("txt2img");
                setError(null);
              }}
              className={[
                "rounded-md px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-1.5",
                mode === "txt2img" 
                  ? "bg-cyber-cyan text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]" 
                  : "text-white/60 hover:text-cyber-cyan hover:bg-cyber-cyan/10",
              ].join(" ")}
            >
              <Sparkles className="w-3 h-3" />
              TXT→IMG
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("img_edit");
                setError(null);
              }}
              className={[
                "rounded-md px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-1.5",
                mode === "img_edit" 
                  ? "bg-cyber-cyan text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]" 
                  : "text-white/60 hover:text-cyber-cyan hover:bg-cyber-cyan/10",
              ].join(" ")}
            >
              <ImageIcon className="w-3 h-3" />
              IMG→EDIT
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Messages */}
          <div className="relative mb-4 flex-1 overflow-y-auto rounded-2xl border border-cyber-cyan/20 bg-black/40 p-4 backdrop-blur-sm">
            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent animate-[scan-line_4s_linear_infinite]" />
            </div>
            
            {messages.length === 0 && !loading ? (
              <div className="flex h-full flex-col items-start justify-start gap-5 p-6 relative z-10">
                <div className="flex gap-4 w-full">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                    <Camera className="w-6 h-6 text-cyber-cyan" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-3 text-sm font-orbitron font-bold text-cyber-cyan tracking-wide">
                      {mode === "txt2img" ? WELCOME_TXT2IMG.greeting : WELCOME_IMG_EDIT.greeting}
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-white/70">
                      {mode === "txt2img"
                        ? WELCOME_TXT2IMG.description
                        : WELCOME_IMG_EDIT.description}
                    </p>
                    <p className="text-xs text-white/50 font-mono">{mode === "txt2img" ? WELCOME_TXT2IMG.cta : WELCOME_IMG_EDIT.cta}</p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2.5">
                  <div className="text-xs font-mono text-cyber-cyan/60 uppercase tracking-wider mb-1">
                    ▸ Quick Actions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(mode === "txt2img"
                      ? WELCOME_TXT2IMG.suggestions
                      : WELCOME_IMG_EDIT.suggestions
                    ).map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="rounded-lg border border-cyber-cyan/20 bg-cyber-cyan/5 px-4 py-3 text-xs text-white/80 transition-all hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)] group"
                      >
                        <span className="font-mono group-hover:text-cyber-cyan transition-colors whitespace-nowrap">
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={[
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {msg.role === "assistant" ? (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                        <Camera className="w-5 h-5 text-cyber-cyan" />
                      </div>
                    ) : null}
                    <div
                      className={[
                        "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed relative",
                        msg.role === "user"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-cyber-cyan/5 text-white/90 border border-cyber-cyan/20 shadow-[0_0_10px_rgba(0,243,255,0.05)]",
                      ].join(" ")}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.imageUrl ? (
                        <div className="mt-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.imageUrl}
                            alt="Generated"
                            className="max-h-64 rounded-lg border-2 border-cyber-cyan/30 object-contain shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                          />
                          <div className="mt-3 flex gap-2">
                            <a
                              href={msg.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest text-cyber-cyan uppercase hover:bg-cyber-cyan/20 hover:border-cyber-cyan/50 transition-all"
                            >
                              查看原图
                            </a>
                            <a
                              href={msg.imageUrl}
                              download
                              className="rounded-md bg-cyber-cyan px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest text-black uppercase hover:bg-cyber-cyan/80 transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                            >
                              下载
                            </a>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {msg.role === "user" ? (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                        <span className="text-sm">👤</span>
                      </div>
                    ) : null}
                  </div>
                ))}

                {loading ? (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                      <Camera className="w-5 h-5 text-cyber-cyan" />
                    </div>
                    <div className="max-w-[80%] rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 px-4 py-3 text-sm leading-relaxed text-cyber-cyan shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-3 w-3 items-center justify-center">
                          <div className="absolute h-3 w-3 animate-ping rounded-full bg-cyber-cyan opacity-75" />
                          <div className="relative h-2 w-2 rounded-full bg-cyber-cyan" />
                        </div>
                        <span className="font-mono animate-pulse">{LOADING_STAGES[loadingStage]}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error ? (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200 font-mono shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                <span>{error}</span>
              </div>
            </div>
          ) : null}

          {/* Input Area */}
          <div className="flex items-end gap-3 rounded-2xl border border-cyber-cyan/20 bg-cyber-cyan/5 p-4 backdrop-blur-sm">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "txt2img"
                  ? "▸ 描述风格：发型 / 光影 / 镜头 / 背景 / 质感...（Enter 发送）"
                  : "▸ 编辑指令：皮肤质感 / 发丝细节 / 光影 / 背景 / 风格..."
              }
              className="min-h-[44px] flex-1 resize-none rounded-lg border border-cyber-cyan/20 bg-black/40 px-4 py-3 text-xs text-white placeholder:text-white/40 placeholder:font-mono focus:ring-2 focus:ring-cyber-cyan/30 focus:outline-none focus:border-cyber-cyan/40 transition-all"
            />
            <button
              type="button"
              disabled={!loading && (!prompt.trim() || (mode === "img_edit" && !file))}
              onClick={loading ? handleAbort : run}
              className={[
                "relative h-[44px] rounded-lg px-5 text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2",
                loading
                  ? "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                  : !prompt.trim() || (mode === "img_edit" && !file)
                    ? "cursor-not-allowed bg-white/5 border border-white/10 text-white/30"
                    : "bg-cyber-cyan border border-cyber-cyan text-black hover:bg-cyber-cyan/80 shadow-[0_0_15px_rgba(0,243,255,0.3)]",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute h-2 w-2 rounded-sm bg-red-300" />
                    <span className="absolute h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-red-300" />
                  </span>
                  Stop
                </>
              ) : mode === "txt2img" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  Retouch
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar: Info Panel */}
        <div className="w-80 flex-shrink-0">
          <div className="rounded-2xl border border-cyber-cyan/20 bg-cyber-cyan/5 p-5 backdrop-blur-sm h-full">
            <div className="mb-3 text-sm font-orbitron font-bold tracking-wide text-cyber-cyan">
              AI 肖像艺术指导系统
            </div>
            <p className="text-xs leading-relaxed text-white/70 font-mono mb-4">
              {mode === "txt2img"
                ? "▸ 输入风格描述 → 生成专业级肖像 → 下载高清原图"
                : "▸ 上传照片 → 输入编辑指令 → 专业级重塑输出"}
            </p>

            {mode === "img_edit" ? (
              <div className="mt-4">
                {file ? (
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-lg border-2 border-cyber-cyan/30 bg-black shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl || undefined}
                        alt="Uploaded"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white truncate">{file.name}</div>
                      <div className="font-mono mt-1 text-[10px] text-cyber-cyan/60">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 px-3 py-1 text-[10px] font-mono font-bold tracking-widest text-white/80 uppercase hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 transition-all flex items-center gap-1"
                          onClick={() => {
                            setFile(null);
                            if (inputRef.current) inputRef.current.value = "";
                          }}
                        >
                          <X className="w-3 h-3" />
                          Remove
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 px-3 py-1 text-[10px] font-mono font-bold tracking-widest text-white/80 uppercase hover:bg-cyber-cyan/10 hover:border-cyber-cyan/40 transition-all flex items-center gap-1"
                          onClick={() => inputRef.current?.click()}
                        >
                          <Upload className="w-3 h-3" />
                          Replace
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="group flex w-full items-center justify-between rounded-lg border border-dashed border-cyber-cyan/30 bg-black/40 px-4 py-4 text-left transition-all hover:bg-black/60 hover:border-cyber-cyan/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                    onClick={() => inputRef.current?.click()}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <Upload className="w-4 h-4 text-cyber-cyan" />
                        上传参考照片
                      </div>
                      <div className="font-mono mt-1 text-[10px] text-white/50">PNG / JPG / WEBP</div>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.2em] text-cyber-cyan/60 uppercase group-hover:text-cyber-cyan transition-colors">
                      Choose
                    </div>
                  </button>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
