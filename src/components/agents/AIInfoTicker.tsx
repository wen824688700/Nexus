"use client";

import { useEffect, useState } from "react";
import { NeonBorder } from "@/components/cyber";
import { Newspaper } from "lucide-react";

interface NewsItem {
  time: string;
  text: string;
  url?: string;
}

export function AIInfoTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/pulse/news?limit=20");
        const data = await res.json();
        
        if (data.items) {
          const formattedItems = data.items.map((item: any) => ({
            time: formatTime(item.date),
            text: item.title,
            url: item.url,
          }));
          setNewsItems(formattedItems);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
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
    <NeonBorder color="cyan" className="rounded-xl">
      <div className="bg-cyber-dark/80 backdrop-blur-xl p-6 rounded-xl h-full relative overflow-hidden">
        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent animate-[scan-line_4s_linear_infinite]" />
        </div>

        <div className="flex items-center gap-3 mb-4 relative z-10">
          <Newspaper className="w-5 h-5 text-cyber-cyan" />
          <h3 className="font-orbitron font-bold text-white">AI 资讯</h3>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-white/40 font-mono">LIVE</span>
            <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
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
                  <div className="w-12 h-12 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 border-2 border-cyber-cyan/10 rounded-full animate-ping" />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-cyber-cyan text-sm font-mono font-bold tracking-wider">
                    [ SCANNING NETWORK ]
                  </div>
                  <div className="text-white/60 text-xs font-mono">
                    正在全网抓取实时资讯...
                  </div>
                  <div className="flex items-center justify-center gap-1 text-cyber-cyan/60 text-xs font-mono">
                    <span className="animate-pulse">▸</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>▸</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>▸</span>
                  </div>
                </div>
              </div>
            </div>
          ) : newsItems.length > 0 ? (
            <div 
              className={`space-y-4 ${isPaused ? '' : 'animate-[news-scroll_25s_linear_infinite]'}`}
              style={{ willChange: 'transform' }}
            >
              {[...newsItems, ...newsItems].map((item, index) => (
                <div 
                  key={index} 
                  className="group border-l-2 border-cyber-cyan/30 pl-4 hover:border-cyber-cyan transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-1 rounded-full bg-cyber-cyan/60 group-hover:bg-cyber-cyan group-hover:shadow-[0_0_8px_rgba(0,243,255,0.8)] transition-all" />
                    <p className="text-xs text-white/40 font-mono group-hover:text-cyber-cyan transition-colors">
                      {item.time}
                    </p>
                  </div>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 hover:text-cyber-cyan transition-colors line-clamp-2 leading-relaxed group-hover:text-white"
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
                  <Newspaper className="w-6 h-6 text-white/20" />
                </div>
                <div className="text-white/40 text-sm font-mono">暂无资讯</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </NeonBorder>
  );
}
