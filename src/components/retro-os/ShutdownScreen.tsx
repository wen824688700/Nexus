"use client";

export function ShutdownScreen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black text-center font-mono text-orange-400">
      <p className="mb-2">正在保存系统设置...</p>
      <div className="h-1 w-32 overflow-hidden rounded-full bg-orange-900">
        <div className="h-full animate-[progress_1.5s_linear] bg-orange-400" />
      </div>
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
