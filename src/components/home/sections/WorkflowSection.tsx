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
    className={`mb-4 md:mb-6 flex flex-col ${
      align === "right"
        ? "md:items-end md:text-right"
        : align === "center"
          ? "items-center text-center"
          : "items-start"
    }`}
  >
    <div className="relative">
      <span
        className={`text-6xl md:text-7xl font-bold font-mono text-white/10 absolute -top-10 md:-top-12 z-[1] ${
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
        className={`relative z-10 text-lg md:text-xl font-orbitron font-bold transition-colors duration-300 ${
          active ? "text-white" : "text-gray-400"
        }`}
      >
        {title}
      </h3>
    </div>
    <span className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-cyan-500/70 mt-1">
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
    className="flex items-center gap-3 p-3 rounded border backdrop-blur-sm transition-all w-full max-w-[300px]"
  >
    <div
      className={`p-1.5 rounded bg-black/50 ${isActive ? "text-cyan-400" : "text-gray-500"}`}
    >
      {icon}
    </div>
    <div>
      <div className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-400"}`}>
        {title}
      </div>
      <div className="text-[10px] md:text-xs text-gray-600 font-mono">{desc}</div>
    </div>
  </motion.div>
);

const ProcessingStep = ({ icon, text, sub, color, barColor, delay }: ProcessingStepProps) => (
  <motion.div
    initial={{ x: -10, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/5"
  >
    <div className={`p-1.5 rounded-full bg-white/5 ${color}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-medium truncate ${color}`}>{text}</span>
      </div>
      <div className="text-[10px] text-gray-500 mb-1.5 truncate">{sub}</div>
      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
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
    className="w-full max-w-[260px] p-4 rounded-lg bg-white/5 backdrop-blur-sm border flex justify-between items-center group relative overflow-hidden"
  >
    {active && <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />}

    <div className="relative z-10">
      <div className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">
        {title}
      </div>
      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{type}</div>
    </div>
    <div className="relative z-10 px-2 py-1 rounded bg-cyan-950/50 text-cyan-400 text-xs font-mono border border-cyan-500/20">
      {count}
    </div>
  </motion.div>
);

export function WorkflowSection() {
  const [activeStage, setActiveStage] = useState(0);
  const [dataFlowPhase, setDataFlowPhase] = useState<'none' | 'to-center' | 'to-output'>('none');

  useEffect(() => {
    // 初始阶段 0，停留 2 秒后开始流向中央
    const timer1 = setTimeout(() => {
      setDataFlowPhase('to-center');
    }, 2000);

    return () => clearTimeout(timer1);
  }, []);

  // 处理数据流动完成后的逻辑
  const handleDataFlowComplete = () => {
    if (dataFlowPhase === 'to-center') {
      // 流向中央完成，切换到阶段 1（处理中）
      setActiveStage(1);
      setDataFlowPhase('none');
      
      // 等待处理步骤完成（2.6秒动画 + 0.5秒缓冲）
      setTimeout(() => {
        setDataFlowPhase('to-output');
      }, 3100);
    } else if (dataFlowPhase === 'to-output') {
      // 流向输出完成，切换到阶段 2（输出）
      setActiveStage(2);
      setDataFlowPhase('none');
      
      // 停留 2 秒后重置
      setTimeout(() => {
        setActiveStage(0);
        setTimeout(() => {
          setDataFlowPhase('to-center');
        }, 2000);
      }, 2000);
    }
  };

  return (
    <section className="relative w-full py-12 md:py-16 flex items-center justify-center text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-cyan-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-20%] right-0 w-[50%] h-[50%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-[1400px] px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <GlitchText
            as="h2"
            className="text-2xl md:text-4xl font-orbitron font-bold text-white mb-2"
          >
            全网 AI 情报工作流
          </GlitchText>
          <p className="text-white/60 text-sm md:text-base">
            自动化工作流 · 智能过滤 · 精准交付
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-[28%_44%_28%] gap-4 lg:gap-6 items-center relative">
          {/* Connection Line (Desktop Only) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent -translate-y-1/2 z-0">
            {dataFlowPhase !== 'none' && (
              <motion.div
                key={dataFlowPhase}
                className="absolute top-1/2 -translate-y-1/2 h-[3px] w-[100px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px]"
                initial={{ left: dataFlowPhase === 'to-center' ? "-10%" : "50%" }}
                animate={{ left: dataFlowPhase === 'to-center' ? "50%" : "110%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                onAnimationComplete={handleDataFlowComplete}
              />
            )}
          </div>

          {/* Stage 1: Collection */}
          <div className="relative z-10 flex flex-col justify-center h-full">
            <StageLabel
              step="01"
              title="全球嗅探"
              subtitle="INGEST"
              active={activeStage === 0}
              align="left"
            />

            <div className="space-y-3 relative pl-4">
              <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />

              <SourceCard
                icon={<Globe className="w-5 h-5" />}
                title="权威媒体 RSS"
                desc="Verge, TechCrunch, NYT"
                isActive={activeStage === 0}
                delay={0}
              />
              <SourceCard
                icon={<Youtube className="w-5 h-5" />}
                title="视频平台 API"
                desc="YouTube, TikTok Trends"
                isActive={activeStage === 0}
                delay={0.1}
              />
              <SourceCard
                icon={<MessageCircle className="w-5 h-5" />}
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
              className={`relative w-full aspect-[16/10] rounded-2xl border bg-black/80 backdrop-blur-xl overflow-hidden transition-all duration-500 group mx-auto max-w-[600px] ${
                activeStage === 1
                  ? "border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                  : "border-white/10 opacity-80"
              }`}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6">
                <div className="absolute top-4 flex items-center gap-2 text-cyan-400 font-mono text-[10px] md:text-xs tracking-widest opacity-80 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/20">
                  <Cpu size={14} className="animate-pulse" />
                  DeepSeek-V3 ENGINE
                </div>

                <div className="w-full max-w-sm mt-6">
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
                        className="flex flex-col items-center justify-center h-full text-gray-500 gap-3"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                          <Activity size={24} className="opacity-50" />
                        </div>
                        <span className="font-mono text-xs tracking-widest">
                          AWAITING INPUT...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            </motion.div>
          </div>

          {/* Stage 3: Output */}
          <div className="relative z-10 flex flex-col justify-center h-full">
            <StageLabel
              step="03"
              title="知识交付"
              subtitle="DELIVERY"
              active={activeStage === 2}
              align="right"
            />

            <div className="space-y-4 flex flex-col md:items-end pr-4 md:pr-0 border-l md:border-l-0 border-white/10 md:border-none pl-4 md:pl-0">
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
                  className="mt-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
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
