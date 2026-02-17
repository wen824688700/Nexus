# 音乐播放器集成指南

## 快速开始

### 1. 在主页中添加浮动播放器

编辑 `web/src/app/layout.tsx` 或 `web/src/app/page.tsx`：

```tsx
import { FloatingMusicPlayer } from '@/components/music';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        
        {/* 添加浮动音乐播放器 */}
        <FloatingMusicPlayer mode="floating" />
      </body>
    </html>
  );
}
```

### 2. 作为模态框使用

在任何页面组件中：

```tsx
'use client';

import { useState } from 'react';
import { FloatingMusicPlayer } from '@/components/music';
import { Music } from 'lucide-react';

export default function HomePage() {
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  return (
    <div>
      {/* 触发按钮 */}
      <button
        onClick={() => setShowMusicPlayer(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-cyber-magenta text-white flex items-center justify-center shadow-neon-magenta hover:scale-110 transition-transform"
      >
        <Music className="w-6 h-6" />
      </button>

      {/* 音乐播放器模态框 */}
      {showMusicPlayer && (
        <FloatingMusicPlayer 
          mode="modal" 
          onClose={() => setShowMusicPlayer(false)} 
        />
      )}
    </div>
  );
}
```

### 3. 在Bento Grid中添加音乐卡片

```tsx
import { Music2 } from 'lucide-react';

export function MusicCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative p-6 rounded-2xl border border-white/10 bg-cyber-dark/50 backdrop-blur-sm hover:border-cyber-magenta/50 transition-all cursor-pointer overflow-hidden"
    >
      {/* 背景动画 */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-magenta/5 to-cyber-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* 内容 */}
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-full bg-cyber-magenta/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Music2 className="w-6 h-6 text-cyber-magenta" />
        </div>
        
        <h3 className="text-white font-medium mb-2">AI 音乐</h3>
        <p className="text-white/60 text-sm">
          在主页背景播放AI生成的音乐
        </p>
      </div>

      {/* 发光效果 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-cyber-magenta/10 blur-xl" />
      </div>
    </div>
  );
}
```

## 完整示例：在HomePage中集成

```tsx
'use client';

import { useState } from 'react';
import { FloatingMusicPlayer } from '@/components/music';
import { Music2 } from 'lucide-react';

export default function HomePage() {
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  return (
    <div className="min-h-screen bg-cyber-dark">
      {/* Bento Grid */}
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-4 gap-4">
          {/* 其他卡片... */}
          
          {/* 音乐卡片 */}
          <div
            onClick={() => setShowMusicPlayer(true)}
            className="col-span-1 row-span-1 group relative p-6 rounded-2xl border border-white/10 bg-cyber-dark/50 backdrop-blur-sm hover:border-cyber-magenta/50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-cyber-magenta/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Music2 className="w-6 h-6 text-cyber-magenta" />
            </div>
            <h3 className="text-white font-medium mb-2">AI 音乐</h3>
            <p className="text-white/60 text-sm">专注氛围 · Lo-Fi</p>
          </div>
        </div>
      </div>

      {/* 音乐播放器模态框 */}
      {showMusicPlayer && (
        <FloatingMusicPlayer 
          mode="modal" 
          onClose={() => setShowMusicPlayer(false)} 
        />
      )}
    </div>
  );
}
```

## 使用全局状态管理

如果你想在多个组件间共享播放状态，可以使用现有的 `appStore`：

### 1. 更新 appStore

```typescript
// web/src/store/appStore.ts
interface AppState {
  // ... 其他状态
  
  // 音乐播放器
  showMusicPlayer: boolean;
  setShowMusicPlayer: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // ... 其他状态
  
  showMusicPlayer: false,
  setShowMusicPlayer: (show) => set({ showMusicPlayer: show }),
}));
```

### 2. 在任何组件中使用

```tsx
import { useAppStore } from '@/store/appStore';

export function MusicButton() {
  const { setShowMusicPlayer } = useAppStore();

  return (
    <button onClick={() => setShowMusicPlayer(true)}>
      打开音乐播放器
    </button>
  );
}

export function Layout({ children }) {
  const { showMusicPlayer, setShowMusicPlayer } = useAppStore();

  return (
    <>
      {children}
      {showMusicPlayer && (
        <FloatingMusicPlayer 
          mode="modal" 
          onClose={() => setShowMusicPlayer(false)} 
        />
      )}
    </>
  );
}
```

## 自定义音乐源

### 使用本地音频文件

```tsx
import { useMusicPlayer, type MusicTrack } from '@/components/music';

const localPlaylist: MusicTrack[] = [
  {
    id: '1',
    title: '深夜编码',
    artist: 'AI Composer',
    genre: 'Lo-Fi',
    url: '/audio/track1.mp3', // 放在 public/audio/ 目录
    duration: 180
  }
];

function MyPlayer() {
  const { setPlaylist } = useMusicPlayer();
  
  useEffect(() => {
    setPlaylist(localPlaylist);
  }, []);
}
```

### 集成外部音乐API

```tsx
// 示例：从API获取音乐
async function fetchMusicFromAPI() {
  const response = await fetch('/api/music/generate', {
    method: 'POST',
    body: JSON.stringify({
      genre: 'lofi',
      mood: 'calm',
      duration: 180
    })
  });
  
  const data = await response.json();
  return data.tracks;
}

function MyPlayer() {
  const { setPlaylist, playTrack } = useMusicPlayer();
  
  useEffect(() => {
    fetchMusicFromAPI().then(tracks => {
      setPlaylist(tracks);
      if (tracks.length > 0) {
        playTrack(tracks[0], 0);
      }
    });
  }, []);
}
```

## 性能优化建议

1. **懒加载**：只在需要时加载播放器组件
```tsx
import dynamic from 'next/dynamic';

const FloatingMusicPlayer = dynamic(
  () => import('@/components/music').then(mod => mod.FloatingMusicPlayer),
  { ssr: false }
);
```

2. **音频预加载**：提前加载音频文件
```tsx
useEffect(() => {
  // 预加载第一首歌
  const audio = new Audio(playlist[0].url);
  audio.preload = 'auto';
}, [playlist]);
```

3. **Canvas优化**：降低波浪渲染频率
```tsx
// 在 CyberWaveVisualizer 中
const fps = 30; // 降低到30fps
const interval = 1000 / fps;
let lastTime = 0;

const drawWave = (currentTime: number) => {
  if (currentTime - lastTime < interval) {
    animationRef.current = requestAnimationFrame(drawWave);
    return;
  }
  lastTime = currentTime;
  // ... 绘制逻辑
};
```

## 故障排查

### 音频无法播放
- 检查浏览器控制台是否有CORS错误
- 确保音频URL可访问
- 现代浏览器需要用户交互才能播放音频

### 波浪效果不显示
- 检查Canvas是否正确渲染
- 确认 `getFrequencyData` 返回有效数据
- 检查z-index层级

### 性能问题
- 降低Canvas渲染频率
- 减少波浪层数
- 使用 `will-change` CSS属性优化动画
