"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Repeat1,
  Shuffle,
  List,
} from "lucide-react";
import { useMusicPlayer } from "./useMusicPlayer";
import { getPlaylist } from "@/config/musicPlaylist";
import { AudioGlowRing } from "./AudioGlowRing";

// 从配置文件获取播放列表
const demoPlaylist = getPlaylist();

export const FloatingMusicPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    playMode,
    playlist,
    currentIndex,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    seekTo,
    setPlayMode,
    setPlaylist,
    playTrack,
    getFrequencyData,
  } = useMusicPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // 初始化播放列表
  useEffect(() => {
    setPlaylist(demoPlaylist);
    if (!currentTrack && demoPlaylist.length > 0) {
      playTrack(demoPlaylist[0], 0);
    }
  }, []);

  // 碟片旋转动画
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setRotation((prev) => (prev + 0.5) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 切换播放模式
  const cyclePlayMode = () => {
    const modes: Array<"sequential" | "random" | "loop"> = ["sequential", "random", "loop"];
    const currentModeIndex = modes.indexOf(playMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setPlayMode(nextMode);
  };

  // 获取播放模式图标
  const getPlayModeIcon = () => {
    switch (playMode) {
      case "loop":
        return <Repeat1 className="h-4 w-4" />;
      case "random":
        return <Shuffle className="h-4 w-4" />;
      default:
        return <Repeat className="h-4 w-4" />;
    }
  };

  // 获取播放模式文本
  const getPlayModeText = () => {
    switch (playMode) {
      case "loop":
        return "单曲循环";
      case "random":
        return "随机播放";
      default:
        return "顺序播放";
    }
  };

  return (
    <div className={cn("fixed right-8 bottom-8 z-40", "transition-all duration-500")}>
      {/* 展开的面板 - 根据状态切换内容 */}
      {isExpanded && (
        <div
          className={cn(
            "absolute right-0 bottom-20 mb-4",
            "rounded-2xl p-4",
            "bg-cyber-dark/95 backdrop-blur-xl",
            "border-cyber-magenta/50 border",
            "shadow-[0_0_30px_rgba(255,0,255,0.3)]",
            "animate-in fade-in slide-in-from-bottom-4 duration-300",
            showPlaylist ? "max-h-96 w-80 overflow-y-auto" : "w-64",
          )}
        >
          {showPlaylist ? (
            /* 播放列表视图 */
            <>
              {/* 列表标题栏 */}
              <div className="bg-cyber-dark/95 sticky top-0 mb-4 flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="font-medium text-white">播放列表</h3>
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* 音乐列表 */}
              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      playTrack(track, index);
                      setShowPlaylist(false);
                    }}
                    className={cn(
                      "w-full rounded-lg p-3 text-left transition-all",
                      "hover:bg-white/10",
                      currentIndex === index
                        ? "bg-cyber-magenta/20 border-cyber-magenta/50 border"
                        : "border border-white/5",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* 播放指示器 */}
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/5">
                        {currentIndex === index && isPlaying ? (
                          <div className="flex gap-0.5">
                            <div className="bg-cyber-magenta h-2.5 w-0.5 animate-pulse" />
                            <div
                              className="bg-cyber-magenta h-2.5 w-0.5 animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="bg-cyber-magenta h-2.5 w-0.5 animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-white/50">{index + 1}</span>
                        )}
                      </div>

                      {/* 曲目信息 */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            currentIndex === index ? "text-cyber-magenta" : "text-white",
                          )}
                        >
                          {track.title}
                        </p>
                        <p className="truncate text-xs text-white/50">{track.artist}</p>
                      </div>

                      {/* 时长 */}
                      <span className="flex-shrink-0 text-xs text-white/50">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* 控制面板视图 */
            <>
              {/* 歌曲信息 + 功能按钮 */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {currentTrack?.title || "AI 生成音乐"}
                  </p>
                  <p className="truncate text-xs text-white/50">
                    {currentTrack?.artist || "专注氛围 · Lo-Fi"}
                  </p>
                </div>

                {/* 播放模式和播放列表按钮 */}
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {/* 播放模式按钮 */}
                  <button
                    onClick={cyclePlayMode}
                    className="group relative flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:bg-white/10"
                    title={getPlayModeText()}
                  >
                    <span className="text-white/70 group-hover:text-white">
                      {getPlayModeIcon()}
                    </span>
                  </button>

                  {/* 播放列表按钮 */}
                  <button
                    onClick={() => setShowPlaylist(true)}
                    className="group flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:bg-white/10"
                    title="播放列表"
                  >
                    <List className="h-4 w-4 text-white/70 group-hover:text-white" />
                  </button>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="[&::-webkit-slider-thumb]:bg-cyber-magenta h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
              <div className="mb-4 flex justify-between text-xs text-white/50">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* 控制按钮 */}
              <div className="mb-4 flex items-center justify-center gap-4">
                <button
                  onClick={playPrevious}
                  className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full",
                    "bg-cyber-magenta text-white",
                    "hover:bg-cyber-magenta/80 transition-colors",
                    "shadow-neon-magenta",
                  )}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                </button>
                <button
                  onClick={playNext}
                  className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* 音量 */}
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-white/50" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/50"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* 碟片主体 - 带动态光圈 */}
      <AudioGlowRing isPlaying={isPlaying} getFrequencyData={getFrequencyData} size="large">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "relative h-16 w-16 rounded-full",
            "flex items-center justify-center",
            "transition-all duration-300",
            isExpanded && "scale-110",
          )}
          title="点击展开/收起控制面板"
        >
          {/* 外圈发光 */}
          <div
            className={cn("absolute inset-0 rounded-full", "border-cyber-magenta/50 border-2")}
          />

          {/* 旋转的碟片 */}
          <div
            className="absolute inset-1 overflow-hidden rounded-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isPlaying ? "none" : "transform 0.3s ease-out",
            }}
          >
            {/* 碟片纹理 */}
            <div className="from-cyber-magenta/30 via-cyber-purple/20 to-cyber-cyan/30 h-full w-full bg-gradient-to-br">
              {/* 同心圆纹理 */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 m-auto rounded-full border border-white/10"
                  style={{
                    width: `${60 - i * 15}%`,
                    height: `${60 - i * 15}%`,
                  }}
                />
              ))}
              {/* 中心孔 */}
              <div className="bg-cyber-dark border-cyber-magenta absolute inset-0 m-auto h-4 w-4 rounded-full border-2" />
            </div>
          </div>

          {/* 播放状态指示 */}
          <div
            className={cn(
              "absolute -top-1 -right-1 h-4 w-4 rounded-full",
              isPlaying ? "animate-pulse bg-green-500" : "bg-white/30",
            )}
          />
        </button>
      </AudioGlowRing>
    </div>
  );
};
