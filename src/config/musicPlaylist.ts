import type { MusicTrack } from '@/components/music';

/**
 * 音乐播放列表配置
 * 
 * 使用说明：
 * 1. 将音乐文件放在 web/public/music/ 目录下
 * 2. 在下面的数组中添加曲目信息
 * 3. url 路径格式：/music/文件名.mp3
 */

export const musicPlaylist: MusicTrack[] = [
  {
    id: '1',
    title: '深夜编码',
    artist: 'AI Composer',
    genre: 'Lo-Fi',
    url: '/music/lofi-1.mp3',  // 👈 修改这里为你的文件名
    duration: 180  // 秒，可以设为 0 让播放器自动获取
  },
  {
    id: '2',
    title: '专注时刻',
    artist: 'AI Composer',
    genre: 'Ambient',
    url: '/music/ambient-1.mp3',
    duration: 240
  },
  {
    id: '3',
    title: '创意流动',
    artist: 'AI Composer',
    genre: 'Chillhop',
    url: '/music/chillhop-1.mp3',
    duration: 200
  }
];

/**
 * 示例：使用在线音乐 URL
 * 
 * 如果你想使用在线音乐，可以这样配置：
 */
export const onlineMusicPlaylist: MusicTrack[] = [
  {
    id: '1',
    title: 'Battle symphony',
    artist: 'SoundHelix',
    genre: 'Electronic',
    url: '/music/Battle symphony.mp3',
    duration: 151
  },
  {
    id: '2',
    title: 'AI纪元已开启',
    artist: 'Cyberpunk',
    genre: 'Electronic',
    url: '/music/AI纪元已开启.mp3',
    duration: 109
  }
];

/**
 * 根据环境选择播放列表
 * 使用真实存在的音乐文件
 */
export const getPlaylist = (): MusicTrack[] => {
  // 使用 public/music 目录下真实存在的音乐文件
  return onlineMusicPlaylist;
};
