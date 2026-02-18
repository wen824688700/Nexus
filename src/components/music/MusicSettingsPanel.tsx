"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shuffle, Repeat, Repeat1, Music2, Sliders } from "lucide-react";

interface MusicSettingsPanelProps {
  playMode: "sequential" | "random" | "loop";
  onPlayModeChange: (mode: "sequential" | "random" | "loop") => void;
  onClose: () => void;
}

const musicGenres = [
  { id: "lofi", name: "Lo-Fi", emoji: "🎵" },
  { id: "ambient", name: "Ambient", emoji: "🌊" },
  { id: "chillhop", name: "Chillhop", emoji: "🎧" },
  { id: "synthwave", name: "Synthwave", emoji: "🌆" },
  { id: "jazz", name: "Jazz", emoji: "🎷" },
  { id: "classical", name: "Classical", emoji: "🎻" },
];

export const MusicSettingsPanel = ({
  playMode,
  onPlayModeChange,
  onClose,
}: MusicSettingsPanelProps) => {
  const [selectedGenre, setSelectedGenre] = useState("lofi");
  const [mood, setMood] = useState(50); // 0-100: 平静到激昂
  const [tempo, setTempo] = useState(90); // BPM
  const [waveIntensity, setWaveIntensity] = useState(70);

  return (
    <div
      className={cn(
        "absolute inset-0 z-10",
        "bg-cyber-dark/98 backdrop-blur-xl",
        "border-cyber-magenta/30 border",
        "overflow-hidden rounded-2xl",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
      )}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-cyber-magenta/20 flex h-10 w-10 items-center justify-center rounded-full">
            <Sliders className="text-cyber-magenta h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-white">音乐设置</h3>
            <p className="text-xs text-white/50">自定义你的音乐体验</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* 内容区 */}
      <div className="max-h-[500px] space-y-6 overflow-y-auto p-6">
        {/* 音乐风格 */}
        <div>
          <label className="mb-3 block text-sm text-white/70">音乐风格</label>
          <div className="grid grid-cols-3 gap-2">
            {musicGenres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={cn(
                  "rounded-lg border p-3 transition-all",
                  "flex flex-col items-center gap-1",
                  selectedGenre === genre.id
                    ? "border-cyber-magenta bg-cyber-magenta/10 text-white"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
                )}
              >
                <span className="text-2xl">{genre.emoji}</span>
                <span className="text-xs">{genre.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 情绪滑块 */}
        <div>
          <label className="mb-3 block flex items-center justify-between text-sm text-white/70">
            <span>情绪氛围</span>
            <span className="text-cyber-magenta text-xs">
              {mood < 30 ? "平静" : mood < 70 ? "舒适" : "激昂"}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="[&::-webkit-slider-thumb]:bg-cyber-magenta [&::-webkit-slider-thumb]:shadow-neon-magenta h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        {/* 节奏 BPM */}
        <div>
          <label className="mb-3 block flex items-center justify-between text-sm text-white/70">
            <span>节奏速度</span>
            <span className="text-cyber-cyan text-xs">{tempo} BPM</span>
          </label>
          <input
            type="range"
            min="60"
            max="140"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="[&::-webkit-slider-thumb]:bg-cyber-cyan [&::-webkit-slider-thumb]:shadow-neon-cyan h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        {/* 播放模式 */}
        <div>
          <label className="mb-3 block text-sm text-white/70">播放模式</label>
          <div className="flex gap-2">
            <button
              onClick={() => onPlayModeChange("sequential")}
              className={cn(
                "flex-1 rounded-lg border p-3 transition-all",
                "flex items-center justify-center gap-2",
                playMode === "sequential"
                  ? "border-cyber-magenta bg-cyber-magenta/10 text-white"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20",
              )}
            >
              <Music2 className="h-4 w-4" />
              <span className="text-xs">顺序</span>
            </button>
            <button
              onClick={() => onPlayModeChange("random")}
              className={cn(
                "flex-1 rounded-lg border p-3 transition-all",
                "flex items-center justify-center gap-2",
                playMode === "random"
                  ? "border-cyber-magenta bg-cyber-magenta/10 text-white"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20",
              )}
            >
              <Shuffle className="h-4 w-4" />
              <span className="text-xs">随机</span>
            </button>
            <button
              onClick={() => onPlayModeChange("loop")}
              className={cn(
                "flex-1 rounded-lg border p-3 transition-all",
                "flex items-center justify-center gap-2",
                playMode === "loop"
                  ? "border-cyber-magenta bg-cyber-magenta/10 text-white"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20",
              )}
            >
              <Repeat1 className="h-4 w-4" />
              <span className="text-xs">循环</span>
            </button>
          </div>
        </div>

        {/* 波浪强度 */}
        <div>
          <label className="mb-3 block flex items-center justify-between text-sm text-white/70">
            <span>视觉效果强度</span>
            <span className="text-cyber-magenta text-xs">{waveIntensity}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={waveIntensity}
            onChange={(e) => setWaveIntensity(Number(e.target.value))}
            className="[&::-webkit-slider-thumb]:from-cyber-magenta [&::-webkit-slider-thumb]:to-cyber-cyan [&::-webkit-slider-thumb]:shadow-neon-magenta h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r"
          />
        </div>

        {/* 生成按钮 */}
        <button
          className={cn(
            "w-full rounded-lg py-3",
            "from-cyber-magenta to-cyber-purple bg-gradient-to-r",
            "font-medium text-white",
            "hover:shadow-neon-magenta transition-all",
            "flex items-center justify-center gap-2",
          )}
        >
          <Music2 className="h-4 w-4" />
          生成音乐
        </button>
      </div>
    </div>
  );
};
