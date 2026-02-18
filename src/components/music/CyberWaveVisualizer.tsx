"use client";

import { useEffect, useRef } from "react";

interface CyberWaveVisualizerProps {
  isPlaying: boolean;
  getFrequencyData: () => Uint8Array;
}

export const CyberWaveVisualizer = ({ isPlaying, getFrequencyData }: CyberWaveVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 200;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let phase = 0;

    const drawWave = () => {
      if (!ctx || !canvas) return;

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 获取音频数据
      const frequencyData = getFrequencyData();
      const bufferLength = frequencyData.length;

      // 计算平均音量
      const average = frequencyData.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedAverage = average / 255;

      // 波浪参数
      const waveCount = 3;
      const baseAmplitude = isPlaying ? 30 + normalizedAverage * 50 : 10;
      const baseFrequency = 0.01;

      // 绘制多层波浪
      for (let wave = 0; wave < waveCount; wave++) {
        ctx.beginPath();

        const amplitude = baseAmplitude * (1 - wave * 0.3);
        const frequency = baseFrequency * (1 + wave * 0.2);
        const yOffset = canvas.height - 60 + wave * 15;
        const opacity = 0.6 - wave * 0.15;

        // 创建渐变
        const gradient = ctx.createLinearGradient(0, yOffset - amplitude, 0, yOffset + amplitude);

        if (wave === 0) {
          gradient.addColorStop(0, `rgba(255, 0, 255, ${opacity})`); // magenta
          gradient.addColorStop(0.5, `rgba(139, 0, 255, ${opacity})`); // purple
          gradient.addColorStop(1, `rgba(0, 243, 255, ${opacity})`); // cyan
        } else if (wave === 1) {
          gradient.addColorStop(0, `rgba(0, 243, 255, ${opacity})`);
          gradient.addColorStop(1, `rgba(255, 0, 255, ${opacity})`);
        } else {
          gradient.addColorStop(0, `rgba(139, 0, 255, ${opacity})`);
          gradient.addColorStop(1, `rgba(0, 243, 255, ${opacity})`);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 - wave * 0.5;
        ctx.shadowBlur = isPlaying ? 20 - wave * 5 : 5;
        ctx.shadowColor = wave === 0 ? "#ff00ff" : "#00f3ff";

        // 绘制波浪曲线
        for (let x = 0; x <= canvas.width; x += 2) {
          // 使用音频数据影响波浪
          const dataIndex = Math.floor((x / canvas.width) * bufferLength);
          const audioInfluence = frequencyData[dataIndex] / 255;

          const y =
            yOffset +
            Math.sin(x * frequency + phase + wave * 0.5) *
              amplitude *
              (0.5 + audioInfluence * 0.5) +
            Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude * 0.3) * audioInfluence;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // 绘制底部发光线
      if (isPlaying) {
        const glowGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        glowGradient.addColorStop(0, "rgba(0, 243, 255, 0)");
        glowGradient.addColorStop(0.25, "rgba(0, 243, 255, 0.8)");
        glowGradient.addColorStop(0.5, "rgba(255, 0, 255, 0.8)");
        glowGradient.addColorStop(0.75, "rgba(0, 243, 255, 0.8)");
        glowGradient.addColorStop(1, "rgba(0, 243, 255, 0)");

        ctx.strokeStyle = glowGradient;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#00f3ff";

        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 1);
        ctx.lineTo(canvas.width, canvas.height - 1);
        ctx.stroke();
      }

      // 更新相位
      if (isPlaying) {
        phase += 0.03 + normalizedAverage * 0.05;
      } else {
        phase += 0.01;
      }

      animationRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, getFrequencyData]);

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0 h-[200px] overflow-hidden">
      {/* 背景渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, transparent 100%)",
        }}
      />

      {/* Canvas 波浪 */}
      <canvas
        ref={canvasRef}
        className="absolute bottom-0 left-0 w-full"
        style={{ mixBlendMode: "screen" }}
      />

      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 49px,
              rgba(0, 243, 255, 0.3) 50px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 49px,
              rgba(0, 243, 255, 0.2) 50px
            )
          `,
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "center bottom",
        }}
      />
    </div>
  );
};
