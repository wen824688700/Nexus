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
          const formattedItems = data.items.map(
            (item: { date: string; title: string; url: string }) => ({
              time: formatTime(item.date),
              text: item.title,
              url: item.url,
            }),
          );
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
      <div className="bg-cyber-dark/80 relative h-full overflow-hidden rounded-xl p-6 backdrop-blur-xl">
        {/* Scan Line Effect */}
        <div className="pointer-events-none absolute inset-0">
          <div className="via-cyber-cyan/30 absolute h-[2px] w-full animate-[scan-line_4s_linear_infinite] bg-gradient-to-r from-transparent to-transparent" />
        </div>

        <div className="relative z-10 mb-4 flex items-center gap-3">
          <Newspaper className="text-cyber-cyan h-5 w-5" />
          <h3 className="font-orbitron font-bold text-white">AI 资讯</h3>
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-xs text-white/40">LIVE</span>
            <div className="bg-cyber-cyan h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
          </div>
        </div>

        <div
          className="relative h-[340px] overflow-y-auto overflow-x-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Gradient Masks */}
          <div className="from-cyber-dark/80 pointer-events-none absolute top-0 right-0 left-0 z-10 h-12 bg-gradient-to-b to-transparent" />
          <div className="from-cyber-dark/80 pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-12 bg-gradient-to-t to-transparent" />

          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="border-cyber-cyan/30 border-t-cyber-cyan h-12 w-12 animate-spin rounded-full border-2" />
                  <div className="border-cyber-cyan/10 absolute inset-0 h-12 w-12 animate-ping rounded-full border-2" />
                </div>
                <div className="space-y-2 text-center">
                  <div className="text-cyber-cyan font-mono text-sm font-bold tracking-wider">
                    [ SCANNING NETWORK ]
                  </div>
                  <div className="font-mono text-xs text-white/60">正在全网抓取实时资讯...</div>
                  <div className="text-cyber-cyan/60 flex items-center justify-center gap-1 font-mono text-xs">
                    <span className="animate-pulse">▸</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>
                      ▸
                    </span>
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>
                      ▸
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : newsItems.length > 0 ? (
            <div
              className={`space-y-4 ${isPaused ? "" : "animate-[news-scroll_25s_linear_infinite]"}`}
              style={{ willChange: "transform" }}
            >
              {(isPaused ? newsItems : [...newsItems, ...newsItems]).map((item, index) => (
                <div
                  key={index}
                  className="group border-cyber-cyan/30 hover:border-cyber-cyan border-l-2 pl-4 transition-all duration-300"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <div className="bg-cyber-cyan/60 group-hover:bg-cyber-cyan h-1 w-1 rounded-full transition-all group-hover:shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
                    <p className="group-hover:text-cyber-cyan font-mono text-xs text-white/40 transition-colors">
                      {item.time}
                    </p>
                  </div>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyber-cyan line-clamp-2 text-sm leading-relaxed text-white/70 transition-colors group-hover:text-white"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <p className="line-clamp-2 text-sm leading-relaxed text-white/70 transition-colors group-hover:text-white">
                      {item.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  <Newspaper className="h-6 w-6 text-white/20" />
                </div>
                <div className="font-mono text-sm text-white/40">暂无资讯</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </NeonBorder>
  );
}
