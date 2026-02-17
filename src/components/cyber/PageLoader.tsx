"use client";

import React from 'react';

interface PageLoaderProps {
  isLoading: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-cyber-dark/95 backdrop-blur-xl">
      {/* 背景网格 */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* 加载动画 */}
      <div className="relative flex flex-col items-center gap-6">
        {/* 旋转的六边形 */}
        <div className="relative h-24 w-24">
          {/* 外圈 */}
          <div className="absolute inset-0 animate-spin-slow">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="2"
                className="animate-pulse"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ff00ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7000ff" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 中圈 */}
          <div className="absolute inset-2 animate-spin-reverse">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="url(#gradient2)"
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
              <defs>
                <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7000ff" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ff00ff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 内圈 - 发光核心 */}
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-cyber-cyan shadow-[0_0_20px_#00f3ff,0_0_40px_#00f3ff]" />
          </div>
        </div>

        {/* 加载文字 */}
        <div className="flex flex-col items-center gap-2">
          <div className="font-orbitron text-lg font-bold tracking-wider text-white">
            <span className="inline-block animate-pulse">LOADING</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.3s' }}>.</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/60">
            Initializing System
          </p>
        </div>

        {/* 进度条 */}
        <div className="relative h-1 w-64 overflow-hidden rounded-full bg-white/10">
          <div className="absolute inset-0 animate-loading-bar bg-gradient-to-r from-cyber-cyan via-cyber-magenta to-cyber-purple" />
        </div>
      </div>
    </div>
  );
};
