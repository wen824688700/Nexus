"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Globe,
  Youtube,
  MessageCircle,
  Cpu,
  Filter,
  Languages,
  Sparkles,
  Workflow,
  ArrowRight,
  Activity,
} from "lucide-react";
import { GlitchText } from "@/components/cyber";

interface StageLabelProps {
  step: string;
  title: string;
  subtitle: string;
  active: boolean;
  align: "left" | "center" | "right";
}

interface SourceCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isActive: boolean;
  delay: number;
}

interface ProcessingStepProps {
  icon: React.ReactNode;
  text: string;
  sub: string;
  color: string;
  barColor: string;
  delay: number;
}

interface OutputCardProps {
  title: string;
  type: string;
  count: string;
  active: boolean;
  delay: number;
}

const StageLabel = ({ step, title, subtitle, active, align }: StageLabelProps) => (
  <div
    className={`mb-4 flex flex-col md:mb-6 ${
      align === "right"
        ? "md:items-end md:text-right"
        : align === "center"
          ? "items-center text-center"
          : "items-start"
    }`}
  >
    <div className="relative">
      <span
        className={`absolute -top-10 z-[1] font-mono text-6xl font-bold text-white/10 md:-top-12 md:text-7xl ${
          align === "right"
            ? "-right-8 md:-right-10"
            : align === "center"
              ? "left-1/2 -translate-x-1/2"
              : "-left-8 md:-left-10"
        }`}
      >
        {step}
      </span>
      <h3
        className={`font-orbitron relative z-10 text-lg font-bold transition-colors duration-300 md:text-xl ${
          active ? "text-white" : "text-gray-400"
        }`}
      >
        {title}
      </h3>
    </div>
    <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-cyan-500/70 md:text-xs">
      {subtitle}
    </span>
  </div>
);

const SourceCard = ({ icon, title, desc, isActive, delay }: SourceCardProps) => (
  <motion.div
    animate={
      isActive
        ? {
            x: 5,
            opacity: 1,
            borderColor: "rgba(6,182,212,0.3)",
            backgroundColor: "rgba(255,255,255,0.05)",
          }
        : {
            x: 0,
            opacity: 0.4,
            borderColor: "rgba(255,255,255,0.05)",
            backgroundColor: "transparent",
          }
    }
    transition={{ duration: 0.5, delay }}
    className="flex w-full max-w-[300px] items-center gap-3 rounded border p-3 backdrop-blur-sm transition-all"
  >
    <div className={`rounded bg-black/50 p-1.5 ${isActive ? "text-cyan-400" : "text-gray-500"}`}>
      {icon}
    </div>
    <div>
      <div className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-400"}`}>
        {title}
      </div>
      <div className="font-mono text-[10px] text-gray-600 md:text-xs">{desc}</div>
    </div>
  </motion.div>
);

