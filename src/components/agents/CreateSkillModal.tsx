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
    setParameters([...parameters, { name: "", type: "string", required: true, description: "" }]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleParameterChange = (
    index: number,
    field: keyof SkillParameter,
    value: string | boolean,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <NeonBorder color="cyan" className="rounded-2xl">
          <div className="bg-cyber-dark/95 rounded-2xl p-8 backdrop-blur-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-orbitron text-2xl font-bold text-white">创建自定义技能</h2>
              <button
                onClick={onClose}
                className="text-white/60 transition-colors hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">技能名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="focus:border-cyber-cyan/50 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors placeholder:text-white/40 focus:outline-none"
                  placeholder="例如：文本翻译"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">技能描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="focus:border-cyber-cyan/50 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors placeholder:text-white/40 focus:outline-none"
                  placeholder="描述这个技能的功能..."
                />
              </div>

              {/* API Endpoint */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">API 端点</label>
                <input
                  type="url"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  required
                  className="focus:border-cyber-cyan/50 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors placeholder:text-white/40 focus:outline-none"
                  placeholder="https://api.example.com/translate"
                />
              </div>

              {/* Parameters */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-medium text-white/80">参数配置</label>
                  <button
                    type="button"
                    onClick={handleAddParameter}
                    className="text-cyber-cyan flex items-center gap-1 text-sm transition-colors hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    添加参数
                  </button>
                </div>

                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <div
                      key={index}
                      className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">参数 {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveParameter(index)}
                          className="text-red-400 transition-colors hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                          placeholder="参数名"
                          className="focus:border-cyber-cyan/50 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                        />
                        <select
                          value={param.type}
                          onChange={(e) => handleParameterChange(index, "type", e.target.value)}
                          className="focus:border-cyber-cyan/50 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
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
                        className="focus:border-cyber-cyan/50 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                      />

                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) =>
                            handleParameterChange(index, "required", e.target.checked)
                          }
                          className="text-cyber-cyan focus:ring-cyber-cyan/50 rounded border-white/20 bg-white/5"
                        />
                        必填参数
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <CyberButton type="button" variant="outline" onClick={onClose} className="flex-1">
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
