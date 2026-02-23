"use client";

import { VirtualDesktop } from "./VirtualDesktop";
import { useRetroOS } from "./RetroOSContext";

export function CRTScreen() {
  const { state } = useRetroOS();

  return (
    <div
      className={`relative w-full overflow-hidden border-[16px] border-[#0a0a0a] bg-black transition-all duration-500 ${
        state.powerState === "booting"
          ? "animate-[crt-on_0.5s_forwards]"
          : state.powerState === "off"
            ? ""
            : "shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]"
      }`}
      style={{
        height: "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 200px)",
        maxHeight: "600px",
      }}
    >
      <VirtualDesktop />

      {/* 扫视线滤镜 */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-[0.05]" />

      {/* 边缘阴影 */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]" />

      <style jsx>{`
        @keyframes crt-on {
          0% {
            transform: scaleY(0.005) scaleX(0);
            opacity: 0;
          }
          50% {
            transform: scaleY(0.005) scaleX(1);
            opacity: 1;
          }
          100% {
            transform: scaleY(1) scaleX(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
