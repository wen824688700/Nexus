"use client";

import { useState, useEffect } from "react";

const BOOT_LOGS = [
  "NOOS ROM BIOS v1.0.24",
  "Copyright (C) 1996-2026 NOOS Tech.",
  " ",
  "Main Processor: AI-Engine 8086 @ 4.20GHz",
  "Memory Test: 65536KB OK",
  "Detecting Primary Master ... Found [ST320410A]",
  "Detecting Secondary Master ... Found [NOOS-RAG-DRIVE]",
  " ",
  "Verifying DMI Pool Data ........ Success",
  "Loading NOOS Kernel ....................",
  "Starting Personal Digital Identity System...",
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [bootIndex, setBootIndex] = useState(0);

  useEffect(() => {
    if (bootIndex < BOOT_LOGS.length) {
      const timer = setTimeout(
        () => {
          setBootIndex(bootIndex + 1);
        },
        Math.random() * 300 + 100,
      );
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [bootIndex, onComplete]);

  return (
    <div className="h-full w-full bg-black p-6 font-mono text-[11px] leading-tight text-[#39ff14]">
      {BOOT_LOGS.slice(0, bootIndex).map((log, i) => (
        <p key={i}>{log}</p>
      ))}
      {bootIndex < BOOT_LOGS.length && (
        <div className="ml-1 inline-block h-4 w-2 animate-pulse bg-[#39ff14]" />
      )}
    </div>
  );
}
