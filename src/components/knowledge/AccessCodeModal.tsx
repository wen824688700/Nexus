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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <NeonBorder color="cyan" className="rounded-2xl">
          <div className="bg-cyber-dark/95 backdrop-blur-xl p-8 rounded-2xl">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {verified ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-orbitron font-bold text-2xl text-white mb-2">
                  验证成功
                </h3>
                <p className="text-white/60">正在解锁内容...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-cyber-cyan/20 border-2 border-cyber-cyan/50 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-cyber-cyan" />
                  </div>
                  <h3 className="font-orbitron font-bold text-2xl text-white mb-2">
                    解锁完整内容
                  </h3>
                  <p className="text-white/60 text-sm">
                    关注公众号或添加微信获取访问码
                  </p>
                </div>

                {/* 引流方式 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* 公众号 */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center hover:border-cyber-cyan/50 transition-colors">
                    <QrCode className="w-8 h-8 text-cyber-cyan mx-auto mb-2" />
                    <p className="text-white text-sm font-medium mb-1">扫码关注公众号</p>
                    <p className="text-cyber-cyan text-xs">回复「AI」获取</p>
                  </div>

                  {/* 微信 */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center hover:border-cyber-magenta/50 transition-colors">
                    <MessageCircle className="w-8 h-8 text-cyber-magenta mx-auto mb-2" />
                    <p className="text-white text-sm font-medium mb-1">添加微信</p>
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center tracking-widest placeholder:text-white/40 focus:outline-none focus:border-cyber-cyan/50 transition-colors uppercase"
                      maxLength={10}
                    />
                    {error && (
                      <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
                    )}
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
                <p className="mt-4 text-center text-xs text-white/40">
                  访问码不区分大小写
                </p>
              </>
            )}
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
