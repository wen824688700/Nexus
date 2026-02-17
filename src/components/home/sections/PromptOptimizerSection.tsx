"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Check, Copy } from "lucide-react";
import { GlitchText } from "@/components/cyber";

interface StepIndicatorProps {
  step: string;
  title: string;
  active: boolean;
}

interface FrameworkCardProps {
  name: string;
  matchScore: number;
  description: string;
  delay: number;
  active: boolean;
}

interface QuestionItemProps {
  number: string;
  question: string;
  answer: string;
  delay: number;
}

const StepIndicator = ({ step, title, active }: StepIndicatorProps) => (
  <div className={`flex items-center gap-3 transition-all duration-300 ${active ? "opacity-100" : "opacity-40"}`}>
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-sm ${
      active ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/20 text-white/40"
    }`}>
      {step}
    </div>
    <span className={`text-sm font-medium ${active ? "text-white" : "text-white/40"}`}>{title}</span>
  </div>
);

const FrameworkCard = ({ name, matchScore, description, delay, active }: FrameworkCardProps) => {
  // 根据匹配度选择颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return { from: "from-cyan-400", to: "to-purple-400", text: "text-cyan-400", glow: "shadow-[0_0_15px_rgba(6,182,212,0.5)]" };
    if (score >= 85) return { from: "from-purple-400", to: "to-pink-400", text: "text-purple-400", glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]" };
    return { from: "from-pink-400", to: "to-orange-400", text: "text-pink-400", glow: "shadow-[0_0_15px_rgba(236,72,153,0.5)]" };
  };

  const colors = getScoreColor(matchScore);

  return (
    <motion.div
      initial={{ x: -30, opacity: 0, scale: 0.95 }}
      animate={active ? { x: 0, opacity: 1, scale: 1 } : { x: -30, opacity: 0, scale: 0.95 }}
      transition={{ 
        delay, 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      className="relative group"
    >
      {/* Glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: delay + 0.3, duration: 0.4 }}
        className={`absolute inset-0 rounded-lg ${colors.glow} blur-sm`}
      />
      
      {/* Card content */}
      <div className="relative p-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={active ? { opacity: 0.1, x: 0 } : { opacity: 0, x: -100 }}
          transition={{ delay: delay + 0.2, duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to}`}
        />
        
        <div className="relative z-10 space-y-3">
          {/* Framework name with icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={active ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                transition={{ delay: delay + 0.1, duration: 0.4 }}
                className={`w-2 h-2 rounded-full ${colors.from.replace('from-', 'bg-')}`}
              />
              <span className="text-sm font-bold text-white font-orbitron">{name}</span>
            </div>
            
            {/* Score badge */}
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={active ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 180 }}
              transition={{ delay: delay + 0.2, duration: 0.4 }}
              className={`px-2 py-1 rounded-full bg-black/30 border border-white/20 ${colors.text} font-mono text-xs font-bold`}
            >
              {matchScore}%
            </motion.div>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
            {/* Background shimmer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={active ? { x: "200%" } : { x: "-100%" }}
              transition={{ 
                delay: delay + 0.3, 
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            {/* Progress fill */}
            <motion.div
              initial={{ width: "0%", opacity: 0 }}
              animate={active ? { width: `${matchScore}%`, opacity: 1 } : { width: "0%", opacity: 0 }}
              transition={{ 
                delay: delay + 0.4, 
                duration: 1,
                ease: "easeOut"
              }}
              className={`relative h-full bg-gradient-to-r ${colors.from} ${colors.to} rounded-full`}
            >
              {/* Glow on progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={active ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
                transition={{ 
                  delay: delay + 0.8,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0"
              />
            </motion.div>
          </div>
          
          {/* Description - 场景描述 */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
            transition={{ delay: delay + 0.6, duration: 0.3 }}
            className="text-[10px] text-white/60 leading-relaxed line-clamp-2"
          >
            {description}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const QuestionItem = ({ number, question, answer, delay }: QuestionItemProps) => {
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedAnswer("");
    setIsTyping(true);
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= answer.length) {
        setDisplayedAnswer(answer.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30); // 打字速度：每30ms一个字符

    return () => clearInterval(typingInterval);
  }, [answer]);

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="text-cyan-400 font-mono">{number}</span>
        <span className="text-white/70">{question}</span>
        <span className="text-purple-400">*</span>
      </div>
      <div className="relative pl-6">
        <div className="p-2 bg-black/30 border border-white/10 rounded text-sm text-white/90">
          {displayedAnswer}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-[2px] h-4 bg-cyan-400 ml-1"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export function PromptOptimizerSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000); // 增加到 4 秒，让用户有更多时间阅读

    return () => clearInterval(timer);
  }, []);

  const frameworks = [
    { 
      name: "BAB Framework", 
      matchScore: 92,
      description: "订阅服务推广、健身应用营销、在线学习平台推广、环保产品宣传、家居服务广告、金融规划工具推广"
    },
    { 
      name: "SPEAR Framework", 
      matchScore: 88,
      description: "说服性写作和演讲、营销文案创作、销售提案设计、政策倡导、投资者推介、产品发布演示"
    },
    { 
      name: "Challenge-Solution-Benefit", 
      matchScore: 85,
      description: "产品营销文案、销售演示、提案撰写、案例研究、投资者推介、问题解决报告"
    },
  ];

  const questions = [
    { number: "①", question: "目标是什么？", answer: "推广智能手表，提升销量" },
    { number: "②", question: "目标受众是谁？", answer: "18-30岁科技爱好者" },
  ];

  const optimizedPrompt = `# 智能手表营销推广提示词（基于BAB框架）

## 提示词

**角色：** 你是一位经验丰富的数字营销文案专家，擅长为科技产品撰写引人入胜、具有说服力的推广文案。

**任务：** 请根据以下BAB框架结构，为面向18-30岁科技爱好者的智能手表撰写一份营销推广文案的核心内容。文案需生动、有共鸣，并能有效激发购买欲望。

**框架应用：**

请严格按照以下三个部分构建你的文案：

1. **Before（之前） - 描述痛点**
   生动描绘目标受众（18-30岁科技爱好者）当前在健康管理、生活效率或科技体验方面面临的典型问题或不便。例如：手机通知杂乱、错过重要信息；运动数据分散不准确；生活与科技连接不顺畅；无法便捷追踪健康指标等。让读者感到"这正是我的困扰"。

2. **After（之后） - 描绘理想愿景**
   使用"想象一下"等引导词，具体描绘在使用了这款智能手表后，用户的生活将变得如何高效、健康、便捷和充满科技感。聚焦于情感收益和状态改变，例如：成为自己健康数据的主宰、生活效率倍增、科技体验无缝融合、在社交中展现潮流与智能等。

3. **Bridge（桥梁） - 提出解决方案与行动号召**
   清晰介绍这款智能手表的核心功能与优势，明确指出它如何作为"桥梁"，将用户从"Before"的烦恼状态，直接带到"After"的理想状态。最后，附上强有力的行动号召（Call to Action），引导用户立即采取行动（如访问官网、限时优惠等）。

**输出要求：**
- 语言风格：时尚、简洁、充满活力，符合年轻科技爱好者的沟通习惯。
- 结构：明确分为"Before"、"After"、"Bridge"三个部分，每部分内容精炼有力。
- 目标：最终文案应是一个可直接用于社交媒体广告、产品落地页或邮件营销的完整片段。`;

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative w-full py-12 md:py-16 flex items-center justify-center text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-purple-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-20%] right-0 w-[50%] h-[50%] bg-cyan-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-[1400px] px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <GlitchText
            as="h2"
            className="text-2xl md:text-4xl font-orbitron font-bold text-white mb-2"
          >
            提示词优化器
          </GlitchText>
          <p className="text-white/60 text-sm md:text-base">
            智能匹配框架 · 深度对话优化 · 一句话生成专业提示词
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6 items-start">
          {/* Left: Steps */}
          <div className="space-y-4">
            <StepIndicator step="1" title="输入需求" active={activeStep === 0} />
            <StepIndicator step="2" title="匹配框架" active={activeStep === 1} />
            <StepIndicator step="3" title="深度对话" active={activeStep === 2} />
            <StepIndicator step="4" title="生成结果" active={activeStep === 3} />

            <Link href="/agents" className="block mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-5 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                <Sparkles size={16} />
                立即体验
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>

          {/* Right: Preview */}
          <motion.div
            className={`relative w-full rounded-2xl border bg-black/80 backdrop-blur-xl overflow-hidden transition-all duration-500 ${
              activeStep >= 0
                ? "border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                : "border-white/10 opacity-80"
            }`}
            style={{ height: activeStep === 3 ? "600px" : "500px" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="absolute inset-0 flex flex-col">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-red-500/50" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <span className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px] text-white/30 font-mono">
                  {activeStep === 3 ? "optimized_prompt.md" : "prompt_optimizer.md"}
                </span>
                {activeStep === 3 && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-green-400 font-mono">
                    <Check size={12} />
                    <span>生成完成</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden p-4">
                <AnimatePresence mode="wait">
                  {/* Step 1: Input */}
                  {activeStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <div className="text-xs text-white/50 font-mono mb-2">用户输入：</div>
                      <div className="p-3 bg-white/5 border border-cyan-400/30 rounded-lg">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-sm text-white/90"
                        >
                          帮我写一个关于产品营销的提示词
                        </motion.p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-2 text-xs text-cyan-400 font-mono"
                      >
                        <Sparkles size={12} className="animate-pulse" />
                        <span>正在分析需求...</span>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 2: Frameworks */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Header with scanning effect */}
                      <div className="relative mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-white/50 font-mono">智能匹配框架：</div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="flex items-center gap-2 text-xs text-cyan-400 font-mono"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full"
                            />
                            <span>分析中...</span>
                          </motion.div>
                        </div>
                        
                        {/* Scanning line effect */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.1, duration: 0.8 }}
                          className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2"
                        />
                      </div>
                      
                      {/* Framework cards */}
                      <div className="space-y-3">
                        {frameworks.map((fw, idx) => (
                          <FrameworkCard
                            key={fw.name}
                            name={fw.name}
                            matchScore={fw.matchScore}
                            description={fw.description}
                            delay={idx * 0.25}
                            active={true}
                          />
                        ))}
                      </div>
                      
                      {/* Selection confirmation */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.4 }}
                        className="relative mt-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/30"
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
                          >
                            <Check size={16} className="text-green-400" />
                          </motion.div>
                          <span className="text-xs text-green-400 font-mono font-bold">
                            已选择: BAB Framework
                          </span>
                          <span className="ml-auto text-xs text-cyan-400 font-mono">
                            92% 匹配
                          </span>
                        </div>
                        
                        {/* Success pulse */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ delay: 1.4, duration: 1, repeat: 2 }}
                          className="absolute inset-0 bg-green-400/20 rounded-lg"
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 3: Dialogue */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col"
                    >
                      {/* Header */}
                      <div className="relative mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-white/50 font-mono">深度对话：</div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 text-xs text-purple-400 font-mono"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-purple-400"
                            />
                            <span>补充信息中...</span>
                          </motion.div>
                        </div>
                        
                        {/* Divider line */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.1, duration: 0.6 }}
                          className="h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent mt-2"
                        />
                      </div>
                      
                      {/* Questions with typing effect */}
                      <div className="flex-1 space-y-4 overflow-y-auto">
                        {questions.map((q, idx) => (
                          <QuestionItem
                            key={q.number}
                            number={q.number}
                            question={q.question}
                            answer={q.answer}
                            delay={idx * 0.4}
                          />
                        ))}
                      </div>
                      
                      {/* Generate button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.4 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold overflow-hidden group"
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                          
                          {/* Button content */}
                          <div className="relative flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles size={16} />
                            </motion.div>
                            <span>开始生成</span>
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <ArrowRight size={16} />
                            </motion.div>
                          </div>
                          
                          {/* Glow effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/50 to-pink-500/50 blur-xl" />
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 4: Result with Scroll */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-white/50 font-mono">优化后的提示词：</div>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check size={12} />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>复制</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Scrollable Content */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-400/30 rounded-lg custom-scrollbar"
                      >
                        <pre className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap font-mono">
                          {optimizedPrompt}
                        </pre>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </section>
  );
}
