"use client";

import { useEffect, useState } from "react";
import { NeonBorder } from "@/components/cyber";
import { TrendingUp, Flame } from "lucide-react";

interface HotItem {
  time: string;
  text: string;
  url?: string;
}

export function AIHotTopics() {
  const [hotItems, setHotItems] = useState<HotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchHot = async () => {
      try {
        const res = await fetch("/api/pulse/hot?limit=20");
        const data = await res.json();
        
        if (data.items) {
          const formattedItems = data.items.map((item: any) => ({
            time: formatTime(item.date),
            text: item.title,
            url: item.url,
          }));
          setHotItems(formattedItems);
        }
      } catch (error) {
        console.error("Failed to fetch hot topics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHot();
  }, []);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "--:--";
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <NeonBorder color="magenta" className="rounded-xl">
      <div className="bg-cyber-dark/80 backdrop-blur-xl p-6 rounded-xl h-full relative overflow-hidden">
        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-magenta/30 to-transparent animate-[scan-line_3s_linear_infinite]" />
        </div>

        <div className="flex items-center gap-3 mb-4 relative z-10">
          <TrendingUp className="w-5 h-5 text-cyber-magenta" />
          <h3 className="font-orbitron font-bold text-white">AI 热点</h3>
          <div className="ml-auto flex items-center gap-2">
            <Flame className="w-3 h-3 text-cyber-magenta animate-pulse" />
            <span className="text-xs text-white/40 font-mono">HOT</span>
            <div className="w-2 h-2 rounded-full bg-cyber-magenta animate-pulse shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
          </div>
        </div>

        <div 
          className="h-[340px] overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient Masks */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-cyber-dark/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cyber-dark/80 to-transparent z-10 pointer-events-none" />

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-cyber-magenta/30 border-t-cyber-magenta rounded-full animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 border-2 border-cyber-magenta/10 rounded-full animate-ping" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-cyber-magenta text-sm font-mono font-bold tracking-wider">
                    [ TRACKING TRENDS ]
                  </div>
                  <div className="text-white/60 text-xs font-mono">
                    正在追踪全球热点动态...
                  </div>
                  <div className="flex items-center justify-center gap-1 text-cyber-magenta/60 text-xs font-mono">
                    <span className="animate-pulse">◆</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>◆</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>◆</span>
                  </div>
                </div>
              </div>
            </div>
          ) : hotItems.length > 0 ? (
            <div 
              className={`space-y-4 ${isPaused ? '' : 'animate-[news-scroll_18s_linear_infinite]'}`}
              style={{ willChange: 'transform' }}
            >
              {[...hotItems, ...hotItems].map((item, index) => (
                <div 
                  key={index} 
                  className="group border-l-2 border-cyber-magenta/30 pl-4 hover:border-cyber-magenta transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-3 h-3 text-cyber-magenta/60 group-hover:text-cyber-magenta group-hover:animate-pulse transition-all" />
                    <p className="text-xs text-white/40 font-mono group-hover:text-cyber-magenta transition-colors">
                      {item.time}
                    </p>
                  </div>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 hover:text-cyber-magenta transition-colors line-clamp-2 leading-relaxed group-hover:text-white"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <p className="text-sm text-white/70 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                      {item.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white/20" />
                </div>
                <div className="text-white/40 text-sm font-mono">暂无热点</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </NeonBorder>
  );
}
