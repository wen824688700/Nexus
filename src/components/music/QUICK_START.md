# 音乐播放器 - 快速开始

## 📍 文件位置

所有组件都在 `web/src/components/music/` 目录下：

```
web/src/components/music/
├── FloatingMusicPlayer.tsx      # ⭐ 主播放器（两种模式）
├── CyberWaveVisualizer.tsx      # 🌊 波浪可视化
├── MusicSettingsPanel.tsx       # ⚙️ 设置面板
├── useMusicPlayer.ts            # 🎵 播放器Hook
├── MusicLightEffect.tsx         # 💡 旧版律动效果
└── index.ts                     # 📦 导出文件
```

## 🚀 三步集成

### 1️⃣ 浮动模式（推荐用于全局）

在 `web/src/app/layout.tsx` 添加：

```tsx
import { FloatingMusicPlayer } from "@/components/music";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <FloatingMusicPlayer mode="floating" />
      </body>
    </html>
  );
}
```

**效果**：右下角出现可旋转的光碟图标，点击展开控制面板

---

### 2️⃣ 模态框模式（推荐用于专注体验）

在任何页面组件中：

```tsx
"use client";

import { useState } from "react";
import { FloatingMusicPlayer } from "@/components/music";

export default function Page() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button onClick={() => setShow(true)}>打开音乐</button>
      {show && <FloatingMusicPlayer mode="modal" onClose={() => setShow(false)} />}
    </>
  );
}
```

**效果**：全屏居中显示，包含完整控制界面和底部波浪效果

---

### 3️⃣ 查看演示页面

访问：`http://localhost:3000/music-demo`

## 🎨 主要功能

### 基础播放

- ▶️ 播放/暂停
- ⏭️ 上一首/下一首
- 🔊 音量控制
- ⏱️ 进度条拖动

### 视觉效果

- 🌊 **赛博波浪**：页面底部跟随音乐律动
- 💿 **旋转光碟**：播放时自动旋转
- ✨ **霓虹发光**：赛博朋克风格UI

### 设置面板（点击光碟图标）

- 🎵 音乐风格选择（Lo-Fi、Ambient等）
- 😌 情绪氛围滑块
- 🎹 节奏BPM调节
- 🔄 播放模式（顺序/随机/循环）
- 🎨 视觉效果强度

## 🎯 关键组件说明

### FloatingMusicPlayer

主播放器组件，支持两种模式：

```tsx
<FloatingMusicPlayer
  mode="floating" // 或 "modal"
  onClose={() => {}} // 仅modal模式需要
/>
```

### CyberWaveVisualizer

独立的波浪可视化组件：

```tsx
<CyberWaveVisualizer isPlaying={true} getFrequencyData={() => new Uint8Array()} />
```

### useMusicPlayer Hook

完整的播放器逻辑：

```tsx
const {
  isPlaying,
  currentTrack,
  volume,
  togglePlay,
  playNext,
  playPrevious,
  setVolume,
  getFrequencyData,
} = useMusicPlayer();
```

## 🎵 自定义播放列表

```tsx
import { useMusicPlayer, type MusicTrack } from "@/components/music";

const myTracks: MusicTrack[] = [
  {
    id: "1",
    title: "我的音乐",
    artist: "AI Composer",
    genre: "Lo-Fi",
    url: "/audio/track1.mp3",
    duration: 180,
  },
];

function MyPlayer() {
  const { setPlaylist, playTrack } = useMusicPlayer();

  useEffect(() => {
    setPlaylist(myTracks);
    playTrack(myTracks[0], 0);
  }, []);
}
```

## 🎨 样式定制

所有颜色都在 `tailwind.config.ts` 中定义：

```typescript
colors: {
  cyber: {
    dark: '#0a0a0f',
    cyan: '#00f3ff',
    magenta: '#ff00ff',
    purple: '#7000ff',
  }
}
```

## ⚡ 性能提示

1. **懒加载**：使用 `dynamic` 导入
2. **音频预加载**：提前加载音频文件
3. **降低FPS**：Canvas渲染可降至30fps

## 🐛 常见问题

**Q: 音频无法播放？**
A: 现代浏览器需要用户交互才能播放音频，确保在点击事件后调用 `play()`

**Q: 波浪效果不显示？**
A: 检查 `getFrequencyData` 是否返回有效数据，确认音频上下文已初始化

**Q: 如何更换音乐源？**
A: 修改 `FloatingMusicPlayer.tsx` 中的 `demoPlaylist` 数组

## 📚 更多文档

- `README.md` - 完整功能说明
- `INTEGRATION_GUIDE.md` - 详细集成指南
- `music-demo` 页面 - 实时演示

## 🎉 开始使用

1. 复制上面的代码到你的页面
2. 访问 `/music-demo` 查看效果
3. 根据需要调整样式和功能

就这么简单！🚀
