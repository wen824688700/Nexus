"use client";

import { useState, useRef } from "react";
import { 
  Bold, Italic, Code, Link, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Image
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  images?: Record<string, string>;
  onImageAdd?: (id: string, data: string) => void;
}

export function MarkdownEditor({ value, onChange, images = {}, onImageAdd }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertMarkdown = (before: string, after: string = "", newLine: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let prefix = "";
    let suffix = "";
    
    // 如果需要新行，检查前后是否有换行符
    if (newLine) {
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      
      if (beforeText && !beforeText.endsWith("\n")) {
        prefix = "\n";
      }
      if (afterText && !afterText.startsWith("\n")) {
        suffix = "\n";
      }
    }
    
    const newText =
      value.substring(0, start) +
      prefix +
      before +
      selectedText +
      after +
      suffix +
      value.substring(end);

    onChange(newText);

    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + before.length;
      textarea.setSelectionRange(newPos, newPos + selectedText.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB");
      return;
    }

    setUploading(true);

    try {
      // 转换为 Base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        
        // 生成唯一 ID
        const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // 通知父组件存储图片数据
        if (onImageAdd) {
          onImageAdd(imageId, base64);
        } else {
          console.error('❌ [MarkdownEditor] onImageAdd 未定义');
        }
        
        // 插入图片引用（使用 img:// 协议）
        const markdown = `![${file.name}](img://${imageId})`;
        insertMarkdown(markdown, "", true);
        
        setUploading(false);
      };
      reader.onerror = () => {
        console.error('❌ 图片读取失败');
        alert("图片读取失败");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("❌ 图片上传失败:", error);
      alert("图片上传失败");
      setUploading(false);
    }

    // 清空 input
    e.target.value = "";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-white/5 overflow-x-auto">
        <button
          type="button"
          onClick={() => insertMarkdown("# ", "")}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="标题 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("## ", "")}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="标题 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("### ", "")}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="标题 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="粗体"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => insertMarkdown("- ", "", true)}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("1. ", "", true)}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => insertMarkdown("> ", "", true)}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("---", "", true)}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="分割线"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => insertMarkdown("`", "`")}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="行内代码"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("[", "](url)")}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
          title="链接"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
          title="插入图片"
        >
          <Image className="w-4 h-4" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-4 bg-transparent text-white font-mono text-sm leading-relaxed resize-none focus:outline-none cyber-scrollbar"
        placeholder="开始编写你的文章..."
      />
    </div>
  );
}
