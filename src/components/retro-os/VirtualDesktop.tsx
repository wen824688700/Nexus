"use client";

import { useRetroOS } from "./RetroOSContext";
import { BootSequence } from "./BootSequence";
import { ShutdownScreen } from "./ShutdownScreen";
import { DesktopView } from "./DesktopView";
import { WindowManager } from "./WindowManager";
import { Taskbar } from "./Taskbar";

export function VirtualDesktop() {
  const { state, actions } = useRetroOS();

  if (state.powerState === "off") {
    return <div className="h-full w-full bg-black" />;
  }

  if (state.powerState === "booting") {
    return <BootSequence onComplete={() => actions.setPowerState("on")} />;
  }

  if (state.powerState === "shutting_down") {
    return <ShutdownScreen />;
  }

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#0a3a3a] to-[#051a1a]">
      <DesktopView />
      <WindowManager />
      <Taskbar />
    </div>
  );
}
