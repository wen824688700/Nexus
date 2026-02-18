"use client";

import { useState } from "react";
import { NeonBorder, CyberButton } from "@/components/cyber";
import { Lock, Check, QrCode, MessageCircle, X } from "lucide-react";

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => boolean;
}

export function AccessCodeModal({ isOpen, onClose, onVerify }: AccessCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = onVerify(code);

    if (isValid) {
      setVerified(true);
      setError("");
      // 自动关闭弹窗
      setTimeout(() => {
        onClose();
        setVerified(false);
        setCode("");
      }, 1500);
    } else {
      setError("访问码无效，请重试");
    }
  };

  const handleClose = () => {
    setCode("");
    setError("");
    setVerified(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <NeonBorder color="cyan" className="rounded-2xl">
          <div className="bg-cyber-dark/95 rounded-2xl p-8 backdrop-blur-xl">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/60 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {verified ? (
              /* Success State */
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full border-2 border-green-500 bg-green-500/20">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-orbitron mb-2 text-2xl font-bold text-white">验证成功</h3>
                <p className="text-white/60">正在解锁内容...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="bg-cyber-cyan/20 border-cyber-cyan/50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2">
                    <Lock className="text-cyber-cyan h-8 w-8" />
                  </div>
                  <h3 className="font-orbitron mb-2 text-2xl font-bold text-white">解锁完整内容</h3>
                  <p className="text-sm text-white/60">关注公众号或添加微信获取访问码</p>
                </div>

                {/* 引流方式 */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {/* 公众号 */}
                  <div className="hover:border-cyber-cyan/50 rounded-lg border border-white/10 bg-white/5 p-4 text-center transition-colors">
                    <QrCode className="text-cyber-cyan mx-auto mb-2 h-8 w-8" />
                    <p className="mb-1 text-sm font-medium text-white">扫码关注公众号</p>
                    <p className="text-cyber-cyan text-xs">回复「AI」获取</p>
                  </div>

                  {/* 微信 */}
                  <div className="hover:border-cyber-magenta/50 rounded-lg border border-white/10 bg-white/5 p-4 text-center transition-colors">
                    <MessageCircle className="text-cyber-magenta mx-auto mb-2 h-8 w-8" />
                    <p className="mb-1 text-sm font-medium text-white">添加微信</p>
                    <p className="text-cyber-magenta text-xs">apex_ai2024</p>
                  </div>
                </div>

                {/* 访问码输入 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setError("");
                      }}
                      placeholder="输入访问码"
                      className="focus:border-cyber-cyan/50 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center tracking-widest text-white uppercase transition-colors placeholder:text-white/40 focus:outline-none"
                      maxLength={10}
                    />
                    {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
                  </div>

                  <div className="flex gap-3">
                    <CyberButton
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      稍后
                    </CyberButton>
                    <CyberButton type="submit" className="flex-1">
                      解锁
                    </CyberButton>
                  </div>
                </form>

                {/* 提示 */}
                <p className="mt-4 text-center text-xs text-white/40">访问码不区分大小写</p>
              </>
            )}
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
