import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 默认使用 Turbopack，无需额外配置
  // 如果需要配置 Turbopack，使用空对象即可
  turbopack: {},
  
  // 优化图片加载
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
