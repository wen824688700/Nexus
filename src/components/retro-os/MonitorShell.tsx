"use client";

import { CRTScreen } from "./CRTScreen";
import { useRetroOS } from "./RetroOSContext";

export function MonitorShell() {
  const { state, actions } = useRetroOS();

  return (
    <div className="relative mx-auto w-full max-w-[1100px]">
      {/* 外壳主体 - 米黄色厚重边框 */}
      <div className="relative rounded-xl border-r-[12px] border-b-[16px] border-r-[#b8a888] border-b-[#9d8f70] bg-gradient-to-br from-[#f5f0e1] via-[#e8dcc4] to-[#d4c4a8] p-4 shadow-[6px_6px_0_#d4c4a8,10px_10px_0_#b8a888,14px_14px_0_#9d8f70,18px_18px_30px_rgba(0,0,0,0.4)] md:border-r-[20px] md:border-b-[24px] md:p-8 md:shadow-[8px_8px_0_#d4c4a8,12px_12px_0_#b8a888,16px_16px_0_#9d8f70,20px_20px_40px_rgba(0,0,0,0.4)]">
        {/* 内层深色边框 */}
        <div className="relative rounded-lg bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] p-3 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] md:p-6">
          {/* 屏幕区域 */}
          <CRTScreen />
        </div>

        {/* 底部面板 */}
        <div className="relative mt-3 flex items-center justify-between px-2 md:mt-6 md:px-4">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-lg font-black tracking-tighter text-[#6b5d4f] italic md:text-2xl">
              NOOS-3000
            </span>
            <div className="flex gap-1.5 md:gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all md:h-3 md:w-3 ${
                  state.powerState !== "off"
                    ? "bg-[#39ff14] shadow-[0_0_12px_#39ff14]"
                    : "bg-[#1a3311]"
                }`}
              />
              <div className="h-2.5 w-2.5 rounded-full bg-[#8b0000]/40 md:h-3 md:w-3" />
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              actions.togglePower();
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-3 shadow-lg transition-all active:scale-95 md:h-14 md:w-14 md:border-4 ${
              state.powerState !== "off"
                ? "border-[#d4c4a8] bg-gradient-to-br from-[#5a5a5a] to-[#3a3a3a] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                : "border-[#9d8f70] bg-gradient-to-br from-[#4a4a4a] to-[#2a2a2a]"
            }`}
            aria-label={state.powerState !== "off" ? "关机" : "开机"}
          >
            <span className="text-[10px] font-bold text-[#e8dcc4] md:text-xs">I/O</span>
          </button>
        </div>
      </div>
    </div>
  );
}
