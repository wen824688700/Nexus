# 音乐文件目录

## 📁 如何添加音乐

1. 将你的音乐文件（.mp3, .wav, .ogg 等）放在这个目录下
2. 文件名建议使用英文或拼音，避免特殊字符

## 📝 示例文件结构

```
web/public/music/
├── lofi-1.mp3
├── lofi-2.mp3
├── ambient-1.mp3
└── chillhop-1.mp3
```

## 🎵 支持的音频格式

- MP3 (.mp3) - 推荐
- WAV (.wav) - 高质量
- OGG (.ogg) - 开源格式
- M4A (.m4a) - Apple 格式

## ⚙️ 配置播放列表

编辑 `web/src/components/music/FloatingMusicPlayer.tsx` 文件中的 `demoPlaylist` 数组：

```typescript
const demoPlaylist: MusicTrack[] = [
  {
    id: "1",
    title: "深夜编码", // 显示的歌曲名
    artist: "AI Composer", // 艺术家名
    genre: "Lo-Fi", // 音乐类型
    url: "/music/lofi-1.mp3", // 文件路径（从 public 开始）
    duration: 180, // 时长（秒）
  },
  {
    id: "2",
    title: "专注时刻",
    artist: "AI Composer",
    genre: "Ambient",
    url: "/music/ambient-1.mp3",
    duration: 240,
  },
];
```

## 🔗 URL 路径说明

- ✅ 正确：`/music/song.mp3`
- ❌ 错误：`public/music/song.mp3`
- ❌ 错误：`./music/song.mp3`

Next.js 会自动将 `public` 目录映射到网站根路径 `/`

## 🎯 快速测试

1. 放入音乐文件：`web/public/music/test.mp3`
2. 修改播放列表 URL：`url: '/music/test.mp3'`
3. 重启开发服务器：`npm run dev`
4. 访问 `/music-demo` 页面测试

## 📊 获取音频时长

如果不知道音频时长，可以：

1. 先设置为 0：`duration: 0`
2. 播放器会自动获取实际时长
3. 或使用工具查看：右键文件 → 属性 → 详细信息
