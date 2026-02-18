"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  url: string;
  duration: number;
}

export interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playlist: MusicTrack[];
  currentIndex: number;
  playMode: "sequential" | "random" | "loop";
}

export const useMusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [state, setState] = useState<MusicPlayerState>({
    currentTrack: null,
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    playlist: [],
    currentIndex: 0,
    playMode: "sequential",
  });

  // 初始化音频上下文和分析器
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 创建音频元素
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;
      audioRef.current.crossOrigin = "anonymous"; // 允许跨域音频分析
    }

    // 创建音频上下文（只创建一次）
    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // 连接音频源
      if (audioRef.current && !sourceRef.current) {
        try {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        } catch (error) {
          console.error("Failed to create audio source:", error);
        }
      }
    }

    // 监听音频事件
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleEnded = () => {
      // 直接在这里处理下一首逻辑，避免依赖 playNext
      setState((prevState) => {
        const { playlist, currentIndex, playMode } = prevState;
        if (playlist.length === 0) return prevState;

        let nextIndex: number;

        if (playMode === "random") {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } else if (playMode === "loop") {
          nextIndex = currentIndex;
        } else {
          nextIndex = (currentIndex + 1) % playlist.length;
        }

        const nextTrack = playlist[nextIndex];
        if (audio && nextTrack) {
          audio.src = nextTrack.url;
          audio.currentTime = 0;
          audio.play().catch(console.error);
        }

        return {
          ...prevState,
          currentTrack: nextTrack,
          currentIndex: nextIndex,
          isPlaying: true,
          currentTime: 0,
        };
      });
    };

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []); // playNext 在 effect 内部通过闭包访问，不需要作为依赖

  // 播放
  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      // 恢复音频上下文
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      await audioRef.current.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error("播放失败:", error);
    }
  }, []);

  // 暂停
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  // 切换播放/暂停
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  // 加载曲目
  const loadTrack = useCallback((track: MusicTrack) => {
    if (!audioRef.current) return;

    audioRef.current.src = track.url;
    setState((prev) => ({
      ...prev,
      currentTrack: track,
      currentTime: 0,
    }));
  }, []);

  // 播放指定曲目
  const playTrack = useCallback(
    (track: MusicTrack, index: number) => {
      loadTrack(track);
      setState((prev) => ({ ...prev, currentIndex: index }));
      setTimeout(() => play(), 100);
    },
    [loadTrack, play],
  );

  // 下一首
  const playNext = useCallback(() => {
    setState((prevState) => {
      const { playlist, currentIndex, playMode } = prevState;
      if (playlist.length === 0) return prevState;

      let nextIndex: number;

      if (playMode === "random") {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } else if (playMode === "loop") {
        nextIndex = currentIndex; // 单曲循环，保持当前索引
      } else {
        nextIndex = (currentIndex + 1) % playlist.length; // 顺序播放
      }

      // 加载并播放下一首
      const nextTrack = playlist[nextIndex];
      if (audioRef.current && nextTrack) {
        audioRef.current.src = nextTrack.url;
        audioRef.current.currentTime = 0;

        // 恢复音频上下文
        if (audioContextRef.current?.state === "suspended") {
          audioContextRef.current.resume();
        }

        audioRef.current.play().catch((error) => {
          console.error("播放失败:", error);
        });
      }

      return {
        ...prevState,
        currentTrack: nextTrack,
        currentIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
      };
    });
  }, []);

  // 上一首
  const playPrevious = useCallback(() => {
    const { playlist, currentIndex } = state;
    if (playlist.length === 0) return;

    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playTrack(playlist[prevIndex], prevIndex);
  }, [state, playTrack]);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    setState((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  // 跳转到指定时间
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  }, []);

  // 设置播放模式
  const setPlayMode = useCallback((mode: "sequential" | "random" | "loop") => {
    setState((prev) => ({ ...prev, playMode: mode }));
  }, []);

  // 设置播放列表
  const setPlaylist = useCallback((playlist: MusicTrack[]) => {
    setState((prev) => ({ ...prev, playlist }));
  }, []);

  // 获取音频分析数据
  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) {
      return new Uint8Array(0);
    }
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    return dataArray;
  }, []);

  return {
    ...state,
    play,
    pause,
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    seekTo,
    setPlayMode,
    setPlaylist,
    loadTrack,
    playTrack,
    getFrequencyData,
    audioRef,
    analyserRef,
  };
};