const ProcessingStep = ({ icon, text, sub, color, barColor, delay }: ProcessingStepProps) => (
  <motion.div
    initial={{ x: -10, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-3 rounded border border-white/5 bg-white/5 p-2"
  >
    <div className={`rounded-full bg-white/5 p-1.5 ${color}`}>{icon}</div>
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between">
        <span className={`truncate text-sm font-medium ${color}`}>{text}</span>
      </div>
      <div className="mb-1.5 truncate text-[10px] text-gray-500">{sub}</div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-800">
        <motion.div
          className={`h-full ${barColor}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeInOut" }}
        />
      </div>
    </div>
  </motion.div>
);

const OutputCard = ({ title, type, count, active, delay }: OutputCardProps) => (
  <motion.div
    animate={
      active
        ? { scale: 1.02, opacity: 1, borderColor: "rgba(6,182,212,0.4)" }
        : { scale: 1, opacity: 0.5, borderColor: "rgba(255,255,255,0.1)" }
    }
    transition={{ delay }}
    className="group relative flex w-full max-w-[260px] items-center justify-between overflow-hidden rounded-lg border bg-white/5 p-4 backdrop-blur-sm"
  >
    {active && <div className="absolute inset-0 animate-pulse bg-cyan-500/5" />}

    <div className="relative z-10">
      <div className="text-sm font-bold text-gray-200 transition-colors group-hover:text-cyan-400">
        {title}
      </div>
      <div className="mt-0.5 font-mono text-[10px] text-gray-500">{type}</div>
    </div>
    <div className="relative z-10 rounded border border-cyan-500/20 bg-cyan-950/50 px-2 py-1 font-mono text-xs text-cyan-400">
      {count}
    </div>
  </motion.div>
);

export function WorkflowSection() {
  const [activeStage, setActiveStage] = useState(0);
  const [dataFlowPhase, setDataFlowPhase] = useState<"none" | "to-center" | "to-output">("none");

  useEffect(() => {
    // 初始阶段 0，停留 2 秒后开始流向中央
    const timer1 = setTimeout(() => {
      setDataFlowPhase("to-center");
    }, 2000);

    return () => clearTimeout(timer1);
  }, []);

  // 处理数据流动完成后的逻辑
  const handleDataFlowComplete = () => {
    if (dataFlowPhase === "to-center") {
      // 流向中央完成，切换到阶段 1（处理中）
      setActiveStage(1);
      setDataFlowPhase("none");

      // 等待处理步骤完成（2.6秒动画 + 0.5秒缓冲）
      setTimeout(() => {
        setDataFlowPhase("to-output");
      }, 3100);
    } else if (dataFlowPhase === "to-output") {
      // 流向输出完成，切换到阶段 2（输出）
      setActiveStage(2);
      setDataFlowPhase("none");

      // 停留 2 秒后重置
      setTimeout(() => {
        setActiveStage(0);
        setTimeout(() => {
          setDataFlowPhase("to-center");
        }, 2000);
      }, 2000);
    }
  };

  return (
    <section className="relative flex w-full items-center justify-center py-12 text-white md:py-16">
      {/* Background Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] bg-[size:4rem_4rem]" />
        <div className="absolute top-[-20%] left-1/2 h-[50%] w-[80%] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute right-0 bottom-[-20%] h-[50%] w-[50%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 text-center md:mb-10">
          <GlitchText
            as="h2"
            className="font-orbitron mb-2 text-2xl font-bold text-white md:text-4xl"
          >
            全网 AI 情报工作流
          </GlitchText>
          <p className="text-sm text-white/60 md:text-base">自动化工作流 · 智能过滤 · 精准交付</p>
        </div>

        {/* Pipeline Visualization */}
        <div className="relative grid grid-cols-1 items-center gap-4 md:grid-cols-[28%_44%_28%] lg:gap-6">
          {/* Connection Line (Desktop Only) */}
          <div className="absolute top-1/2 left-0 z-0 hidden h-[1px] w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent md:block">
            {dataFlowPhase !== "none" && (
              <motion.div
                key={dataFlowPhase}
                className="absolute top-1/2 h-[3px] w-[100px] -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px]"
                initial={{ left: dataFlowPhase === "to-center" ? "-10%" : "50%" }}
                animate={{ left: dataFlowPhase === "to-center" ? "50%" : "110%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                onAnimationComplete={handleDataFlowComplete}
              />
            )}
          </div>

          {/* Stage 1: Collection */}
          <div className="relative z-10 flex h-full flex-col justify-center">
            <StageLabel
              step="01"
              title="全球嗅探"
              subtitle="INGEST"
              active={activeStage === 0}
              align="left"
            />

            <div className="relative space-y-3 pl-4">
              <div className="absolute top-2 bottom-2 left-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

              <SourceCard
                icon={<Globe className="h-5 w-5" />}
                title="权威媒体 RSS"
                desc="Verge, TechCrunch, NYT"
                isActive={activeStage === 0}
                delay={0}
              />
              <SourceCard
                icon={<Youtube className="h-5 w-5" />}
                title="视频平台 API"
                desc="YouTube, TikTok Trends"
                isActive={activeStage === 0}
                delay={0.1}
              />
              <SourceCard
                icon={<MessageCircle className="h-5 w-5" />}
                title="社区讨论"
                desc="Reddit (r/Artificial)"
                isActive={activeStage === 0}
                delay={0.2}
              />
            </div>
          </div>

          {/* Stage 2: Processing */}
          <div className="relative z-20 py-6 md:py-0">
            <StageLabel
              step="02"
              title="智能中枢"
              subtitle="PROCESS"
              active={activeStage === 1}
              align="center"
            />

            <motion.div
              className={`group relative mx-auto aspect-[16/10] w-full max-w-[600px] overflow-hidden rounded-2xl border bg-black/80 backdrop-blur-xl transition-all duration-500 ${
                activeStage === 1
                  ? "border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                  : "border-white/10 opacity-80"
              }`}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6">
                <div className="absolute top-4 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 font-mono text-[10px] tracking-widest text-cyan-400 opacity-80 md:text-xs">
                  <Cpu size={14} className="animate-pulse" />
                  DeepSeek-V3 ENGINE
                </div>

                <div className="mt-6 w-full max-w-sm">
                  <AnimatePresence mode="wait">
                    {activeStage === 1 ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <ProcessingStep
                          icon={<Filter size={14} />}
                          text="过滤无效噪音"
                          sub="规则：24h内 & 播放量>20w"
                          color="text-yellow-400"
                          barColor="bg-yellow-400"
                          delay={0}
                        />
                        <ProcessingStep
                          icon={<Languages size={14} />}
                          text="中文深度翻译"
                          sub="万字长文 -> 80字摘要"
                          color="text-cyan-400"
                          barColor="bg-cyan-400"
                          delay={0.8}
                        />
                        <ProcessingStep
                          icon={<Sparkles size={14} />}
                          text="价值评估与分类"
                          sub="产品发布 / 深度研究 / 舆论"
                          color="text-purple-400"
                          barColor="bg-purple-400"
                          delay={1.6}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex h-full flex-col items-center justify-center gap-3 text-gray-500"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 md:h-16 md:w-16">
                          <Activity size={24} className="opacity-50" />
                        </div>
                        <span className="font-mono text-xs tracking-widest">AWAITING INPUT...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            </motion.div>
          </div>

          {/* Stage 3: Output */}
          <div className="relative z-10 flex h-full flex-col justify-center">
            <StageLabel
              step="03"
              title="知识交付"
              subtitle="DELIVERY"
              active={activeStage === 2}
              align="right"
            />

            <div className="flex flex-col space-y-4 border-l border-white/10 pr-4 pl-4 md:items-end md:border-l-0 md:border-none md:pr-0 md:pl-0">
              <OutputCard
                title="AI News Hub"
                type="Notion Database"
                count="+42 Today"
                active={activeStage === 2}
                delay={0}
              />
              <OutputCard
                title="Viral Shorts"
                type="Video Trends"
                count="+12 Hot"
                active={activeStage === 2}
                delay={0.2}
              />

              <Link href="/agents">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 flex items-center gap-2 rounded bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-400"
                >
                  <Workflow size={16} />
                  查看数据流
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
