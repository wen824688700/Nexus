"use client";

import { useRetroOS } from "./RetroOSContext";

export function DesktopView() {
  const { actions } = useRetroOS();

  const handleDoubleClick = () => {
    actions.openWindow("folder");
  };

  return (
    <div className="p-6">
      <div
        onDoubleClick={handleDoubleClick}
        className="group flex w-20 cursor-pointer flex-col items-center"
      >
        <div className="mb-2 text-5xl transition-transform group-active:translate-y-px">📂</div>
        <span className="bg-transparent px-1 text-center text-[11px] leading-tight text-white group-active:bg-[#0a2540]">
          项目文档
        </span>
      </div>
    </div>
  );
}
