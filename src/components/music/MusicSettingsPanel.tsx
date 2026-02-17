"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Shuffle, Repeat, Repeat1, Music2, Sliders } from 'lucide-react';

interface MusicSettingsPanelProps {
  playMode: 'sequential' | 'random' | 'loop';
  onPlayModeChange: (mode: 'sequential' | 'random' | 'loop') => void;
  onClose: () => void;
}

const musicGenres = [
  { id: 'lofi', name: 'Lo-Fi', emoji: '🎵' },
  { id: 'ambient', name: 'Ambient', emoji: '🌊' },
  { id: 'chillhop', name: 'Chillhop', emoji: '🎧' },
  { id: 'synthwave', name: 'Synthwave', emoji: '🌆' },
  { id: 'jazz', name: 'Jazz', emoji: '🎷' },
  { id: 'classical', name: 'Classical', emoji: '🎻' }
];

export const MusicSettingsPanel = ({ 
  playMode, 
  onPlayModeChange,
  onClose 
}: MusicSettingsPanelProps) => {
  const [selectedGenre, setSelectedGenre] = useState('lofi');
  const [mood, setMood] = useState(50); // 0-100: 平静到激昂
  const [tempo, setTempo] = useState(90); // BPM
  const [waveIntensity, setWaveIntensity] = useState(70);

  return (
    <div 
      className={cn(
        'absolute inset-0 z-10',
        'bg-cyber-dark/98 backdrop-blur-xl',
        'border border-cyber-magenta/30',
        'rounded-2xl overflow-hidden',
        'animate-in fade-in slide-in-from-bottom-4 duration-300'
      )}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyber-magenta/20 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-cyber-magenta" />
          </div>
          <div>
            <h3 className="text-white font-medium">音乐设置</h3>
            <p className="text-white/50 text-xs">自定义你的音乐体验</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 内容区 */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
        {/* 音乐风格 */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">音乐风格</label>
          <div className="grid grid-cols-3 gap-2">
            {musicGenres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  'flex flex-col items-center gap-1',
                  selectedGenre === genre.id
                    ? 'border-cyber-magenta bg-cyber-magenta/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70'
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
          <label className="text-white/70 text-sm mb-3 block flex items-center justify-between">
            <span>情绪氛围</span>
            <span className="text-cyber-magenta text-xs">
              {mood < 30 ? '平静' : mood < 70 ? '舒适' : '激昂'}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-cyber-magenta
              [&::-webkit-slider-thumb]:shadow-neon-magenta
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* 节奏 BPM */}
        <div>
          <label className="text-white/70 text-sm mb-3 block flex items-center justify-between">
            <span>节奏速度</span>
            <span className="text-cyber-cyan text-xs">{tempo} BPM</span>
          </label>
          <input
            type="range"
            min="60"
            max="140"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-cyber-cyan
              [&::-webkit-slider-thumb]:shadow-neon-cyan
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* 播放模式 */}
        <div>
          <label className="text-white/70 text-sm mb-3 block">播放模式</label>
          <div className="flex gap-2">
            <button
              onClick={() => onPlayModeChange('sequential')}
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all',
                'flex items-center justify-center gap-2',
                playMode === 'sequential'
                  ? 'border-cyber-magenta bg-cyber-magenta/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
              )}
            >
              <Music2 className="w-4 h-4" />
              <span className="text-xs">顺序</span>
            </button>
            <button
              onClick={() => onPlayModeChange('random')}
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all',
                'flex items-center justify-center gap-2',
                playMode === 'random'
                  ? 'border-cyber-magenta bg-cyber-magenta/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
              )}
            >
              <Shuffle className="w-4 h-4" />
              <span className="text-xs">随机</span>
            </button>
            <button
              onClick={() => onPlayModeChange('loop')}
              className={cn(
                'flex-1 p-3 rounded-lg border transition-all',
                'flex items-center justify-center gap-2',
                playMode === 'loop'
                  ? 'border-cyber-magenta bg-cyber-magenta/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
              )}
            >
              <Repeat1 className="w-4 h-4" />
              <span className="text-xs">循环</span>
            </button>
          </div>
        </div>

        {/* 波浪强度 */}
        <div>
          <label className="text-white/70 text-sm mb-3 block flex items-center justify-between">
            <span>视觉效果强度</span>
            <span className="text-cyber-magenta text-xs">{waveIntensity}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={waveIntensity}
            onChange={(e) => setWaveIntensity(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gradient-to-r
              [&::-webkit-slider-thumb]:from-cyber-magenta
              [&::-webkit-slider-thumb]:to-cyber-cyan
              [&::-webkit-slider-thumb]:shadow-neon-magenta
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* 生成按钮 */}
        <button
          className={cn(
            'w-full py-3 rounded-lg',
            'bg-gradient-to-r from-cyber-magenta to-cyber-purple',
            'text-white font-medium',
            'hover:shadow-neon-magenta transition-all',
            'flex items-center justify-center gap-2'
          )}
        >
          <Music2 className="w-4 h-4" />
          生成音乐
        </button>
      </div>
    </div>
  );
};
