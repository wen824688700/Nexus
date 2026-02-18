# 音乐播放器组件

完整的赛博朋克风格AI音乐播放器，包含音频可视化和设置面板。

## 功能特性

### 1. 基础播放控制

- ✅ 播放/暂停
- ✅ 上一首/下一首
- ✅ 音量控制
- ✅ 进度条拖动
- ✅ 播放模式（顺序/随机/循环）

### 2. 赛博波浪可视化

- ✅ 实时音频频谱分析
- ✅ 多层波浪效果
- ✅ 霓虹发光渐变
- ✅ 跟随音乐律动

### 3. 设置面板

- ✅ 音乐风格选择（Lo-Fi、Ambient、Chillhop等）
- ✅ 情绪氛围滑块
- ✅ 节奏BPM调节
- ✅ 播放模式切换
- ✅ 视觉效果强度

### 4. 两种显示模式

- **浮动模式**：右下角小部件，可展开控制面板
- **模态框模式**：全屏居中显示，完整功能

## 使用方法

### 浮动模式（小部件）

```tsx
import { FloatingMusicPlayer } from "@/components/music";

export default function Page() {
  return (
    <>
      <FloatingMusicPlayer mode="floating" />
      {/* 你的页面内容 */}
    </>
  );
}
```

### 模态框模式

```tsx
import { useState } from "react";
import { FloatingMusicPlayer } from "@/components/music";

export default function Page() {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <>
      <button onClick={() => setShowPlayer(true)}>打开音乐播放器</button>

      {showPlayer && <FloatingMusicPlayer mode="modal" onClose={() => setShowPlayer(false)} />}
    </>
  );
}
```

### 仅使用波浪可视化

```tsx
import { CyberWaveVisualizer } from "@/components/music";
import { useMusicPlayer } from "@/components/music";

export default function Page() {
  const { isPlaying, getFrequencyData } = useMusicPlayer();

  return (
    <>
      <CyberWaveVisualizer isPlaying={isPlaying} getFrequencyData={getFrequencyData} />
      {/* 你的页面内容 */}
    </>
  );
}
```

## 组件结构

```
web/src/components/music/
├── FloatingMusicPlayer.tsx      # 主播放器组件
├── CyberWaveVisualizer.tsx      # 波浪可视化
├── MusicSettingsPanel.tsx       # 设置面板
├── MusicLightEffect.tsx         # 条状律动效果（旧版）
├── useMusicPlayer.ts            # 播放器Hook
├── index.ts                     # 导出文件
└── README.md                    # 文档
```

## 自定义播放列表

```tsx
import { useMusicPlayer, type MusicTrack } from "@/components/music";

const myPlaylist: MusicTrack[] = [
  {
    id: "1",
    title: "我的音乐",
    artist: "AI Composer",
    genre: "Lo-Fi",
    url: "https://example.com/music.mp3",
    duration: 180,
  },
];

function MyPlayer() {
  const { setPlaylist, playTrack } = useMusicPlayer();

  useEffect(() => {
    setPlaylist(myPlaylist);
    playTrack(myPlaylist[0], 0);
  }, []);

  // ...
}
```

## 技术实现

- **音频处理**：Web Audio API
- **频谱分析**：AnalyserNode
- **波浪渲染**：Canvas API
- **状态管理**：React Hooks
- **样式**：Tailwind CSS + 自定义赛博朋克主题

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 支持（需要用户交互启动音频）

## 注意事项

1. **音频自动播放**：现代浏览器需要用户交互才能播放音频
2. **CORS**：音频文件需要正确的CORS头
3. **性能**：Canvas动画使用requestAnimationFrame优化
4. **移动端**：建议使用模态框模式以获得更好体验
