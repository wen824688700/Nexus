"use client";

import { useState } from "react";
import { NeonBorder, CyberButton } from "@/components/cyber";
import { X, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import type { SkillParameter } from "@/types";

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSkillModal({ isOpen, onClose }: CreateSkillModalProps) {
  const addCustomSkill = useAppStore((state) => state.addCustomSkill);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [parameters, setParameters] = useState<SkillParameter[]>([]);

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      { name: "", type: "string", required: true, description: "" },
    ]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleParameterChange = (
    index: number,
    field: keyof SkillParameter,
    value: any
  ) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    setParameters(newParameters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addCustomSkill({
      name,
      description,
      apiEndpoint,
      parameters,
    });

    // Reset form
    setName("");
    setDescription("");
    setApiEndpoint("");
    setParameters([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <NeonBorder color="cyan" className="rounded-2xl">
          <div className="bg-cyber-dark/95 backdrop-blur-xl p-8 rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-orbitron font-bold text-white">
                创建自定义技能
              </h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  技能名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-cyber-cyan/50 transition-colors"
                  placeholder="例如：文本翻译"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  技能描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-cyber-cyan/50 transition-colors resize-none"
                  placeholder="描述这个技能的功能..."
                />
              </div>

              {/* API Endpoint */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  API 端点
                </label>
                <input
                  type="url"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-cyber-cyan/50 transition-colors"
                  placeholder="https://api.example.com/translate"
                />
              </div>

              {/* Parameters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white/80">
                    参数配置
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParameter}
                    className="text-cyber-cyan hover:text-white transition-colors text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    添加参数
                  </button>
                </div>

                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">参数 {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveParameter(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) =>
                            handleParameterChange(index, "name", e.target.value)
                          }
                          placeholder="参数名"
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-cyber-cyan/50"
                        />
                        <select
                          value={param.type}
                          onChange={(e) =>
                            handleParameterChange(index, "type", e.target.value)
                          }
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-cyber-cyan/50"
                        >
                          <option value="string">字符串</option>
                          <option value="number">数字</option>
                          <option value="boolean">布尔值</option>
                          <option value="file">文件</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        value={param.description}
                        onChange={(e) =>
                          handleParameterChange(index, "description", e.target.value)
                        }
                        placeholder="参数描述"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-cyber-cyan/50"
                      />

                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) =>
                            handleParameterChange(index, "required", e.target.checked)
                          }
                          className="rounded border-white/20 bg-white/5 text-cyber-cyan focus:ring-cyber-cyan/50"
                        />
                        必填参数
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <CyberButton
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  取消
                </CyberButton>
                <CyberButton type="submit" className="flex-1">
                  创建技能
                </CyberButton>
              </div>
            </form>
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
