"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/cyber";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayPath, setDisplayPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== displayPath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);

      // 模拟加载时间，给组件预加载的时间
      const timer = setTimeout(() => {
        setDisplayPath(pathname);
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [pathname, displayPath]);

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <div className={isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
        {children}
      </div>
    </>
  );
}
